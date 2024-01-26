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
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import {
  MapValue_Entry,
  Value,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { Status } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb';
import {
  BoolValue,
  BytesValue,
  DoubleValue,
  FloatValue,
  Int32Value,
  Int64Value,
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
    const value = this._evalInternal(intermediateResult);
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
    // TODO: flesh this out
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
      default:
        throw new Error(`Unknown expression kind: ${expr.exprKind.case}`);
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
      const fields: Record<string, unknown> = {};
      for (const entry of struct.entries) {
        fields[entry.keyKind.value as string] = this._evalInternal(
          entry.value as Expr
        ).kind.value;
      }
      const message = new messageType(fields);
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
              value: {
                typeUrl: messageType.typeName,
                value: message.toBinary(),
              },
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
}
