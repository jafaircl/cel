/* eslint-disable no-case-declarations */
import {
  ErrorSetSchema,
  ExprValue,
  ExprValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import {
  Constant,
  Expr,
  Expr_Call,
  Expr_Comprehension,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_Ident,
  Expr_Select,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import {
  MapValue_Entry,
  MapValue_EntrySchema,
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { StatusSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb.js';
import { create, createRegistry } from '@bufbuild/protobuf';
import {
  Any,
  AnySchema,
  BoolValue,
  BoolValueSchema,
  BytesValue,
  BytesValueSchema,
  DoubleValue,
  DoubleValueSchema,
  FloatValue,
  FloatValueSchema,
  Int32Value,
  Int32ValueSchema,
  Int64Value,
  Int64ValueSchema,
  NullValue,
  NullValueSchema,
  StringValue,
  StringValueSchema,
  UInt32Value,
  UInt32ValueSchema,
  UInt64Value,
  UInt64ValueSchema,
  anyPack,
  anyUnpack,
} from '@bufbuild/protobuf/wkt';
import { ACCUMULATOR_VAR } from './constants';
import { base_functions } from './functions';
import { StartContext } from './gen/CELParser';
import { CELParser } from './parser';
import { Binding } from './types';
import { isNil } from './util';

export class CELProgram {
  #ERROR = create(ValueSchema, {
    kind: {
      case: 'stringValue',
      value: '<<error>>',
    },
  });
  #bindings: Record<string, Binding> = {
    ...base_functions,
    [ACCUMULATOR_VAR]: create(ValueSchema, {
      kind: {
        case: 'nullValue',
        value: NullValue.NULL_VALUE,
      },
    }),
  };
  #errors = create(ErrorSetSchema);

  constructor(
    private readonly ast: StartContext,
    private readonly registry: ReturnType<typeof createRegistry>,
    private readonly container = ''
  ) {}

  parse() {
    const parser = new CELParser();
    return this.ast.accept(parser);
  }

  eval(bindings?: Record<string, Binding>): ExprValue {
    this.#bindings = { ...this.#bindings, ...(bindings ?? {}) };
    const parser = new CELParser();
    const intermediateResult = this.ast.accept(parser);
    if (parser.errors.errors.length > 0) {
      return create(ExprValueSchema, {
        kind: {
          case: 'error',
          value: parser.errors,
        },
      });
    }
    let value = this._evalInternal(intermediateResult, this.#bindings);
    value = this._checkOverflow(value);
    if (
      this.#errors.errors.length > 0 &&
      value.kind.value === this.#ERROR.kind.value
    ) {
      return create(ExprValueSchema, {
        kind: {
          case: 'error',
          value: this.#errors,
        },
      });
    }
    return create(ExprValueSchema, {
      kind: {
        case: 'value',
        value,
      },
    });
  }

  private _evalInternal(expr: Expr, bindings: Record<string, Binding>): Value {
    switch (expr.exprKind.case) {
      case 'identExpr':
        return this._evalIdent(expr.exprKind.value, bindings);
      case 'callExpr':
        return this._evalCall(expr.exprKind.value, bindings);
      case 'constExpr':
        return this._evalConstant(expr.exprKind.value, bindings);
      case 'structExpr':
        return this._evalStruct(expr.exprKind.value, bindings);
      case 'listExpr':
        return this._evalList(expr.exprKind.value, bindings);
      case 'selectExpr':
        return this._evalSelect(expr.exprKind.value, bindings);
      case 'comprehensionExpr':
        return this._evalComprehension(expr.exprKind.value, bindings);
      default:
        throw new Error(`Unknown expression kind: ${expr.exprKind.case}`);
    }
  }

  private _evalSelect(
    select: Expr_Select,
    bindings: Record<string, Binding>
  ): Value {
    if (!select.operand) {
      this.#errors.errors.push(
        create(StatusSchema, {
          code: 0,
          message: 'missing operand',
        })
      );
      return this.#ERROR;
    }
    const operand = this._evalInternal(select.operand, bindings);
    switch (operand.kind.case) {
      case 'mapValue':
        const mapValue = operand.kind.value.entries.find(
          (entry) => entry.key?.kind.value === select.field
        );
        if (select.testOnly) {
          return create(ValueSchema, {
            kind: {
              case: 'boolValue',
              value: !!mapValue?.value?.kind.value,
            },
          });
        }
        if (!mapValue) {
          this.#errors.errors.push(
            create(StatusSchema, {
              code: 0,
              message: `unknown field '${select.field}'`,
            })
          );
          return this.#ERROR;
        }
        return mapValue.value as Value;
      case 'objectValue':
        const message = anyUnpack(operand.kind.value, this.registry);
        if (!message) {
          this.#errors.errors.push(
            create(StatusSchema, {
              code: 0,
              message: 'cannot unpack message',
            })
          );
          return this.#ERROR;
        }
        const messageDesc = this.registry.getMessage(message.$typeName);
        const field = messageDesc?.fields.find(
          (field) => field.jsonName === select.field
        );
        if (!field) {
          this.#errors.errors.push(
            create(StatusSchema, {
              code: 0,
              message: `unknown field '${select.field}'`,
            })
          );
          return this.#ERROR;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (message as any)[field.name];
        if (!value) {
          return create(ValueSchema, {
            kind: {
              case: 'nullValue',
              value: NullValue.NULL_VALUE,
            },
          });
        }
        // TODO: handle other types
        return value;
      default:
        return this.#ERROR;
    }
  }

  private _evalStruct(
    struct: Expr_CreateStruct,
    bindings: Record<string, Binding>
  ) {
    if (struct.messageName && struct.messageName !== '') {
      // This is a message, not a struct
      let messageDesc = this.registry.getMessage(struct.messageName);
      // If a message isn't found, try to find one in the container
      if (!messageDesc && this.container) {
        const typeName = `${this.container ? `${this.container}.` : ''}${
          struct.messageName
        }`;
        messageDesc = this.registry.getMessage(typeName);
      }
      // If there's still no message, push an error
      if (!messageDesc) {
        this.#errors.errors.push(
          create(StatusSchema, {
            code: 0,
            message: `unknown message type '${struct.messageName}'`,
          })
        );
        return this.#ERROR;
      }
      const message = create(messageDesc);
      for (const entry of struct.entries) {
        const key = entry.keyKind.value as string;
        const value = this._evalInternal(entry.value as Expr, bindings);
        const field = messageDesc.fields.find((f) => f.name === key);
        if (!field) {
          continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (message as any)[field.jsonName] = value.kind.value;
      }
      switch (messageDesc.typeName) {
        case BoolValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'boolValue',
              value: (message as BoolValue).value,
            },
          });
        case BytesValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'bytesValue',
              value: (message as BytesValue).value,
            },
          });
        case DoubleValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'doubleValue',
              value: (message as DoubleValue).value,
            },
          });
        case FloatValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'doubleValue',
              value: (message as FloatValue).value,
            },
          });
        case Int32ValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'doubleValue',
              value: (message as Int32Value).value,
            },
          });
        case Int64ValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'int64Value',
              value: (message as Int64Value).value,
            },
          });
        case StringValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'stringValue',
              value: (message as StringValue).value,
            },
          });
        case UInt32ValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'doubleValue',
              value: (message as UInt32Value).value,
            },
          });
        case UInt64ValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'uint64Value',
              value: (message as UInt64Value).value,
            },
          });
        case NullValueSchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'nullValue',
              value: NullValue.NULL_VALUE,
            },
          });
        case AnySchema.typeName:
          return create(ValueSchema, {
            kind: {
              case: 'objectValue',
              value: message as Any,
            },
          });
        default:
          try {
            return create(ValueSchema, {
              kind: {
                case: 'objectValue',
                value: anyPack(messageDesc, message),
              },
            });
          } catch (e) {
            this.#errors.errors.push(
              create(StatusSchema, {
                code: 0,
                message: (e as Error).message,
              })
            );
            return this.#ERROR;
          }
      }
    }
    const entries: MapValue_Entry[] = [];
    for (const entry of struct.entries) {
      entries.push(
        create(MapValue_EntrySchema, {
          key: this._evalInternal(entry.keyKind.value as Expr, bindings),
          value: this._evalInternal(entry.value as Expr, bindings),
        })
      );
    }
    return create(ValueSchema, {
      kind: {
        case: 'mapValue',
        value: {
          entries,
        },
      },
    });
  }

  private _evalList(list: Expr_CreateList, bindings: Record<string, Binding>) {
    const values: Value[] = [];
    for (const value of list.elements) {
      values.push(this._evalInternal(value as Expr, bindings));
    }
    return create(ValueSchema, {
      kind: {
        case: 'listValue',
        value: {
          values,
        },
      },
    });
  }

  private _evalIdent(
    ident: Expr_Ident,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bindings: Record<string, Binding>
  ): Value {
    const binding = bindings[ident.name];
    if (!binding) {
      this.#errors.errors.push(
        create(StatusSchema, {
          code: 0,
          message: `undeclared reference to '${ident.name}' (in container '')`,
        })
      );
      return this.#ERROR;
    }
    return binding as Value;
  }

  private _evalCall(expr: Expr_Call, bindings: Record<string, Binding>): Value {
    // If it is a known function, get the token, otherwise use the function name
    // eslint-disable-next-line @typescript-eslint/ban-types
    const fn = bindings[expr.function] as Function;
    if (!fn) {
      this.#errors.errors.push(
        create(StatusSchema, {
          code: 0,
          message: 'unbound function',
        })
      );
      return this.#ERROR;
    }
    let args = expr.args?.map((arg) => this._evalInternal(arg, bindings)) ?? [];
    if (!isNil(expr.target)) {
      args = [this._evalInternal(expr.target, bindings), ...args];
    }
    for (const arg of args) {
      if (arg === this.#ERROR) {
        return arg;
      }
    }
    try {
      return fn(...args);
    } catch (e) {
      this.#errors.errors.push(
        create(StatusSchema, {
          code: 0,
          message: (e as Error).message,
        })
      );
      return this.#ERROR;
    }
  }

  private _evalComprehension(
    expr: Expr_Comprehension,
    bindings: Record<string, Binding>
  ): Value {
    if (isNil(expr.iterRange)) {
      this.#errors.errors.push(
        create(StatusSchema, {
          code: 0,
          message: 'missing iterRange',
        })
      );
      return this.#ERROR;
    }
    if (expr.loopStep?.exprKind.case !== 'callExpr') {
      this.#errors.errors.push(
        create(StatusSchema, {
          code: 0,
          message: 'unsupported loopStep',
        })
      );
      return this.#ERROR;
    }
    const iterRangeRaw = this._evalInternal(expr.iterRange as Expr, bindings);
    let iterRange: Value[];
    if (iterRangeRaw.kind.case === 'listValue') {
      iterRange = iterRangeRaw.kind.value.values;
    } else if (iterRangeRaw.kind.case === 'mapValue') {
      iterRange = iterRangeRaw.kind.value.entries.map(
        (entry) => entry.key as Value
      );
    } else {
      this.#errors.errors.push(
        create(StatusSchema, {
          code: 0,
          message: 'expected a list or a map for iteration range',
        })
      );
      return this.#ERROR;
    }
    let accuValue = expr.accuInit
      ? this._evalInternal(expr.accuInit, bindings)
      : create(ValueSchema, {
          kind: {
            case: 'nullValue',
            value: NullValue.NULL_VALUE,
          },
        });
    bindings[expr.accuVar] = accuValue;
    for (let i = 0; i < iterRange.length; i++) {
      bindings[expr.iterVar] = iterRange[i];
      if (expr.loopCondition) {
        const evalObject = this._evalInternal(expr.loopCondition, bindings);
        if (!isNil(evalObject.kind.value) && !evalObject.kind.value) {
          break;
        }
      }
      accuValue = this._evalInternal(expr.loopStep, bindings);
      if (accuValue === this.#ERROR) {
        return this.#ERROR;
      }
      bindings[expr.accuVar] = accuValue;
    }
    if (expr.result?.exprKind.value) {
      return this._evalInternal(expr.result, bindings);
    }
    return accuValue;

    // let `accu_var` = `accu_init`
    // for (let `iter_var` in `iter_range`) {
    //   if (!`loop_condition`) {
    //     break
    //   }
    //   `accu_var` = `loop_step`
    // }
    // return `result`
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _evalConstant(constant: Constant, bindings: Record<string, Binding>) {
    switch (constant.constantKind.case) {
      case 'nullValue':
      case 'boolValue':
      case 'bytesValue':
      case 'doubleValue':
      case 'int64Value':
      case 'uint64Value':
      case 'stringValue':
        return create(ValueSchema, {
          kind: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            case: constant.constantKind.case as any,
            value: constant.constantKind.value,
          },
        });
      default:
        throw new Error(
          `Unsupported constant case: ${constant.constantKind.case}`
        );
    }
  }

  private _checkOverflow(value: Value) {
    switch (value.kind.case) {
      case 'int64Value':
        if (value.kind.value < -BigInt('9223372036854775808')) {
          this.#errors.errors.push(
            create(StatusSchema, {
              code: 0,
              message: 'return error for overflow',
            })
          );
          return this.#ERROR;
        }
        if (value.kind.value > BigInt('9223372036854775807')) {
          this.#errors.errors.push(
            create(StatusSchema, {
              code: 0,
              message: 'return error for overflow',
            })
          );
          return this.#ERROR;
        }
        return value;
      case 'uint64Value':
        if (value.kind.value < 0) {
          this.#errors.errors.push(
            create(StatusSchema, {
              code: 0,
              message: 'return error for overflow',
            })
          );
          return this.#ERROR;
        }
        if (value.kind.value > BigInt('9223372036854775807')) {
          this.#errors.errors.push(
            create(StatusSchema, {
              code: 0,
              message: 'return error for overflow',
            })
          );
          return this.#ERROR;
        }
        return value;
      default:
        return value;
    }
  }
}
