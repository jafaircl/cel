import {
  Expr,
  ExprSchema,
  Expr_SelectSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { ACCUMULATOR_VAR } from './constants';
import { Operator } from './operator';
import {
  boolExpr,
  globalCall,
  identExpr,
  int64Expr,
  isNil,
  listExpr,
} from './util';

export const STANDARD_MACROS = new Set([
  Operator.HAS,
  Operator.ALL,
  Operator.EXISTS,
  Operator.EXISTS_ONE,
  Operator.MAP,
  // Operator.MAP_FILTER, // TODO: Implement this
  Operator.FILTER,
]);

export function findMacro(name: string) {
  return STANDARD_MACROS.has(name as Operator) ? (name as Operator) : undefined;
}

export function expandMacro(op: Operator, target: Expr, args: Expr[]): Expr {
  switch (op) {
    case Operator.HAS:
      return expandHasMacro(target, args);
    case Operator.ALL:
      return expandAllMacro(target, args);
    case Operator.EXISTS:
      return expandExistsMacro(target, args);
    case Operator.EXISTS_ONE:
      return expandExistsOneMacro(target, args);
    case Operator.MAP:
      return expandMapMacro(target, args);
    case Operator.FILTER:
      return expandFilterMacro(target, args);
    default:
      throw new Error(`Unknown macro: ${op}`);
  }
}

export function expandHasMacro(target: Expr, args: Expr[]): Expr {
  const arg = args[0];
  if (arg.exprKind.case !== 'selectExpr') {
    throw new Error('Invalid argument to has() macro');
  }
  return create(ExprSchema, {
    exprKind: {
      case: 'selectExpr',
      value: create(Expr_SelectSchema, {
        operand: arg.exprKind.value.operand,
        field: arg.exprKind.value.field,
        testOnly: true,
      }),
    },
  });
}

export function expandAllMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to all() macro');
  }
  const arg1 = args[1];
  const accuInit = boolExpr(true);
  const condition = globalCall(
    Operator.NOT_STRICTLY_FALSE,
    identExpr(ACCUMULATOR_VAR)
  );
  const step = globalCall(
    Operator.LOGICAL_AND,
    identExpr(ACCUMULATOR_VAR),
    arg1
  );
  const result = identExpr(ACCUMULATOR_VAR);
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandExistsMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to all() macro');
  }
  const arg1 = args[1];
  const accuInit = boolExpr(false);
  const condition = globalCall(
    Operator.NOT_STRICTLY_FALSE,
    globalCall(Operator.LOGICAL_NOT, identExpr(ACCUMULATOR_VAR))
  );
  const step = globalCall(
    Operator.LOGICAL_OR,
    identExpr(ACCUMULATOR_VAR),
    arg1
  );
  const result = identExpr(ACCUMULATOR_VAR);
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandExistsOneMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to all() macro');
  }
  const arg1 = args[1];
  const zeroExpr = int64Expr(BigInt(0));
  const oneExpr = int64Expr(BigInt(1));
  const accuInit = zeroExpr;
  const condition = boolExpr(true);
  const step = globalCall(
    Operator.CONDITIONAL,
    arg1,
    globalCall(Operator.ADD, identExpr(ACCUMULATOR_VAR), oneExpr),
    identExpr(ACCUMULATOR_VAR)
  );
  const result = globalCall(
    Operator.EQUALS,
    identExpr(ACCUMULATOR_VAR),
    oneExpr
  );
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandMapMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to map() macro');
  }
  let arg1: Expr;
  let arg2: Expr;
  if (args.length === 3) {
    arg2 = args[1];
    arg1 = args[2];
  } else {
    arg1 = args[1];
    arg2 = null as unknown as Expr;
  }
  const accuInit = listExpr([]);
  const condition = boolExpr(true);
  let step = globalCall(
    Operator.ADD,
    identExpr(ACCUMULATOR_VAR),
    listExpr([arg1])
  );
  if (!isNil(arg2)) {
    step = globalCall(
      Operator.CONDITIONAL,
      arg2,
      step,
      identExpr(ACCUMULATOR_VAR)
    );
  }
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    identExpr(ACCUMULATOR_VAR)
  );
}

export function expandFilterMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to filter() macro');
  }
  const arg1 = args[1];
  const accuInit = listExpr([]);
  const condition = boolExpr(true);
  let step = globalCall(
    Operator.ADD,
    identExpr(ACCUMULATOR_VAR),
    listExpr([arg0])
  );
  step = globalCall(
    Operator.CONDITIONAL,
    arg1,
    step,
    identExpr(ACCUMULATOR_VAR)
  );
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    identExpr(ACCUMULATOR_VAR)
  );
}

function fold(
  iterVar: string,
  iterRange: Expr,
  accuVar: string,
  accuInit: Expr,
  condition: Expr,
  step: Expr,
  result: Expr
): Expr {
  return create(ExprSchema, {
    exprKind: {
      case: 'comprehensionExpr',
      value: {
        iterVar,
        iterRange,
        accuVar,
        accuInit,
        loopCondition: condition,
        loopStep: step,
        result,
      },
    },
  });
}
