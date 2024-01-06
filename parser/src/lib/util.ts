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
