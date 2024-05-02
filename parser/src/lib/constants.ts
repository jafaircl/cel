import { Constant } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { ParseException } from './exceptions';

const DOUBLE_QUOTE = `"`;
const SINGLE_QUOTE = `'`;
const TRIPLE_DOUBLE_QUOTE = `"""`;
const TRIPLE_SINGLE_QUOTE = `'''`;
const MAX_SCRATCH_CODE_POINTS = 8;
const MIN_CODE_POINT = 0;
const MAX_CODE_POINT = 0x10ffff;
const MIN_SURROGATE = 0xd800;
const MAX_SURROGATE = 0xdfff;

export const FALSE = false;
export const TRUE = true;
export const ERROR = '<<error>>';
export const ACCUMULATOR_VAR = '__result__';

/**
 * Parse an integer literal to a Constant.
 *
 * @param text the text to parse
 * @returns a Constant representing the parsed integer
 */
export function parseIntConstant(text: string) {
  const isNegative = text.startsWith('-');
  if (isNegative) {
    text = text.substring(1);
  }
  let value: bigint;
  try {
    value = BigInt(text);
    if (isNegative) {
      value = -value;
    }
  } catch (e) {
    throw new ParseException(
      e instanceof Error ? e.message : 'Integer literal is malformed',
      0
    );
  }
  return new Constant({
    constantKind: {
      case: 'int64Value',
      value,
    },
  });
}

/**
 * Parse an unsigned integer literal to a Constant.
 *
 * @param text the text to parse
 * @returns a Constant representing the parsed unsigned integer
 */
export function parseUintConstant(text: string) {
  if (!text.endsWith('u') && !text.endsWith('U')) {
    throw new ParseException(
      "Unsigned integer literal is missing trailing 'u' suffix",
      0
    );
  }
  text = text.substring(0, text.length - 1);

  const isNegative = text.startsWith('-');
  if (isNegative) {
    text = text.substring(1);
  }
  let value: bigint;
  try {
    value = BigInt(text);
    if (isNegative) {
      value = -value;
    }
  } catch (e) {
    throw new ParseException(
      e instanceof Error ? e.message : 'Unsigned integer literal is malformed',
      0
    );
  }
  return new Constant({
    constantKind: {
      case: 'uint64Value',
      value,
    },
  });
}

/**
 * Parse a double literal to a Constant.
 *
 * @param text the text to parse
 * @returns a Constant representing the parsed double
 */
export function parseDoubleConstant(text: string) {
  let value: number;

  try {
    value = parseFloat(text);
    if (isNaN(value)) {
      throw new ParseException('Double literal is malformed', 0);
    }
  } catch (e) {
    throw new ParseException(
      e instanceof Error ? e.message : 'Double literal is malformed',
      0
    );
  }
  return new Constant({
    constantKind: {
      case: 'doubleValue',
      value,
    },
  });
}

function nextInts(
  iterator: IterableIterator<string>,
  count: number,
  scratch: number[]
): boolean {
  if (count > scratch.length) {
    throw new ParseException('Count exceeds scratch array length', 0);
  }
  let index = 0;
  let next = iterator.next();
  while (!next.done && index < count) {
    scratch[index++] = next.value.codePointAt(0)!;
    next = iterator.next();
  }
  return index === count;
}

function isOctalDigit(codePoint: number): boolean {
  return codePoint >= '0'.charCodeAt(0) && codePoint <= '7'.charCodeAt(0);
}

function areOctalDigits(codePoints: number[], count: number): boolean {
  checkArgument(count <= codePoints.length);
  for (let index = 0; index < count; index++) {
    if (!isOctalDigit(codePoints[index])) {
      return false;
    }
  }
  return true;
}

function isHexDigit(codePoint: number): boolean {
  return (
    (codePoint >= 'a'.charCodeAt(0) && codePoint <= 'f'.charCodeAt(0)) ||
    (codePoint >= 'A'.charCodeAt(0) && codePoint <= 'F'.charCodeAt(0)) ||
    (codePoint >= '0'.charCodeAt(0) && codePoint <= '9'.charCodeAt(0))
  );
}

