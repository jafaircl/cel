import {
  Constant,
  Expr,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { StartContext } from './gen/CELParser';
import { CELParser } from './parser';

export class CELProgram {
  constructor(readonly ast: StartContext) {}

  eval(input?: Record<string, unknown>) {
    // TODO: flesh this out
    const intermediateResult = this.ast.accept(new CELParser(input));
    return this._evalInternal(intermediateResult);
  }

  private _evalInternal(expr: Expr) {
    // TODO: flesh this out
    switch (expr.exprKind.case) {
      case 'constExpr':
        return this._evalConstant(expr, expr.exprKind.value);
      default:
        throw new Error(`Unknown expression kind: ${expr.exprKind.case}`);
    }
  }

  private _evalConstant(expr: Expr, constant: Constant) {
    switch (constant.constantKind.case) {
      case 'nullValue':
        // TODO: should this return NullValue instead?
        return null;
      case 'boolValue':
      case 'bytesValue':
      case 'doubleValue':
      case 'int64Value':
      case 'uint64Value':
      case 'stringValue':
        return constant.constantKind.value;
      default:
        throw new Error(
          `Unsupported constant case: ${constant.constantKind.case}`
        );
    }
  }
}
