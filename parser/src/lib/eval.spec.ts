import {
  ErrorSet,
  ExprValue,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { Status } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb';
import { parseAndEval } from './parse';

describe('eval', () => {
  it('all helper', () => {
    expect(parseAndEval('[1, 2, 3].all(e, e > 0)')).toEqual(
      new ExprValue({
        kind: {
          case: 'value',
          value: new Value({
            kind: {
              case: 'boolValue',
              value: true,
            },
          }),
        },
      })
    );
  });

  it('all helper 2', () => {
    expect(parseAndEval(`[1, 'foo', 3].all(e, e % 2 == 1)`)).toEqual(
      new ExprValue({
        kind: {
          case: 'error',
          value: new ErrorSet({
            errors: [
              new Status({
                message: 'no_such_overload',
              }),
            ],
          }),
        },
      })
    );
  });
});
