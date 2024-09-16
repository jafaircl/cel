/* eslint-disable @typescript-eslint/no-explicit-any */
import { Decl } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { TestAllTypesSchema as TestAllTypesProto2Schema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/conformance/proto2/test_all_types_pb.js';
import { TestAllTypesSchema as TestAllTypesProto3Schema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/conformance/proto3/test_all_types_pb.js';
import { SimpleTestFile } from '@buf/google_cel-spec.bufbuild_es/cel/expr/conformance/simple_pb.js';
import { ExprValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { DescMessage, create, createRegistry } from '@bufbuild/protobuf';
import { AnySchema } from '@bufbuild/protobuf/wkt';
import { parseAndEval } from '../../parse';
import { Binding } from '../../types';

declare const it: any;
declare const expect: any;

// class TestAllTypesForTestProto3 extends TestAllTypesProto3 {
//   static readonly typeName = 'TestAllTypes' as any;
// }

// class TestAllTypesForTestProto2 extends TestAllTypesProto2 {
//   static readonly typeName = 'TestAllTypes' as any;
// }

// class AnyProtobuf extends Any {
//   static readonly typeName = 'protobuf.Any' as any;
// }

const messageTypes: DescMessage[] = [AnySchema];

export function runTest(testFile: SimpleTestFile) {
  for (const section of testFile.section) {
    for (const test of section.test) {
      it(`${section.name} - ${test.name}`, () => {
        const declarations: Decl[] = test.typeEnv;
        const bindings: Record<string, Binding> = {};
        for (const [name, value] of Object.entries(test.bindings)) {
          if (value.kind.case === 'value') {
            bindings[name] = value.kind.value;
          }
        }
        if (test.container === 'google.api.expr.test.v1.proto3') {
          // Rename the container so that the test can find the message type.
          test.container = 'cel.expr.conformance.proto3';
          messageTypes.push(TestAllTypesProto3Schema);
        } else if (test.container === 'google.api.expr.test.v1.proto2') {
          // Rename the container so that the test can find the message type.
          test.container = 'cel.expr.conformance.proto2';
          messageTypes.push(TestAllTypesProto2Schema);
        }
        if (
          test.resultMatcher.case === 'value' &&
          test.resultMatcher.value.kind.value
        ) {
          expect(
            parseAndEval(test.expr, {
              declarations,
              registry: createRegistry(...messageTypes),
              bindings,
              check: test.disableCheck === false,
              container: test.container,
            })
          ).toEqual(
            create(ExprValueSchema, {
              kind: {
                case: 'value',
                value: create(ValueSchema, {
                  kind: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    case: test.resultMatcher.value.kind.case as any,
                    value: test.resultMatcher.value.kind.value,
                  },
                }),
              },
            })
          );
        }
        if (test.resultMatcher.case === 'evalError') {
          expect(
            parseAndEval(test.expr, {
              declarations,
              registry: createRegistry(...messageTypes),
              bindings,
              check: test.disableCheck === false,
              container: test.container,
            })
          ).toEqual(
            create(ExprValueSchema, {
              kind: {
                case: 'error',
                value: test.resultMatcher.value,
              },
            })
          );
        }
      });
    }
  }
}
