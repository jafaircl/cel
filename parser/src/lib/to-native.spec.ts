import { ExprValue } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb';
import { NullValue } from '@bufbuild/protobuf';
import { exprValueToNative } from './to-native';

describe('exprValueToNative', () => {
  it('should convert a boolean value to native', () => {
    expect(
      exprValueToNative(ExprValue.fromJson({ value: { boolValue: true } }))
    ).toEqual(true);
    expect(
      exprValueToNative(ExprValue.fromJson({ value: { boolValue: false } }))
    ).toEqual(false);
  });

  it('should convert a bytes value to native', () => {
    expect(
      exprValueToNative(
        ExprValue.fromJson({ value: { bytesValue: 'aGVsbG8=' } })
      )
    ).toEqual(new TextEncoder().encode('hello'));
  });

  it('should convert a double value to native', () => {
    expect(
      exprValueToNative(ExprValue.fromJson({ value: { doubleValue: 3.14 } }))
    ).toEqual(3.14);
  });

  it('should convert a int64 value to native', () => {
    expect(
      exprValueToNative(ExprValue.fromJson({ value: { int64Value: '7' } }))
    ).toEqual(BigInt(7));
  });

  it('should convert a string value to native', () => {
    expect(
      exprValueToNative(ExprValue.fromJson({ value: { stringValue: 'hello' } }))
    ).toEqual('hello');
  });

  it('should convert a uint64 value to native', () => {
    expect(
      exprValueToNative(ExprValue.fromJson({ value: { uint64Value: '7' } }))
    ).toEqual(BigInt(7));
  });

  it('should convert an enum value to native', () => {
    expect(
      exprValueToNative(
        ExprValue.fromJson({ value: { enumValue: { value: 1 } } })
      )
    ).toEqual(1);
  });

  it('should convert a list value to native', () => {
    expect(
      exprValueToNative(
        ExprValue.fromJson({
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
        ExprValue.fromJson({
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
        ExprValue.fromJson({ value: { nullValue: NullValue.NULL_VALUE } })
      )
    ).toEqual(null);
  });
});