function areHexDigits(codePoints: number[], count: number): boolean {
  checkArgument(count <= codePoints.length);
  for (let index = 0; index < count; index++) {
    if (!isHexDigit(codePoints[index])) {
      return false;
    }
  }
  return true;
}

function isDigit(codePoint: number): boolean {
  return codePoint >= '0'.charCodeAt(0) && codePoint <= '9'.charCodeAt(0);
}

function toLowerCase(codePoint: number): number {
  return codePoint >= 'A'.charCodeAt(0) && codePoint <= 'Z'.charCodeAt(0)
    ? codePoint - 'A'.charCodeAt(0) + 'a'.charCodeAt(0)
    : codePoint;
}

function checkArgument(condition: boolean): void {
  if (!condition) {
    throw new ParseException('Invalid argument', 0);
  }
}

function checkForClosingQuote(text: string, quote: string): void {
  if (quote.length === 0) {
    return;
  }
  if (text.length < quote.length) {
    throw new ParseException(
      `String literal missing terminating quote ${quote}`,
      0
    );
  }
  let position = 0;
  let isClosed = false;
  while (position + quote.length <= text.length) {
    const codeUnit = text.charAt(position);
    if (codeUnit !== '\\') {
      if (text.substring(position).startsWith(quote)) {
        isClosed = position + quote.length === text.length;
        break;
      }
    } else {
      position++;
    }
    position++;
  }
  if (!isClosed) {
    throw new ParseException(
      `String literal contains unescaped terminating quote ${quote}`,
      position
    );
  }
}

function unhex(value: number, nextValue: number): number {
  if (isDigit(nextValue)) {
    return value * 16 + (nextValue - '0'.charCodeAt(0));
  } else {
    return value * 16 + (toLowerCase(nextValue) - 'a'.charCodeAt(0) + 10);
  }
}

function unhexFromArray(codePoints: number[], length: number): number {
  let value = 0;

  for (let index = 0; index < length; index++) {
    value = unhex(value, codePoints[index]);
  }

  return value;
}

// function unhex(value: number | number[], nextValue?: number): number {
//   if (Array.isArray(value)) {
//     let result = 0;
//     for (let index = 0; index < value.length; index++) {
//       result = unhex(result, value[index]);
//     }
//     return result;
//   } else {
//     if (isDigit(nextValue!)) {
//       return value * 16 + (nextValue! - '0'.charCodeAt(0));
//     } else {
//       return (
//         value * 16 +
//         (nextValue!.toString().toLowerCase().charCodeAt(0) -
//           'a'.charCodeAt(0) +
//           10)
//       );
//     }
//   }
// }

export class ByteString {
  private readonly data: Uint8Array;

  private constructor(data: Uint8Array) {
    this.data = data;
  }

  static copyFrom(bytes: Uint8Array): ByteString {
    const copiedBytes = new Uint8Array(bytes);
    return new ByteString(copiedBytes);
  }

  static newOutput(initialCapacity: number): Output {
    return new Output(initialCapacity);
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.data);
  }

  toString(encoding: BufferEncoding = 'utf-8'): string {
    const buffer = Buffer.from(this.data);
    return buffer.toString(encoding);
  }
}

class Output {
  private buffer: Uint8Array = new Uint8Array();

  constructor(private initialCapacity: number) {}

  write(value: number): void {
    const newBuffer = new Uint8Array(this.buffer.length + 1);
    newBuffer.set(this.buffer);
    newBuffer[this.buffer.length] = value;
    this.buffer = newBuffer;
  }

  toByteString(): ByteString {
    return ByteString.copyFrom(this.buffer);
  }
}

export class StringBuilder {
  private value: string;

  constructor(initialValue: string = '') {
    this.value = initialValue;
  }

  append(str: string): void {
    this.value += str;
  }

  appendCodePoint(codePoint: number): void {
    this.value += String.fromCodePoint(codePoint);
  }

  toString(): string {
    return this.value;
  }
}

