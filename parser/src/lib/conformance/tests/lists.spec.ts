import { SimpleTestFileSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/conformance/simple_pb.js';
import { fromJsonString } from '@bufbuild/protobuf';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runTest } from './runner';

describe('lists', () => {
  const file = readFileSync(join(__dirname, '..', 'testdata', 'lists.json'));
  const testFile = fromJsonString(SimpleTestFileSchema, file.toString(), {
    ignoreUnknownFields: true,
  });
  runTest(testFile);
});
