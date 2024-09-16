import { ExprValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import { fromJson } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import { exprValueToNative } from './to-native';

describe('exprValueToNative', () => {
  it('should convert a boolean value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, { value: { boolValue: true } })
      )
    ).toEqual(true);
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, { value: { boolValue: false } })
      )
    ).toEqual(false);
  });

  it('should convert a bytes value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, { value: { bytesValue: 'aGVsbG8=' } })
      )
    ).toEqual(new TextEncoder().encode('hello'));
  });

  it('should convert a double value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, { value: { doubleValue: 3.14 } })
      )
    ).toEqual(3.14);
  });

  it('should convert a int64 value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, { value: { int64Value: '7' } })
      )
    ).toEqual(BigInt(7));
  });

  it('should convert a string value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, { value: { stringValue: 'hello' } })
      )
    ).toEqual('hello');
  });

  it('should convert a uint64 value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, { value: { uint64Value: '7' } })
      )
    ).toEqual(BigInt(7));
  });

  it('should convert an enum value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, { value: { enumValue: { value: 1 } } })
      )
    ).toEqual(1);
  });

  it('should convert a list value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, {
          value: {
            listValue: {
              values: [
                { int64Value: '1' },
                { int64Value: '2' },
                { int64Value: '3' },
              ],
            },
          },
        })
      )
    ).toEqual([BigInt(1), BigInt(2), BigInt(3)]);
  });

  it('should convert a map value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, {
          value: {
            mapValue: {
              entries: [
                {
                  key: { stringValue: 'a' },
                  value: { int64Value: '1' },
                },
                {
                  key: { stringValue: 'b' },
                  value: { int64Value: '2' },
                },
                {
                  key: { stringValue: 'c' },
                  value: { int64Value: '3' },
                },
              ],
            },
          },
        })
      )
    ).toEqual({ a: BigInt(1), b: BigInt(2), c: BigInt(3) });
  });

  it('should convert a null value to native', () => {
    expect(
      exprValueToNative(
        fromJson(ExprValueSchema, {
          value: { nullValue: NullValue.NULL_VALUE },
        })
      )
    ).toEqual(null);
  });
});