interface DecodeBuffer<T> {
  appendByte(b: number): void;
  appendCodePoint(codePoint: number): void;
  toDecodedValue(): T;
}

class DecodeByteStringBuffer implements DecodeBuffer<ByteString> {
  private readonly output: Output;

  constructor(initialCapacity: number) {
    this.output = ByteString.newOutput(initialCapacity);
  }

  appendByte(b: number): void {
    this.output.write(b);
  }

  appendCodePoint(codePoint: number): void {
    if (codePoint < MIN_CODE_POINT || codePoint > MAX_CODE_POINT) {
      throw new ParseException('Invalid code point', 0);
    }

    if (codePoint < 0x80) {
      this.output.write(codePoint);
    } else if (codePoint < 0x800) {
      this.output.write((0xf << 6) | (codePoint >>> 6));
      this.output.write(0x80 | (0x3f & codePoint));
    } else if (codePoint < 0x10000) {
      this.output.write((0xf << 5) | (codePoint >>> 12));
      this.output.write(0x80 | (0x3f & (codePoint >>> 6)));
      this.output.write(0x80 | (0x3f & codePoint));
    } else {
      this.output.write((0xf << 4) | (codePoint >>> 18));
      this.output.write(0x80 | (0x3f & (codePoint >>> 12)));
      this.output.write(0x80 | (0x3f & (codePoint >>> 6)));
      this.output.write(0x80 | (0x3f & codePoint));
    }
  }

  toDecodedValue(): ByteString {
    return this.output.toByteString();
  }
}

class DecodeStringBuffer implements DecodeBuffer<string> {
  private readonly builder: StringBuilder;

  constructor() {
    this.builder = new StringBuilder();
  }

  appendByte(b: number): void {
    this.builder.appendCodePoint(b & 0xff);
  }

  appendCodePoint(codePoint: number): void {
    if (codePoint < MIN_CODE_POINT || codePoint > MAX_CODE_POINT) {
      throw new ParseException('Invalid code point', 0);
    }
    this.builder.appendCodePoint(codePoint);
  }

  toDecodedValue(): string {
    return this.builder.toString();
  }
}

