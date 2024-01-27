import { ErrorSet } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb';
import {
  Constant,
  Expr,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_CreateStruct_Entry,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { Status } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb';
import { Any, NullValue, StringValue } from '@bufbuild/protobuf';
import { ParserRuleContext } from 'antlr4';
import { ExpressionBalancer } from './balancer';
import {
  RESERVED_IDS,
  parseBytesConstant,
  parseDoubleConstant,
  parseIntConstant,
  parseStringConstant,
  parseUintConstant,
} from './constants';
import { NullException } from './exceptions';
import {
  BoolFalseContext,
  BoolTrueContext,
  BytesContext,
  CalcContext,
  ConditionalAndContext,
  ConditionalOrContext,
  ConstantLiteralContext,
  CreateListContext,
  CreateMapContext,
  CreateMessageContext,
  DoubleContext,
  ExprContext,
  ExprListContext,
  IdentOrGlobalCallContext,
  IntContext,
  MemberExprContext,
  NullContext,
  PrimaryExprContext,
  RelationContext,
  SelectContext,
  StartContext,
  StringContext,
  UintContext,
} from './gen/CELParser';
import GeneratedCelVisitor from './gen/CELVisitor';
import { Operator, getOperatorFromText } from './operator';

function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export class CELParser extends GeneratedCelVisitor<Expr> {
  #ERROR = new Constant({
    constantKind: {
      case: 'stringValue',
      value: '<<error>>',
    },
  });
  #exprId = BigInt(1);
  public readonly errors = new ErrorSet();

  constructor() {
    super();
  }

  override visitStart = (ctx: StartContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx._e)) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no expression context',
        })
      );
    }
    return this.visit(ctx._e);
  };

  override visitExpr = (ctx: ExprContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx._e)) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no expression context',
        })
      );
    }
    let condition = this.visit(ctx._e);
    if (!isNil(ctx._op)) {
      if (isNil(ctx._e1) || isNil(ctx._e2)) {
        return this._ensureErrorsExist(
          new Status({
            code: 1,
            message: 'no conditional context',
          })
        );
      }
      condition = new Expr({
        id: this.#exprId++,
        exprKind: {
          case: 'callExpr',
          value: {
            function: Operator.CONDITIONAL,
            args: [condition, this.visit(ctx._e1), this.visit(ctx._e2)],
          },
        },
      });
    }
    return condition;
  };

  override visitConditionalOr = (ctx: ConditionalOrContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx._e)) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no conditionalor context',
        })
      );
    }
    const conditionalOr = this.visit(ctx._e);
    if (!ctx._ops || ctx._ops.length === 0) {
      return conditionalOr;
    }
    const balancer = new ExpressionBalancer(Operator.LOGICAL_OR, conditionalOr);
    for (let i = 0; i < ctx._ops.length; i++) {
      if (isNil(ctx._e1) || i >= ctx._e1.length) {
        return this._reportError(ctx, "unexpected character, wanted '||'");
      }
      const term = this.visit(ctx._e1[i]);
      balancer.add(term.id, term);
    }
    return balancer.balance();
  };

  override visitConditionalAnd = (ctx: ConditionalAndContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx._e)) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no conditionaland context',
        })
      );
    }
    const conditionalAnd = this.visit(ctx._e);
    if (!ctx._ops || ctx._ops.length === 0) {
      return conditionalAnd;
    }
    const balancer = new ExpressionBalancer(
      Operator.LOGICAL_AND,
      conditionalAnd
    );
    for (let i = 0; i < ctx._ops.length; i++) {
      if (isNil(ctx._e1) || i >= ctx._e1.length) {
        return this._reportError(ctx, "unexpected character, wanted '&&'");
      }
      const term = this.visit(ctx._e1[i]);
      balancer.add(term.id, term);
    }
    return balancer.balance();
  };

  override visitRelation = (ctx: RelationContext) => {
    this._checkNotNil(ctx);
    if (!isNil(ctx.calc())) {
      return this.visit(ctx.calc());
    }
    if (
      isNil(ctx.relation_list()) ||
      ctx.relation_list().length === 0 ||
      isNil(ctx._op)
    ) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no relation context',
        })
      );
    }
    const operator = getOperatorFromText(ctx._op.text);
    if (isNil(operator)) {
      return this._reportError(ctx, 'operator not found');
    }
    const left = this.visit(ctx.relation(0));
    const right = this.visit(ctx.relation(1));
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'callExpr',
        value: {
          function: operator,
          args: [left, right],
        },
      },
    });
  };

  override visitCalc = (ctx: CalcContext) => {
    this._checkNotNil(ctx);
    if (!isNil(ctx.unary())) {
      return this.visit(ctx.unary());
    }
    if (
      isNil(ctx.calc_list()) ||
      ctx.calc_list().length === 0 ||
      isNil(ctx._op)
    ) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no calc context',
        })
      );
    }
    const operator = getOperatorFromText(ctx._op.text);
    if (isNil(operator)) {
      return this._reportError(ctx, 'operator not found');
    }
    const left = this.visit(ctx.calc(0));
    const right = this.visit(ctx.calc(1));
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'callExpr',
        value: {
          function: operator,
          args: [left, right],
        },
      },
    });
  };

  override visitMemberExpr = (ctx: MemberExprContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member())) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no member expr context',
        })
      );
    }
    return this.visit(ctx.member());
  };

  // TODO: visitLogicalNot
  // TODO: visitNegate

  override visitPrimaryExpr = (ctx: PrimaryExprContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx.primary())) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no primary expr context',
        })
      );
    }
    return this.visit(ctx.primary());
  };

  override visitSelect = (ctx: SelectContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member())) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no member context',
        })
      );
    }
    const member = this.visit(ctx.member());
    if (isNil(ctx._id)) {
      return member;
    }
    const id = ctx._id.text;

    if (!isNil(ctx._opt) && ctx._opt.text === '?') {
      //   if (!options.enableOptionalSyntax()) {
      //     return exprFactory.reportError(context.op, "unsupported syntax '.?'");
      //   }
      //   CelExpr.Builder exprBuilder = exprFactory.newExprBuilder(exprFactory.getPosition(context.op));
      //   CelExpr.CelCall callExpr =
      //       CelExpr.CelCall.newBuilder()
      //           .setFunction(Operator.OPTIONAL_SELECT.getFunction())
      //           .addArgs(
      //               Arrays.asList(
      //                   member,
      //                   exprFactory
      //                       .newExprBuilder(context)
      //                       .setConstant(CelConstant.ofValue(id))
      //                       .build()))
      //           .build();
      //   return exprBuilder.setCall(callExpr).build();
      return new Expr({
        id: this.#exprId++,
        exprKind: {
          case: 'callExpr',
          value: {
            function: Operator.OPTIONAL_SELECT,
            args: [member],
          },
        },
      });
    }

    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'selectExpr',
        value: {
          operand: member,
          field: id,
        },
      },
    });
  };

  // TODO: visitMemberCall
  // TODO: visitIndex

  override visitIdentOrGlobalCall = (ctx: IdentOrGlobalCallContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx._id)) {
      // TODO: what to do here?
      console.log('hey buddy');
      return new Expr();
    }
    let id = ctx._id.text;
    if (RESERVED_IDS.has(id)) {
      return this._reportError(ctx, `reserved identifier: ${id}`);
    }
    if (!isNil(ctx._leadingDot)) {
      id = `.${id}`;
    }
    if (isNil(ctx._op)) {
      return new Expr({
        id: this.#exprId++,
        exprKind: {
          case: 'identExpr',
          value: {
            name: id,
          },
        },
      });
    }
    const args = this.visitExprList(ctx.exprList());
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'callExpr',
        value: {
          function: id,
          args: (args.exprKind.value as Expr_CreateList).elements,
        },
      },
    });
  };

  override visitExprList = (ctx: ExprListContext) => {
    this._checkNotNil(ctx);
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'listExpr',
        value: {
          elements: ctx.expr_list().map((expr) => this.visit(expr)),
        },
      },
    });
  };

  override visitCreateMap = (ctx: CreateMapContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx._entries)) {
      return new Expr({
        id: this.#exprId++,
        exprKind: {
          case: 'structExpr',
          value: {},
        },
      });
    }
    const createStruct = new Expr_CreateStruct();
    for (let i = 0; i < ctx._entries._keys.length; i++) {
      const key = this.visit(ctx._entries._keys[i]._e);
      const value = this.visit(ctx._entries._values[i]._e);
      const entry = new Expr_CreateStruct_Entry({
        id: this.#exprId++,
        keyKind: {
          case: 'mapKey',
          value: key,
        },
        value,
      });
      createStruct.entries.push(entry);
    }
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'structExpr',
        value: createStruct,
      },
    });
  };

  override visitCreateList = (ctx: CreateListContext) => {
    this._checkNotNil(ctx);
    if (
      isNil(ctx._elems) ||
      isNil(ctx._elems._elems) ||
      ctx._elems._elems.length === 0
    ) {
      return new Expr({
        id: this.#exprId++,
        exprKind: {
          case: 'listExpr',
          value: {
            elements: [],
          },
        },
      });
    }
    const elements: Expr[] = [];
    for (const elem of ctx._elems._elems) {
      elements.push(this.visit(elem._e));
    }
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'listExpr',
        value: {
          elements,
        },
      },
    });
  };

  override visitCreateMessage = (ctx: CreateMessageContext) => {
    this._checkNotNil(ctx);
    let messageName = ctx._ids.map((id) => id.text).join('.');
    if (!isNil(ctx._leadingDot)) {
      messageName = `.${messageName}`;
    }
    if (messageName === '') {
      return this._reportError(ctx, 'message name is empty');
    }
    const createStruct = new Expr_CreateStruct({ messageName });
    for (let i = 0; i < ctx._entries?._fields.length ?? 0; i++) {
      const value = this.visit(ctx._entries._values[i]);
      const entry = new Expr_CreateStruct_Entry({
        id: this.#exprId++,
        keyKind: {
          case: 'fieldKey',
          value: ctx._entries._fields[i].getText(),
        },
        value,
      });
      createStruct.entries.push(entry);
    }
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'structExpr',
        value: createStruct,
      },
    });
  };

  override visitConstantLiteral = (ctx: ConstantLiteralContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx.literal())) {
      return this._ensureErrorsExist(
        new Status({
          code: 1,
          message: 'no literal context',
        })
      );
    }
    return this.visit(ctx.literal());
  };

  override visitInt = (ctx: IntContext) => {
    this._checkNotNil(ctx);
    const constant = parseIntConstant(ctx.getText());
    // TODO: parse error handling
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitUint = (ctx: UintContext) => {
    this._checkNotNil(ctx);
    const constant = parseUintConstant(ctx.getText());
    // TODO: parse error handling
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitDouble = (ctx: DoubleContext) => {
    this._checkNotNil(ctx);
    const constant = parseDoubleConstant(ctx.getText());
    // TODO: parse error handling
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitString = (ctx: StringContext) => {
    this._checkNotNil(ctx);
    const constant = parseStringConstant(ctx.getText());
    // TODO: parse error handling
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitBytes = (ctx: BytesContext) => {
    this._checkNotNil(ctx);
    const constant = parseBytesConstant(ctx.getText());
    // TODO: parse error handling
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitBoolTrue = (ctx: BoolTrueContext) => {
    this._checkNotNil(ctx);
    // TODO: ensure context.getText() is 'true'
    const constant = new Constant({
      constantKind: {
        case: 'boolValue',
        value: true,
      },
    });
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitBoolFalse = (ctx: BoolFalseContext) => {
    this._checkNotNil(ctx);
    // TODO: ensure context.getText() is 'false'
    const constant = new Constant({
      constantKind: {
        case: 'boolValue',
        value: false,
      },
    });
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitNull = (ctx: NullContext) => {
    this._checkNotNil(ctx);
    // TODO: ensure context.getText() is 'null'
    const constant = new Constant({
      constantKind: {
        case: 'nullValue',
        value: NullValue.NULL_VALUE,
      },
    });
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  private _checkNotNil(value: unknown, message?: string): asserts value {
    if (isNil(value)) {
      throw new NullException(message || 'value is nil');
    }
  }

  private _ensureErrorsExist(status: Status) {
    this.errors.errors.push(status);
    return new Expr({
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: this.#ERROR,
      },
    });
  }

  private _reportError(context: ParserRuleContext, message: string) {
    return this._ensureErrorsExist(
      new Status({
        code: 1,
        message,
        details: [
          Any.pack(StringValue.fromJson(JSON.stringify(context, null, 2))),
        ],
      })
    );
  }
}
