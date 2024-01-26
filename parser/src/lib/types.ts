import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import {
  Any,
  BoolValue,
  BytesValue,
  DoubleValue,
  FloatValue,
  Int32Value,
  Int64Value,
  ListValue,
  Value as ProtobufValue,
  StringValue,
  Struct,
  UInt32Value,
  UInt64Value,
} from '@bufbuild/protobuf';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Binding = Value | Function;

export const base_messages = [
  Any,
  ListValue,
  Struct,
  ProtobufValue,
  BoolValue,
  BytesValue,
  DoubleValue,
  FloatValue,
  Int32Value,
  Int64Value,
  StringValue,
  UInt32Value,
  UInt64Value,
];