function decodeString<T>(
  offset: number,
  text: string,
  buffer: DecodeBuffer<T>,
  isRawLiteral: boolean,
  isBytesLiteral: boolean
): void {
  let skipNewline = false;
  const iterator = text[Symbol.iterator]();
  let scratchCodePoints: number[] | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const seqOffset = offset; // Save offset for the start of this sequence.
    const result = iterator.next();

    if (result.done) {
      break;
    }

    const codePoint = result.value;
    offset++;

    if (codePoint !== '\\') {
      if (codePoint !== '\r') {
        if (codePoint === '\n' && skipNewline) {
          skipNewline = false;
          continue;
        }
        skipNewline = false;
        buffer.appendCodePoint(codePoint.codePointAt(0)!);
      } else {
        // Normalize '\r' and '\r\n' to '\n'.
        buffer.appendCodePoint('\n'.codePointAt(0)!);
        skipNewline = true;
      }
    } else {
      // An escape sequence.
      skipNewline = false;

      const nextResult = iterator.next();
      if (nextResult.done) {
        throw new ParseException(
          isRawLiteral
            ? 'Raw literals cannot end with an odd number of \\'
            : isBytesLiteral
            ? 'Bytes literal cannot end with \\'
            : 'String literal cannot end with \\',
          seqOffset
        );
      }

      const nextCodePoint = nextResult.value;
      offset++;

      if (isRawLiteral) {
        // For raw literals, all escapes are valid and those characters come through literally in the string.
        buffer.appendCodePoint('\\'.codePointAt(0)!);
        buffer.appendCodePoint(nextCodePoint.codePointAt(0)!);
        continue;
      }

      switch (nextCodePoint) {
        case 'a':
          buffer.appendByte(7);
          break;
        case 'b':
          buffer.appendByte('\b'.codePointAt(0)!);
          break;
        case 'f':
          buffer.appendByte('\f'.codePointAt(0)!);
          break;
        case 'n':
          buffer.appendByte('\n'.codePointAt(0)!);
          break;
        case 'r':
          buffer.appendByte('\r'.codePointAt(0)!);
          break;
        case 't':
          buffer.appendByte('\t'.codePointAt(0)!);
          break;
        case 'v':
          buffer.appendByte(11);
          break;
        case '"':
          buffer.appendByte('"'.codePointAt(0)!);
          break;
        case "'":
          buffer.appendByte("'".codePointAt(0)!);
          break;
        case '\\':
          buffer.appendByte('\\'.codePointAt(0)!);
          break;
        case '?':
          buffer.appendByte('?'.codePointAt(0)!);
          break;
        case '`':
          buffer.appendByte('`'.codePointAt(0)!);
          break;
        case '0':
        case '1':
        case '2':
        case '3':
          {
            if (scratchCodePoints === null) {
              scratchCodePoints = new Array(MAX_SCRATCH_CODE_POINTS);
            }
            // There needs to be 2 octal digits.
            if (
              !nextInts(iterator, 2, scratchCodePoints) ||
              !areOctalDigits(scratchCodePoints, 2)
            ) {
              throw new ParseException(
                'Invalid octal escape sequence',
                seqOffset
              );
            }
            let octalValue =
              nextCodePoint.codePointAt(0)! - '0'.codePointAt(0)!;
            octalValue =
              octalValue * 8 + (scratchCodePoints[0] - '0'.codePointAt(0)!);
            octalValue =
              octalValue * 8 + (scratchCodePoints[1] - '0'.codePointAt(0)!);
            buffer.appendByte(octalValue);
            offset += 2;
          }
          break;
        case 'x':
        case 'X':
          {
            if (scratchCodePoints === null) {
              scratchCodePoints = new Array(MAX_SCRATCH_CODE_POINTS);
            }
            // There needs to be 2 hex digits.
            if (
              !nextInts(iterator, 2, scratchCodePoints) ||
              !areHexDigits(scratchCodePoints, 2)
            ) {
              throw new ParseException(
                'Invalid hex escape sequence',
                seqOffset
              );
            }
            const value = unhexFromArray(scratchCodePoints, 2);
            buffer.appendByte(value);
            offset += 2;
          }
          break;
        case 'u':
          {
            if (isBytesLiteral) {
              throw new ParseException(
                'Illegal escape sequence: Unicode escape sequences cannot be used in bytes literal',
                seqOffset
              );
            }
            if (scratchCodePoints === null) {
              scratchCodePoints = new Array(MAX_SCRATCH_CODE_POINTS);
            }
            // There needs to be 4 hex digits.
            if (
              !nextInts(iterator, 4, scratchCodePoints) ||
              !areHexDigits(scratchCodePoints, 4)
            ) {
              throw new ParseException(
                'Invalid unicode escape sequence',
                seqOffset
              );
            }
            const value = unhexFromArray(scratchCodePoints, 4);
            if (
              value < MIN_CODE_POINT ||
              value > MAX_CODE_POINT ||
              (value >= MIN_SURROGATE && value <= MAX_SURROGATE)
            ) {
              throw new ParseException('Invalid unicode code point', seqOffset);
            }
            buffer.appendCodePoint(value);
            offset += 4;
          }
          break;
        case 'U':
          {
            if (isBytesLiteral) {
              throw new ParseException(
                'Illegal escape sequence: Unicode escape sequences cannot be used in bytes literal',
                offset
              );
            }
            if (scratchCodePoints === null) {
              scratchCodePoints = new Array(MAX_SCRATCH_CODE_POINTS);
            }
            // There needs to be 8 hex digits.
            if (
              !nextInts(iterator, 8, scratchCodePoints) ||
              !areHexDigits(scratchCodePoints, 8)
            ) {
              throw new ParseException(
                'Invalid unicode escape sequence',
                seqOffset
              );
            }
            const value = unhexFromArray(scratchCodePoints, 8);
            if (
              value < MIN_CODE_POINT ||
              value > MAX_CODE_POINT ||
              (value >= MIN_SURROGATE && value <= MAX_SURROGATE)
            ) {
              throw new ParseException('Invalid unicode code point', seqOffset);
            }
            buffer.appendCodePoint(value);
            offset += 8;
          }
          break;
        default:
          throw new ParseException('Illegal escape sequence', seqOffset);
      }
    }
  }
}

