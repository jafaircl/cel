import { ExprValue } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { NULL_VALUE } from './util';

/**
 * Converts an expression value to a native value.
 *
 * @param exprValue the expression value to convert to native
 * @returns a native value
 */
export function exprValueToNative(exprValue: ExprValue) {
  switch (exprValue.kind.case) {
    case 'value':
      return valueToNative(exprValue.kind.value);
    case 'error':
      return exprValue.kind.value;
    case 'unknown':
      return exprValue.kind.value;
    default:
      throw new Error('unsupported');
  }
}

export type NativeValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | Uint8Array
  | NativeValue[]
  | NativeObject;

export type NativeObject = {
  [k: string]: NativeValue;
};

function valueToNative(value: Value): NativeValue {
  switch (value.kind.case) {
    case 'boolValue':
    case 'bytesValue':
    case 'doubleValue':
    case 'int64Value':
    case 'stringValue':
    case 'uint64Value':
      return value.kind.value;
    case 'enumValue':
      return value.kind.value.value;
    case 'listValue':
      return value.kind.value.values.map(valueToNative);
    case 'mapValue':
      return value.kind.value.entries.reduce((acc, entry) => {
        if (!entry.key) return acc;
        switch (entry.key.kind.case) {
          case 'stringValue':
            acc[entry.key.kind.value] = valueToNative(
              entry.value ?? NULL_VALUE
            );
            return acc;
          case 'int64Value':
          case 'uint64Value':
            acc[entry.key.kind.value.toString()] = valueToNative(
              entry.value ?? NULL_VALUE
            );
            return acc;
          default:
            return acc;
        }
      }, {} as Record<string, NativeValue>);
    case 'nullValue':
      return null;
    default:
      throw new Error('unsupported');
  }
}
