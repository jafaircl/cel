import { SimpleTestFile } from '@buf/google_cel-spec.bufbuild_es/cel/expr/conformance/simple_pb.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runTest } from './runner';

describe('macros', () => {
  const file = readFileSync(join(__dirname, '..', 'testdata', 'macros.json'));
  const testFile = SimpleTestFile.fromJsonString(file.toString(), {
    ignoreUnknownFields: true,
  });
  runTest(testFile);
});
