import {
  Constant,
  Expr,
  Expr_Ident,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { ParserRuleContext } from 'antlr4';

export function uniqueIdFromContext(ctx: ParserRuleContext) {
  return BigInt(ctx.start.start);
}

export function parseString(str: string) {
  const decoded = decodeURIComponent(str);
  return decoded.replace(/\\([abfnrtv'"\\])/g, '$1');
}

export function parseBytes(str: string) {
  // Remove double escapes from the string
  str = parseString(str);
  // Match octal or hexadecimal numbers
  const octalOrHexadecimalNumbers = str.match(
    /\\[0-7]{1,3}|\\x[0-9a-fA-F]{2}/g
  );
  if (octalOrHexadecimalNumbers) {
    const uint8Array = new Uint8Array(octalOrHexadecimalNumbers.length);
    for (let i = 0; i < octalOrHexadecimalNumbers.length; i++) {
      const octalOrHexadecimalNumber = octalOrHexadecimalNumbers[i];
      if (octalOrHexadecimalNumber.startsWith('\\x')) {
        uint8Array[i] = parseInt(octalOrHexadecimalNumber.slice(2), 16);
      } else {
        uint8Array[i] = parseInt(octalOrHexadecimalNumber.slice(1), 8);
      }
    }
    return uint8Array;
  }
  return new TextEncoder().encode(str);
}

export function parseInt64(str: string) {
  const decoded = decodeURIComponent(str);
  if (decoded.startsWith('-')) {
    return -BigInt(decoded.slice(1));
  }
  return BigInt(decoded);
}

export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function boolConstant(value: boolean) {
  return new Constant({
    constantKind: {
      case: 'boolValue',
      value,
    },
  });
}

export function boolExpr(value: boolean) {
  return new Expr({
    exprKind: {
      case: 'constExpr',
      value: boolConstant(value),
    },
  });
}

export function int64Constant(value: bigint) {
  return new Constant({
    constantKind: {
      case: 'int64Value',
      value,
    },
  });
}

export function int64Expr(value: bigint) {
  return new Expr({
    exprKind: {
      case: 'constExpr',
      value: int64Constant(value),
    },
  });
}

export function uint64Constant(value: bigint) {
  return new Constant({
    constantKind: {
      case: 'uint64Value',
      value,
    },
  });
}

export function uint64Expr(value: bigint) {
  return new Expr({
    exprKind: {
      case: 'constExpr',
      value: uint64Constant(value),
    },
  });
}

export function doubleConstant(value: number) {
  return new Constant({
    constantKind: {
      case: 'doubleValue',
      value,
    },
  });
}

export function doubleExpr(value: number) {
  return new Expr({
    exprKind: {
      case: 'constExpr',
      value: doubleConstant(value),
    },
  });
}

export function stringConstant(value: string) {
  return new Constant({
    constantKind: {
      case: 'stringValue',
      value,
    },
  });
}

export function stringExpr(value: string) {
  return new Expr({
    exprKind: {
      case: 'constExpr',
      value: stringConstant(value),
    },
  });
}

export function bytesConstant(value: Uint8Array) {
  return new Constant({
    constantKind: {
      case: 'bytesValue',
      value,
    },
  });
}

export function bytesExpr(value: Uint8Array) {
  return new Expr({
    exprKind: {
      case: 'constExpr',
      value: bytesConstant(value),
    },
  });
}

export function identExpr(name: string) {
  return new Expr({
    exprKind: {
      case: 'identExpr',
      value: new Expr_Ident({
        name,
      }),
    },
  });
}

export function globalCall(functionName: string, ...args: Expr[]) {
  return new Expr({
    exprKind: {
      case: 'callExpr',
      value: {
        function: functionName,
        args,
      },
    },
  });
}

export function listExpr(exprs: Expr[]) {
  return new Expr({
    exprKind: {
      case: 'listExpr',
      value: {
        elements: exprs,
      },
    },
  });
}
