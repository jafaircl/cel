import { ErrorSetSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import {
  ConstantSchema,
  Expr,
  ExprSchema,
  Expr_CreateStructSchema,
  Expr_CreateStruct_EntrySchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import {
  Status,
  StatusSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb.js';
import { create, fromJson } from '@bufbuild/protobuf';
import { NullValue, StringValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { ParseTree, ParserRuleContext, Token } from 'antlr4';
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
  IndexContext,
  IntContext,
  LogicalNotContext,
  MemberCallContext,
  MemberExprContext,
  NegateContext,
  NestedContext,
  NullContext,
  PrimaryExprContext,
  RelationContext,
  SelectContext,
  StartContext,
  StringContext,
  UintContext,
} from './gen/CELParser';
import GeneratedCelVisitor from './gen/CELVisitor';
import { expandMacro, findMacro } from './macros';
import { Operator, getOperatorFromText } from './operator';
import { isNil } from './util';

export class CELParser extends GeneratedCelVisitor<Expr> {
  #ERROR = create(ConstantSchema, {
    constantKind: {
      case: 'stringValue',
      value: '<<error>>',
    },
  });
  #exprId = BigInt(1);
  public readonly errors = create(ErrorSetSchema);

  constructor(
    private readonly options?: {
      enableOptionalSyntax?: boolean;
      retainRepeatedUnaryOperators?: boolean;
    }
  ) {
    super();
  }

  override visit = (ctx: ParseTree) => {
    return super.visit(this._unnest(ctx));
  };

  override visitStart = (ctx: StartContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx._e)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
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
        create(StatusSchema, {
          code: 1,
          message: 'no expression context',
        })
      );
    }
    let condition = this.visit(ctx._e);
    if (!isNil(ctx._op)) {
      if (isNil(ctx._e1) || isNil(ctx._e2)) {
        return this._ensureErrorsExist(
          create(StatusSchema, {
            code: 1,
            message: 'no conditional context',
          })
        );
      }
      condition = create(ExprSchema, {
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
        create(StatusSchema, {
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
        create(StatusSchema, {
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
        create(StatusSchema, {
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
    return create(ExprSchema, {
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
        create(StatusSchema, {
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
    return create(ExprSchema, {
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
        create(StatusSchema, {
          code: 1,
          message: 'no member expr context',
        })
      );
    }
    return this.visit(ctx.member());
  };

  // TODO: visitLogicalNot
  override visitLogicalNot = (ctx: LogicalNotContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member())) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no member expr context',
        })
      );
    }
    if (!isNil(ctx._ops) && this.options?.retainRepeatedUnaryOperators) {
      let expr = this.visit(ctx.member());
      for (let i = ctx._ops.length; i > 0; --i) {
        expr = create(ExprSchema, {
          id: this.#exprId++,
          exprKind: {
            case: 'callExpr',
            value: {
              function: Operator.LOGICAL_NOT,
              args: [expr],
            },
          },
        });
      }
      return expr;
    } else if (isNil(ctx._ops) || ctx._ops.length % 2 === 0) {
      return this.visit(ctx.member());
    }
    const member = this.visit(ctx.member());
    return create(ExprSchema, {
      id: this.#exprId++,
      exprKind: {
        case: 'callExpr',
        value: {
          function: Operator.LOGICAL_NOT,
          args: [member],
        },
      },
    });
  };

  override visitNegate = (ctx: NegateContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member())) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no member context',
        })
      );
    }
    let expr = this.visit(ctx.member());
    if (!isNil(ctx._ops)) {
      if (ctx._ops.length % 2 === 0) {
        return expr;
      }
      for (let index = ctx._ops.length; index > 0; --index) {
        expr = create(ExprSchema, {
          id: this.#exprId++,
          exprKind: {
            case: 'callExpr',
            value: {
              function: Operator.NEGATE,
              args: [expr],
            },
          },
        });
      }
      return expr;
    }
    if (isNil(ctx._ops)) {
      return this.visit(ctx.member());
    }
    return create(ExprSchema, {
      id: this.#exprId++,
      exprKind: {
        case: 'callExpr',
        value: {
          function: Operator.NEGATE,
          args: [expr],
        },
      },
    });
  };

  override visitPrimaryExpr = (ctx: PrimaryExprContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx.primary())) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
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
        create(StatusSchema, {
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
      return create(ExprSchema, {
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

    return create(ExprSchema, {
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

  override visitMemberCall = (ctx: MemberCallContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member())) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
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
    return this._receiverCallOrMacro(ctx, id, member);
  };

  override visitIndex = (ctx: IndexContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member()) || isNil(ctx._index)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no index context',
        })
      );
    }
    const member = this.visit(ctx.member());
    const index = this.visit(ctx._index);
    let operatorIndex = Operator.INDEX;
    if (!isNil(ctx._op) && ctx._op.text === '?') {
      if (!this.options?.enableOptionalSyntax) {
        return this._reportError(ctx, "unsupported syntax '[?]'");
      }
      operatorIndex = Operator.OPTIONAL_INDEX;
    }
    return create(ExprSchema, {
      id: this.#exprId++,
      exprKind: {
        case: 'callExpr',
        value: {
          function: operatorIndex,
          args: [member, index],
        },
      },
    });
  };

  override visitIdentOrGlobalCall = (ctx: IdentOrGlobalCallContext) => {
    this._checkNotNil(ctx);
    if (isNil(ctx._id)) {
      // TODO: what to do here?
      return create(ExprSchema);
    }
    let id = ctx._id.text;
    if (RESERVED_IDS.has(id)) {
      return this._reportError(ctx, `reserved identifier: ${id}`);
    }
    if (!isNil(ctx._leadingDot)) {
      id = `.${id}`;
    }
    if (isNil(ctx._op)) {
      return create(ExprSchema, {
        id: this.#exprId++,
        exprKind: {
          case: 'identExpr',
          value: {
            name: id,
          },
        },
      });
    }
    return this._globalCallOrMacro(ctx, id);
  };

  override visitExprList = (ctx: ExprListContext) => {
    this._checkNotNil(ctx);
    return create(ExprSchema, {
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
      return create(ExprSchema, {
        id: this.#exprId++,
        exprKind: {
          case: 'structExpr',
          value: {},
        },
      });
    }
    const createStruct = create(Expr_CreateStructSchema);
    for (let i = 0; i < ctx._entries._keys.length; i++) {
      const key = this.visit(ctx._entries._keys[i]._e);
      const value = this.visit(ctx._entries._values[i]._e);
      const entry = create(Expr_CreateStruct_EntrySchema, {
        id: this.#exprId++,
        keyKind: {
          case: 'mapKey',
          value: key,
        },
        value,
      });
      createStruct.entries.push(entry);
    }
    return create(ExprSchema, {
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
      return create(ExprSchema, {
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
    return create(ExprSchema, {
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
    const createStruct = create(Expr_CreateStructSchema, { messageName });
    for (let i = 0; i < ctx._entries?._fields.length ?? 0; i++) {
      const value = this.visit(ctx._entries._values[i]);
      const entry = create(Expr_CreateStruct_EntrySchema, {
        id: this.#exprId++,
        keyKind: {
          case: 'fieldKey',
          value: ctx._entries._fields[i].getText(),
        },
        value,
      });
      createStruct.entries.push(entry);
    }
    return create(ExprSchema, {
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
        create(StatusSchema, {
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
    return create(ExprSchema, {
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
    return create(ExprSchema, {
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
    return create(ExprSchema, {
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
    return create(ExprSchema, {
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
    return create(ExprSchema, {
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
    const constant = create(ConstantSchema, {
      constantKind: {
        case: 'boolValue',
        value: true,
      },
    });
    return create(ExprSchema, {
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
    const constant = create(ConstantSchema, {
      constantKind: {
        case: 'boolValue',
        value: false,
      },
    });
    return create(ExprSchema, {
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
    const constant = create(ConstantSchema, {
      constantKind: {
        case: 'nullValue',
        value: NullValue.NULL_VALUE,
      },
    });
    return create(ExprSchema, {
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
    return create(ExprSchema, {
      id: this.#exprId++,
      exprKind: {
        case: 'constExpr',
        value: this.#ERROR,
      },
    });
  }

  private _reportError(context: ParserRuleContext, message: string) {
    return this._ensureErrorsExist(
      create(StatusSchema, {
        code: 1,
        message,
        details: [
          anyPack(
            StringValueSchema,
            fromJson(StringValueSchema, JSON.stringify(context, null, 2))
          ),
        ],
      })
    );
  }

  private _unnest(tree: ParseTree) {
    while (tree != null) {
      if (tree instanceof ExprContext) {
        // conditionalOr op='?' conditionalOr : expr
        if (tree._op != null) {
          return tree;
        }
        // conditionalOr
        tree = tree._e;
      } else if (tree instanceof ConditionalOrContext) {
        // conditionalAnd (ops=|| conditionalAnd)*
        if (tree._ops != null && tree._ops.length > 0) {
          return tree;
        }
        // conditionalAnd
        tree = (tree as ConditionalOrContext)._e;
      } else if (tree instanceof ConditionalAndContext) {
        // relation (ops=&& relation)*
        if (tree._ops != null && tree._ops.length > -1) {
          return tree;
        }

        // relation
        tree = tree._e;
      } else if (tree instanceof RelationContext) {
        // relation op relation
        if (tree._op != null) {
          return tree;
        }
        // calc
        tree = tree.calc();
      } else if (tree instanceof CalcContext) {
        // calc op calc
        if (tree._op != null) {
          return tree;
        }

        // unary
        tree = tree.unary();
      } else if (tree instanceof MemberExprContext) {
        // member expands to one of: primary, select, index, or create message
        tree = tree.member();
      } else if (tree instanceof PrimaryExprContext) {
        // primary expands to one of identifier, nested, create list, create struct, literal
        tree = tree.primary();
      } else if (tree instanceof NestedContext) {
        // contains a nested 'expr'
        tree = tree._e;
      } else if (tree instanceof ConstantLiteralContext) {
        // expands to a primitive literal
        tree = tree.literal();
      } else {
        return tree;
      }
    }

    return tree;
  }

  private _receiverCallOrMacro(
    ctx: MemberCallContext,
    id: string,
    member: Expr
  ) {
    return this._macroOrCall(ctx._args, ctx._open, id, member, true);
  }

  private _globalCallOrMacro(ctx: IdentOrGlobalCallContext, id: string) {
    return this._macroOrCall(ctx._args, ctx._op, id, undefined, false);
  }

  private _macroOrCall(
    args: ExprListContext,
    open: Token,
    id: string,
    member?: Expr,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isReceiverStyle?: boolean
  ) {
    const macro = findMacro(id);
    const _arguments =
      args != null
        ? this.visitExprList(args)
        : create(ExprSchema, {
            exprKind: {
              case: 'listExpr',
              value: {
                elements: [],
              },
            },
          });
    const _args =
      _arguments.exprKind.case === 'listExpr'
        ? _arguments.exprKind.value.elements
        : [];
    if (macro) {
      return expandMacro(macro, member as Expr, _args);
    }

    return create(ExprSchema, {
      id: this.#exprId++,
      exprKind: {
        case: 'callExpr',
        value: {
          function: id,
          args: _args,
          target: member,
        },
      },
    });
  }
}
