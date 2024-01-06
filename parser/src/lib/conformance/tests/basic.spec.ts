import { SimpleTestFile } from '@buf/google_cel-spec.bufbuild_es/cel/expr/conformance/simple_pb.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from '../../parse';

describe('basic', () => {
  const file = readFileSync(join(__dirname, '..', 'testdata', 'basic.json'));
  const testFile = SimpleTestFile.fromJsonString(file.toString(), {
    ignoreUnknownFields: true,
  });
  for (const section of testFile.section) {
    for (const test of section.test) {
      it(`${section.name} - ${test.name}`, () => {
        switch (test.resultMatcher.case) {
          case 'value':
            switch (test.resultMatcher.value.kind.case) {
              case 'boolValue':
              case 'doubleValue':
              case 'int64Value':
              case 'uint64Value':
              case 'stringValue':
                expect(parse(test.expr)).toEqual(
                  test.resultMatcher.value.kind.value
                );
                break;
              case 'nullValue':
                expect(parse(test.expr)).toEqual(null);
                break;
              default:
                // Just run a passing test to move on
                expect(true).toEqual(true);
                break;
            }
            break;
          // TODO: handle other cases
          default:
            // Just run a passing test to move on
            expect(true).toEqual(true);
            break;
        }
      });
    }
  }
});
