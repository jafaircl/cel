/* eslint-disable @typescript-eslint/no-explicit-any */
import { Decl } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { TestAllTypes } from '@buf/google_cel-spec.bufbuild_es/cel/expr/conformance/proto3/test_all_types_pb';
import { SimpleTestFile } from '@buf/google_cel-spec.bufbuild_es/cel/expr/conformance/simple_pb.js';
import { ExprValue } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { parse } from '../../parse';
import { Binding } from '../../types';

declare const it: any;
declare const expect: any;

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
        if (
          test.resultMatcher.case === 'value' &&
          test.resultMatcher.value.kind.value
        ) {
          class TestAllTypesForTest extends TestAllTypes {
            static readonly typeName = 'TestAllTypes' as any;
          }
          //   if (test.name === 'eq_bool_not_null') {
          //     console.log(
          //       parse(
          //         test.expr,
          //         declarations,
          //         [TestAllTypesForTest],
          //         [],
          //         bindings,
          //         test.disableCheck === false
          //       ).toJsonString({ prettySpaces: 2 })
          //     );
          //   }
          expect(
            parse(
              test.expr,
              declarations,
              [TestAllTypesForTest],
              [],
              bindings,
              test.disableCheck === false
            )
          ).toEqual(
            new ExprValue({
              kind: {
                case: 'value',
                value: new Value({
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
            parse(
              test.expr,
              declarations,
              [TestAllTypes],
              [],
              bindings,
              test.disableCheck === false
            )
          ).toEqual(
            new ExprValue({
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
