import {
  Constant,
  Expr,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { NullValue } from '@bufbuild/protobuf';
import {
  parseBytesConstant,
  parseDoubleConstant,
  parseIntConstant,
  parseStringConstant,
  parseUintConstant,
} from './constants';
import {
  BoolFalseContext,
  BoolTrueContext,
  BytesContext,
  CalcContext,
  ConditionalAndContext,
  ConditionalOrContext,
  ConstantLiteralContext,
  DoubleContext,
  ExprContext,
  IntContext,
  MemberExprContext,
  NullContext,
  PrimaryExprContext,
  RelationContext,
  StartContext,
  StringContext,
  UintContext,
} from './gen/CELParser';
import GeneratedCelVisitor from './gen/CELVisitor';

export class CELParser extends GeneratedCelVisitor<Expr> {
  #ERROR = new Constant({
    constantKind: {
      case: 'stringValue',
      value: '<<error>>',
    },
  });
  #exprId = BigInt(0);

  constructor(readonly input?: Record<string, unknown>) {
    super();
  }

  override visitStart = (ctx: StartContext) => {
    // TODO: ensure context not null
    return this.visit(ctx.expr());
  };

  override visitExpr = (ctx: ExprContext) => {
    // TODO: ensure context not null
    // TODO: ensure context.e is not null
    const condition = this.visit(ctx._e);
    if (ctx._op !== null) {
      // TODO: handle this case
    }
    return condition;
  };

  override visitConditionalOr = (ctx: ConditionalOrContext) => {
    // TODO: ensure context not null
    // TODO: ensure context.e is not null
    const conditionalOr = this.visit(ctx._e);
    if (!ctx._ops || ctx._ops.length === 0) {
      return conditionalOr;
    }
    // TODO: handle other cases
    return new Expr();
  };

  override visitConditionalAnd = (ctx: ConditionalAndContext) => {
    // TODO: ensure context not null
    // TODO: ensure context.e is not null
    const conditionalAnd = this.visit(ctx._e);
    if (!ctx._ops || ctx._ops.length === 0) {
      return conditionalAnd;
    }
    // TODO: handle other cases
    return new Expr();
  };

  override visitRelation = (ctx: RelationContext) => {
    // TODO: ensure context not null
    if (ctx.calc()) {
      return this.visit(ctx.calc());
    }
    // TODO: handle other cases
    return new Expr();
  };

  override visitCalc = (ctx: CalcContext) => {
    // TODO: ensure context not null
    if (ctx.unary()) {
      return this.visit(ctx.unary());
    }
    // TODO: handle other cases
    return new Expr();
  };

  override visitMemberExpr = (ctx: MemberExprContext) => {
    // TODO: ensure context not null
    // TODO: make sure context.member() is not null
    return this.visit(ctx.member());
  };

  override visitPrimaryExpr = (ctx: PrimaryExprContext) => {
    // TODO: ensure context not null
    // TODO: make sure context.primary() is not null
    return this.visit(ctx.primary());
  };

  override visitConstantLiteral = (ctx: ConstantLiteralContext) => {
    // TODO: ensure context not null
    // TODO: make sure context.literal() is not null
    return this.visit(ctx.literal());
  };

  override visitInt = (ctx: IntContext) => {
    // TODO: ensure context not null
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
    // TODO: ensure context not null
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
    // TODO: ensure context not null
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
    // TODO: ensure context not null
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
    // TODO: ensure context not null
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override visitBoolTrue = (ctx: BoolTrueContext) => {
    // TODO: ensure context not null
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override visitBoolFalse = (ctx: BoolFalseContext) => {
    // TODO: ensure context not null
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override visitNull = (ctx: NullContext) => {
    // TODO: ensure context not null
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
}
