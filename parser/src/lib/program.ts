/* eslint-disable no-case-declarations */
import {
  ErrorSet,
  ExprValue,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb';
import {
  Constant,
  Expr,
  Expr_Call,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_Ident,
  Expr_Select,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import {
  MapValue_Entry,
  Value,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { Status } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb';
import {
  Any,
  BoolValue,
  BytesValue,
  DoubleValue,
  FieldInfo,
  FloatValue,
  Int32Value,
  Int64Value,
  NullValue,
  StringValue,
  UInt32Value,
  UInt64Value,
  createRegistry,
} from '@bufbuild/protobuf';
import { base_functions } from './functions';
import { StartContext } from './gen/CELParser';
import { CELParser } from './parser';
import { Binding } from './types';

export class CELProgram {
  #ERROR = new Value({
    kind: {
      case: 'stringValue',
      value: '<<error>>',
    },
  });
  #bindings: Record<string, Binding> = base_functions;
  #errors = new ErrorSet();

  constructor(
    private readonly ast: StartContext,
    private readonly registry: ReturnType<typeof createRegistry>
  ) {}

  eval(bindings?: Record<string, Binding>): ExprValue {
    this.#bindings = { ...this.#bindings, ...(bindings ?? {}) };
    const parser = new CELParser();
    const intermediateResult = this.ast.accept(parser);
    if (parser.errors.errors.length > 0) {
      return new ExprValue({
        kind: {
          case: 'error',
          value: parser.errors,
        },
      });
    }
    let value = this._evalInternal(intermediateResult);
    value = this._checkOverflow(value);
    if (
      this.#errors.errors.length > 0 &&
      value.kind.value === this.#ERROR.kind.value
    ) {
      return new ExprValue({
        kind: {
          case: 'error',
          value: this.#errors,
        },
      });
    }
    return new ExprValue({
      kind: {
        case: 'value',
        value,
      },
    });
  }

  private _evalInternal(expr: Expr) {
    switch (expr.exprKind.case) {
      case 'identExpr':
        return this._evalIdent(expr.exprKind.value);
      case 'callExpr':
        return this._evalCall(expr.exprKind.value);
      case 'constExpr':
        return this._evalConstant(expr.exprKind.value);
      case 'structExpr':
        return this._evalStruct(expr.exprKind.value);
      case 'listExpr':
        return this._evalList(expr.exprKind.value);
      case 'selectExpr':
        return this._evalSelect(expr.exprKind.value);
      case 'comprehensionExpr':
        console.log(expr.exprKind.value);
        throw new Error('Not implemented');
      default:
        throw new Error(`Unknown expression kind: ${expr.exprKind.case}`);
    }
  }

  private _evalSelect(select: Expr_Select): Value {
    if (!select.operand) {
      this.#errors.errors.push(
        new Status({
          code: 0,
          message: 'missing operand',
        })
      );
      return this.#ERROR;
    }
    const operand = this._evalInternal(select.operand);
    switch (operand.kind.case) {
      case 'objectValue':
        const message = operand.kind.value.unpack(this.registry);
        if (!message) {
          this.#errors.errors.push(
            new Status({
              code: 0,
              message: 'cannot unpack message',
            })
          );
          return this.#ERROR;
        }
        const field = message.getType().fields.findJsonName(select.field);
        if (!field) {
          this.#errors.errors.push(
            new Status({
              code: 0,
              message: `unknown field '${select.field}'`,
            })
          );
          return this.#ERROR;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (message as any)[field.name];
        if (!value) {
          return new Value({
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

  private _evalStruct(struct: Expr_CreateStruct) {
    if (struct.messageName !== '') {
      // This is a message, not a struct
      const messageType = this.registry.findMessage(struct.messageName);
      if (!messageType) {
        this.#errors.errors.push(
          new Status({
            code: 0,
            message: `unknown message type '${struct.messageName}'`,
          })
        );
        return this.#ERROR;
      }
      const message = new messageType();
      for (const entry of struct.entries) {
        const key = entry.keyKind.value as string;
        const value = this._evalInternal(entry.value as Expr);
        const field = messageType.fields
          .list()
          .find((f) => f.name === key) as FieldInfo;
        message[field.jsonName] = value.kind.value;
      }
      switch (messageType.typeName) {
        case BoolValue.typeName:
          return new Value({
            kind: {
              case: 'boolValue',
              value: (message as BoolValue).value,
            },
          });
        case BytesValue.typeName:
          return new Value({
            kind: {
              case: 'bytesValue',
              value: (message as BytesValue).value,
            },
          });
        case DoubleValue.typeName:
          return new Value({
            kind: {
              case: 'doubleValue',
              value: (message as DoubleValue).value,
            },
          });
        case FloatValue.typeName:
          return new Value({
            kind: {
              case: 'doubleValue',
              value: (message as FloatValue).value,
            },
          });
        case Int32Value.typeName:
          return new Value({
            kind: {
              case: 'doubleValue',
              value: (message as Int32Value).value,
            },
          });
        case Int64Value.typeName:
          return new Value({
            kind: {
              case: 'int64Value',
              value: (message as Int64Value).value,
            },
          });
        case StringValue.typeName:
          return new Value({
            kind: {
              case: 'stringValue',
              value: (message as StringValue).value,
            },
          });
        case UInt32Value.typeName:
          return new Value({
            kind: {
              case: 'doubleValue',
              value: (message as UInt32Value).value,
            },
          });
        case UInt64Value.typeName:
          return new Value({
            kind: {
              case: 'uint64Value',
              value: (message as UInt64Value).value,
            },
          });
        default:
          return new Value({
            kind: {
              case: 'objectValue',
              value: Any.pack(message),
            },
          });
      }
    }
    const entries: MapValue_Entry[] = [];
    for (const entry of struct.entries) {
      entries.push(
        new MapValue_Entry({
          key: this._evalInternal(entry.keyKind.value as Expr),
          value: this._evalInternal(entry.value as Expr),
        })
      );
    }
    return new Value({
      kind: {
        case: 'mapValue',
        value: {
          entries,
        },
      },
    });
  }

  private _evalList(list: Expr_CreateList) {
    const values: Value[] = [];
    for (const value of list.elements) {
      values.push(this._evalInternal(value as Expr));
    }
    return new Value({
      kind: {
        case: 'listValue',
        value: {
          values,
        },
      },
    });
  }

  private _evalIdent(ident: Expr_Ident): Value {
    const binding = this.#bindings[ident.name];
    if (!binding) {
      this.#errors.errors.push(
        new Status({
          code: 0,
          message: `undeclared reference to '${ident.name}' (in container '')`,
        })
      );
      return this.#ERROR;
    }
    return binding as Value;
  }

  private _evalCall(expr: Expr_Call): Value {
    // If it is a known function, get the token, otherwise use the function name
    // eslint-disable-next-line @typescript-eslint/ban-types
    const fn = this.#bindings[expr.function] as Function;
    if (!fn) {
      this.#errors.errors.push(
        new Status({
          code: 0,
          message: 'unbound function',
        })
      );
      return this.#ERROR;
    }
    try {
      return fn(...expr.args!.map((arg) => this._evalInternal(arg)));
    } catch (e) {
      this.#errors.errors.push(
        new Status({
          code: 0,
          message: (e as Error).message,
        })
      );
      return this.#ERROR;
    }
  }

  private _evalConstant(constant: Constant) {
    switch (constant.constantKind.case) {
      case 'nullValue':
      case 'boolValue':
      case 'bytesValue':
      case 'doubleValue':
      case 'int64Value':
      case 'uint64Value':
      case 'stringValue':
        return new Value({
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
            new Status({
              code: 0,
              message: 'return error for overflow',
            })
          );
          return this.#ERROR;
        }
        if (value.kind.value > BigInt('9223372036854775807')) {
          this.#errors.errors.push(
            new Status({
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
            new Status({
              code: 0,
              message: 'return error for overflow',
            })
          );
          return this.#ERROR;
        }
        if (value.kind.value > BigInt('9223372036854775807')) {
          this.#errors.errors.push(
            new Status({
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