export function parseStringConstant(text: string) {
  let offset = 0;
  let isRawLiteral = false;

  if (text.startsWith('r') || text.startsWith('R')) {
    isRawLiteral = true;
    text = text.substring(1);
    offset++;
  }

  let quote: string;
  if (text.startsWith(TRIPLE_DOUBLE_QUOTE)) {
    quote = TRIPLE_DOUBLE_QUOTE;
    text = text.substring(quote.length);
  } else if (text.startsWith(TRIPLE_SINGLE_QUOTE)) {
    quote = TRIPLE_SINGLE_QUOTE;
    text = text.substring(quote.length);
  } else if (text.startsWith(DOUBLE_QUOTE)) {
    quote = DOUBLE_QUOTE;
    text = text.substring(quote.length);
  } else if (text.startsWith(SINGLE_QUOTE)) {
    quote = SINGLE_QUOTE;
    text = text.substring(quote.length);
  } else {
    throw new ParseException(
      'String literal is missing surrounding single or double quotes',
      0
    );
  }

  checkForClosingQuote(text, quote);
  offset += quote.length;
  text = text.substring(0, text.length - quote.length);

  const buffer = new DecodeStringBuffer();
  decodeString(offset, text, buffer, isRawLiteral, false);

  return new Constant({
    constantKind: {
      case: 'stringValue',
      value: buffer.toDecodedValue(),
    },
  });
}

export function parseBytesConstant(text: string) {
  let isRawLiteral = false;
  let offset = 0;

  if (text.startsWith('r') || text.startsWith('R')) {
    isRawLiteral = true;
    text = text.substring(1);
    offset++;

    if (!text.startsWith('b') && !text.startsWith('B')) {
      throw new ParseException(
        "Bytes literal is missing leading 'b' or 'B' prefix",
        0
      );
    }

    text = text.substring(1);
    offset++;
  } else {
    if (!text.startsWith('b') && !text.startsWith('B')) {
      throw new ParseException(
        "Bytes literal is missing leading 'b' or 'B' prefix",
        0
      );
    }

    text = text.substring(1);
    offset++;

    if (text.startsWith('r') || text.startsWith('R')) {
      isRawLiteral = true;
      text = text.substring(1);
      offset++;
    }
  }

  let quote: string;
  if (text.startsWith(TRIPLE_DOUBLE_QUOTE)) {
    quote = TRIPLE_DOUBLE_QUOTE;
    text = text.substring(quote.length);
  } else if (text.startsWith(TRIPLE_SINGLE_QUOTE)) {
    quote = TRIPLE_SINGLE_QUOTE;
    text = text.substring(quote.length);
  } else if (text.startsWith(DOUBLE_QUOTE)) {
    quote = DOUBLE_QUOTE;
    text = text.substring(quote.length);
  } else if (text.startsWith(SINGLE_QUOTE)) {
    quote = SINGLE_QUOTE;
    text = text.substring(quote.length);
  } else {
    throw new ParseException(
      'Bytes literal is missing surrounding single or double quotes',
      0
    );
  }

  checkForClosingQuote(text, quote);
  offset += quote.length;
  text = text.substring(0, text.length - quote.length);

  const buffer = new DecodeByteStringBuffer(text.length);
  decodeString(offset, text, buffer, isRawLiteral, true);

  return new Constant({
    constantKind: {
      case: 'bytesValue',
      value: buffer.toDecodedValue().toUint8Array(),
    },
  });
}

export const RESERVED_IDS = new Set([
  'as',
  'break',
  'const',
  'continue',
  'else',
  'false',
  'for',
  'function',
  'if',
  'import',
  'in',
  'let',
  'loop',
  'package',
  'namespace',
  'null',
  'return',
  'true',
  'var',
  'void',
  'while',
]);
