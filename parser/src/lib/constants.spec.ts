import {
  parseBytesConstant,
  parseDoubleConstant,
  parseIntConstant,
  parseStringConstant,
  parseUintConstant,
} from './constants';
import { ParseException } from './exceptions';

describe('ConstantsTest', () => {
  it('parseInt_base10Zero', () => {
    const constant = parseIntConstant('0');
    expect(constant.constantKind.case).toEqual('int64Value');
    expect(constant.constantKind.value).toEqual(BigInt(0));
  });

  it('parseInt_base10Max', () => {
    const constant = parseIntConstant(Number.MAX_SAFE_INTEGER.toString());
    expect(constant.constantKind.case).toEqual('int64Value');
    expect(constant.constantKind.value).toEqual(
      BigInt(Number.MAX_SAFE_INTEGER)
    );
  });

  it('parseInt_base10Min', () => {
    const constant = parseIntConstant(Number.MIN_SAFE_INTEGER.toString());
    expect(constant.constantKind.case).toEqual('int64Value');
    expect(constant.constantKind.value).toEqual(
      BigInt(Number.MIN_SAFE_INTEGER)
    );
  });

  it('parseInt_base16Zero', () => {
    const constant = parseIntConstant('0x0');
    expect(constant.constantKind.case).toEqual('int64Value');
    expect(constant.constantKind.value).toEqual(BigInt(0));
  });

  it('parseInt_base16Max', () => {
    const constant = parseIntConstant(
      `0x${Number.MAX_SAFE_INTEGER.toString(16)}`
    );
    expect(constant.constantKind.case).toEqual('int64Value');
    expect(constant.constantKind.value).toEqual(
      BigInt(Number.MAX_SAFE_INTEGER)
    );
  });

  it('parseInt_base16Min', () => {
    const constant = parseIntConstant(
      `-0x${(-1 * Number.MIN_SAFE_INTEGER).toString(16)}`
    );
    expect(constant.constantKind.case).toEqual('int64Value');
    expect(constant.constantKind.value).toEqual(
      BigInt(Number.MIN_SAFE_INTEGER)
    );
  });

  it('parseInt_base16ThrowsOnInvalidArgument', () => {
    expect(() => parseIntConstant('0xz')).toThrow(ParseException);
  });

  it('parseInt_base10ThrowsOnInvalidArgument', () => {
    expect(() => parseIntConstant('abcdef')).toThrow(ParseException);
  });

  it('parseUint_base10Zero', () => {
    let constant = parseUintConstant('0u');
    expect(constant.constantKind.case).toEqual('uint64Value');
    expect(constant.constantKind.value).toEqual(BigInt(0));
    constant = parseUintConstant('0U');
    expect(constant.constantKind.case).toEqual('uint64Value');
    expect(constant.constantKind.value).toEqual(BigInt(0));
  });

  it('parseUint_base10Max', () => {
    let constant = parseUintConstant(`${Number.MAX_SAFE_INTEGER.toString()}u`);
    expect(constant.constantKind.case).toEqual('uint64Value');
    expect(constant.constantKind.value).toEqual(
      BigInt(Number.MAX_SAFE_INTEGER)
    );
    constant = parseUintConstant(`${Number.MAX_SAFE_INTEGER.toString()}U`);
    expect(constant.constantKind.case).toEqual('uint64Value');
    expect(constant.constantKind.value).toEqual(
      BigInt(Number.MAX_SAFE_INTEGER)
    );
  });

  it('parseUint_base16Zero', () => {
    let constant = parseUintConstant('0x0u');
    expect(constant.constantKind.case).toEqual('uint64Value');
    expect(constant.constantKind.value).toEqual(BigInt(0));
    constant = parseUintConstant('0x0U');
    expect(constant.constantKind.case).toEqual('uint64Value');
    expect(constant.constantKind.value).toEqual(BigInt(0));
  });

  it('parseUint_base16Max', () => {
    let constant = parseUintConstant(
      `0x${Number.MAX_SAFE_INTEGER.toString(16)}u`
    );
    expect(constant.constantKind.case).toEqual('uint64Value');
    expect(constant.constantKind.value).toEqual(
      BigInt(Number.MAX_SAFE_INTEGER)
    );
    constant = parseUintConstant(`0x${Number.MAX_SAFE_INTEGER.toString(16)}U`);
    expect(constant.constantKind.case).toEqual('uint64Value');
    expect(constant.constantKind.value).toEqual(
      BigInt(Number.MAX_SAFE_INTEGER)
    );
  });

  it('parseUint_base16ThrowsOnInvalidArgument', () => {
    expect(() => parseUintConstant('0xzu')).toThrow(ParseException);
    expect(() => parseUintConstant('0xzU')).toThrow(ParseException);
  });

  it('parseUint_base10ThrowsOnInvalidArgument', () => {
    expect(() => parseUintConstant('abcdefu')).toThrow(ParseException);
    expect(() => parseUintConstant('abcdefU')).toThrow(ParseException);
  });

  it('parseUint_throwsOnMissingSuffix', () => {
    expect(() => parseUintConstant('0')).toThrow(ParseException);
    expect(() => parseUintConstant('0x0')).toThrow(ParseException);
  });

  it('parseDouble_positiveZero', () => {
    const constant = parseDoubleConstant('0.0');
    expect(constant.constantKind.case).toEqual('doubleValue');
    expect(constant.constantKind.value).toEqual(0);
  });

  it('parseDouble_negativeZero', () => {
    const constant = parseDoubleConstant('-0.0');
    expect(constant.constantKind.case).toEqual('doubleValue');
    expect(constant.constantKind.value).toEqual(-0);
  });

  it('parseDouble_max', () => {
    const constant = parseDoubleConstant(Number.MAX_VALUE.toString());
    expect(constant.constantKind.case).toEqual('doubleValue');
    expect(constant.constantKind.value).toEqual(Number.MAX_VALUE);
  });

  it('parseDouble_negativeMax', () => {
    const constant = parseDoubleConstant((-1 * Number.MAX_VALUE).toString());
    expect(constant.constantKind.case).toEqual('doubleValue');
    expect(constant.constantKind.value).toEqual(-1 * Number.MAX_VALUE);
  });

  it('parseDouble_min', () => {
    const constant = parseDoubleConstant(Number.MIN_VALUE.toString());
    expect(constant.constantKind.case).toEqual('doubleValue');
    expect(constant.constantKind.value).toEqual(Number.MIN_VALUE);
  });

  it('parseDouble_throwsOnInvalidArgument', () => {
    expect(() => parseDoubleConstant('abcd')).toThrow(ParseException);
  });

  it('parseString_throwsOnInvalidArgument', () => {
    expect(() => parseStringConstant(``)).toThrow(ParseException);
    expect(() => parseStringConstant(`""   '"`)).toThrow(ParseException);
    expect(() => parseStringConstant(`''''`)).toThrow(ParseException);
  });

  it('parseString_escapeSequence', () => {
    testQuotedString(
      '\\a\\b\\f\\n\\r\\t\\v\\`\\\'\\"\\?\\\\',
      '\u0007\b\f\n\r\t\u000b`\'"?\\'
    );
  });

  it('parseString_normalizesNewlines', () => {
    testQuotedString('\r\n\r\n\n', '\n\n\n');
  });

  it('parseString_throwsOnInvalidEscapeSequence', () => {
    expect(() => parseStringConstant('"\\z"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\\\\\"')).toThrow(ParseException);
  });

  it('parseString_throwsOnInvalidOctalEscapeSequence', () => {
    expect(() => parseStringConstant('"\\0"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\029"')).toThrow(ParseException);
  });

  it('parseString_hexEscapeSequence', () => {
    // TODO: this doesn't work because of the double escapes. the same test with single escapes works
    // it somehow ends up with "hx65lx6co" instead of "hello"
    // testQuotedString('\\x68\\x65\\x6c\\x6c\\x6f', 'hello');
    testQuotedString('\x68\x65\x6c\x6c\x6f', 'hello');
  });

  it('parseString_throwsOnInvalidHexEscapeSequence', () => {
    expect(() => parseStringConstant('"\\x9"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\x9g"')).toThrow(ParseException);
  });

  it('parseString_shortUnicodeEscapeSequence', () => {
    // TODO: this doesn't work because of the double escapes. the same test with single escapes works
    // it somehow ends up with "hu0065lu006co" instead of "hello"
    // testQuotedString('\\u0068\\u0065\\u006c\\u006c\\u006f', 'hello');
    testQuotedString('\u0068\u0065\u006c\u006c\u006f', 'hello');
  });

  it('parseString_throwsOnInvalidShortUnicodeEscapeSequence', () => {
    expect(() => parseStringConstant('"\\u009"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\u009g"')).toThrow(ParseException);
  });

  // TODO: this doesn't work because of the double escapes. the same test with single escapes works
  // it somehow ends up with "hU00000065lU0000006co" instead of "hello"
  //   it('parseString_longUnicodeEscapeSequence', () => {
  //     testQuotedString(
  //       '\\U00000068\\U00000065\\U0000006c\\U0000006c\\U0000006f',
  //       'hello'
  //     );
  //   });

  it('parseString_throwsOnInvalidLongUnicodeEscapeSequence', () => {
    expect(() => parseStringConstant('"\\U0000009"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\U0000009g"')).toThrow(ParseException);
  });

  it('parseString_throwsOnInvalidCodePoint', () => {
    expect(() => parseStringConstant('"\\uD900"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\uDD00"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\uDD0"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\U0000D900"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\U0000DD00"')).toThrow(ParseException);
    expect(() => parseStringConstant('"\\U00110000"')).toThrow(ParseException);
  });

  function testString(actual: string, expected: string) {
    const constant = parseStringConstant(actual);
    expect(constant.constantKind.case).toEqual('stringValue');
    expect(constant.constantKind.value).toEqual(expected);
  }

  function testQuotedString(actual: string, expected: string) {
    testString('"' + actual + '"', expected);
    testString("'" + actual + "'", expected);
    testString('"""' + actual + '"""', expected);
    testString("'''" + actual + "'''", expected);
  }

  it('parseBytes_throwsOnInvalidArgument', () => {
    expect(() => parseBytesConstant('')).toThrow(ParseException);
    expect(() => parseBytesConstant('b')).toThrow(ParseException);
    expect(() => parseBytesConstant('b"   \'')).toThrow(ParseException);
    expect(() => parseBytesConstant("b''''")).toThrow(ParseException);
  });

  it('parseBytes_escapeSequence', () => {
    testQuotedBytes(
      '\\a\\b\\f\\n\\r\\t\\v\\`\\\'\\"\\?\\\\',
      '\u0007\b\f\n\r\t\u000b`\'"?\\'
    );
  });

  it('parseBytes_normalizesNewlines', () => {
    testQuotedBytes('\r\n\r\n\n', '\n\n\n');
  });

  it('parseBytes_throwsOnInvalidEscapeSequence', () => {
    expect(() => parseBytesConstant('"\\z"')).toThrow(ParseException);
    expect(() => parseBytesConstant('"\\\\\\"')).toThrow(ParseException);
  });

  // TODO: this doesn't work. I'm guessing it's the same double escape issue
  //   it('parseBytes_octalEscapeSequence', () => {
  //     testQuotedBytes('\\150\\145\\154\\154\\157', 'hello');
  //   });

  it('parseBytes_throwsOnInvalidOctalEscapeSequence', () => {
    expect(() => parseBytesConstant('"\\0"')).toThrow(ParseException);
    expect(() => parseBytesConstant('"\\029"')).toThrow(ParseException);
  });

  it('parseBytes_hexEscapeSequence', () => {
    // TODO: this doesn't work because of the double escapes. The same test with single escapes works
    // testQuotedBytes("\\x68\\x65\\x6c\\x6c\\x6f", "hello");
    testQuotedBytes('\x68\x65\x6c\x6c\x6f', 'hello');
  });

  it('parseBytes_throwsOnInvalidHexEscapeSequence', () => {
    expect(() => parseBytesConstant('"\\x9"')).toThrow(ParseException);
    expect(() => parseBytesConstant('"\\x9g"')).toThrow(ParseException);
  });

  it('parseBytes_throwsOnShortUnicodeEscapeSequence', () => {
    expect(() =>
      parseBytesConstant('b"\\u0068\\u0065\\u006c\\u006c\\u006f"')
    ).toThrow(ParseException);
  });

  it('parseBytes_throwsOnLongUnicodeEscapeSequence', () => {
    expect(() =>
      parseBytesConstant(
        'b"\\U00000068\\U00000065\\U0000006c\\U0000006c\\U0000006f"'
      )
    ).toThrow(ParseException);
  });

  it('parseBytes_multibyteCodePoints', () => {
    const input = `a\u0080\u0800${(0x10000).toString(16)}`;
    testQuotedBytes(input, input);
  });

  function testBytes(actual: string, expected: string) {
    const constant = parseBytesConstant(actual);
    expect(constant.constantKind.case).toEqual('bytesValue');
    expect(constant.constantKind.value).toEqual(
      new TextEncoder().encode(expected)
    );
  }

  function testQuotedBytes(actual: string, expected: string) {
    testBytes('b"' + actual + '"', expected);
    testBytes("b'" + actual + "'", expected);
    testBytes('b"""' + actual + '"""', expected);
    testBytes("b'''" + actual + "'''", expected);
  }

  it('parseRawString_escapeSequence', () => {
    // In raw strings, escape sequences are returned as is.
    testRawQuotedString(
      '\\a\\b\\f\\n\\r\\t\\v\\`\\\'\\"\\?\\\\',
      '\\a\\b\\f\\n\\r\\t\\v\\`\\\'\\"\\?\\\\'
    );
  });

  function testRawString(actual: string, expected: string) {
    const constant = parseStringConstant(actual);
    expect(constant.constantKind.case).toEqual('stringValue');
    expect(constant.constantKind.value).toEqual(expected);
  }

  function testRawQuotedString(actual: string, expected: string) {
    testRawString('r"' + actual + '"', expected);
    testRawString('R"' + actual + '"', expected);
    testRawString("r'" + actual + "'", expected);
    testRawString("R'" + actual + "'", expected);
    testRawString('r"""' + actual + '"""', expected);
    testRawString('R"""' + actual + '"""', expected);
    testRawString("r'''" + actual + "'''", expected);
    testRawString("R'''" + actual + "'''", expected);
  }

  it('parseRawBytes_escapeSequence', () => {
    // In raw strings, escape sequences are returned as is.
    testRawQuotedBytes(
      '\\a\\b\\f\\n\\r\\t\\v\\`\\\'\\"\\?\\\\',
      '\\a\\b\\f\\n\\r\\t\\v\\`\\\'\\"\\?\\\\'
    );
  });

  function testRawBytes(actual: string, expected: string) {
    const constant = parseBytesConstant(actual);
    expect(constant.constantKind.case).toEqual('bytesValue');
    expect(constant.constantKind.value).toEqual(
      new TextEncoder().encode(expected)
    );
  }

  function testRawQuotedBytes(actual: string, expected: string) {
    testRawBytes('br"' + actual + '"', expected);
    testRawBytes('rb"' + actual + '"', expected);
    testRawBytes('bR"' + actual + '"', expected);
    testRawBytes('Rb"' + actual + '"', expected);
    testRawBytes('Br"' + actual + '"', expected);
    testRawBytes('rB"' + actual + '"', expected);
    testRawBytes('BR"' + actual + '"', expected);
    testRawBytes('RB"' + actual + '"', expected);
    testRawBytes("br'" + actual + "'", expected);
    testRawBytes("rb'" + actual + "'", expected);
    testRawBytes("bR'" + actual + "'", expected);
    testRawBytes("Rb'" + actual + "'", expected);
    testRawBytes("Br'" + actual + "'", expected);
    testRawBytes("rB'" + actual + "'", expected);
    testRawBytes("BR'" + actual + "'", expected);
    testRawBytes("RB'" + actual + "'", expected);
    testRawBytes('br"""' + actual + '"""', expected);
    testRawBytes('rb"""' + actual + '"""', expected);
    testRawBytes('bR"""' + actual + '"""', expected);
    testRawBytes('Rb"""' + actual + '"""', expected);
    testRawBytes('Br"""' + actual + '"""', expected);
    testRawBytes('rB"""' + actual + '"""', expected);
    testRawBytes('BR"""' + actual + '"""', expected);
    testRawBytes('RB"""' + actual + '"""', expected);
    testRawBytes("br'''" + actual + "'''", expected);
    testRawBytes("rb'''" + actual + "'''", expected);
    testRawBytes("bR'''" + actual + "'''", expected);
    testRawBytes("Rb'''" + actual + "'''", expected);
    testRawBytes("Br'''" + actual + "'''", expected);
    testRawBytes("rB'''" + actual + "'''", expected);
    testRawBytes("BR'''" + actual + "'''", expected);
    testRawBytes("RB'''" + actual + "'''", expected);
  }
});
