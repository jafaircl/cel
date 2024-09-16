import {
  Expr,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';

export class ExpressionBalancer {
  private readonly fn!: string;
  private readonly terms!: Expr[];
  private readonly ids!: bigint[];

  constructor(fn: string, expr: Expr) {
    if (!fn || fn.trim() === '') {
      throw new Error('Function cannot be null or empty');
    }

    this.fn = fn;
    this.terms = [expr];
    this.ids = [];
  }

  add(operationId: bigint, expr: Expr): void {
    if (!expr) {
      throw new Error('Expression cannot be null');
    }

    if (operationId <= 0) {
      throw new Error('OperationId must be greater than 0');
    }

    this.terms.push(expr);
    this.ids.push(operationId);
  }

  balance(): Expr {
    if (this.terms.length <= 1) {
      throw new Error('At least two expressions are required to balance');
    }

    return this.balanceRecursive(0, this.ids.length - 1);
  }

  private balanceRecursive(lo: number, hi: number): Expr {
    const mid = Math.floor((lo + hi + 1) / 2);
    const left =
      mid === lo ? this.terms[mid] : this.balanceRecursive(lo, mid - 1);
    const right =
      mid === hi ? this.terms[mid + 1] : this.balanceRecursive(mid + 1, hi);

    return create(ExprSchema, {
      id: BigInt(this.ids[mid]),
      exprKind: {
        case: 'callExpr',
        value: {
          function: this.fn,
          args: [left, right],
        },
      },
    });
  }
}
