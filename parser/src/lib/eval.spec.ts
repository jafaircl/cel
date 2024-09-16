import {
  ErrorSetSchema,
  ExprValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { StatusSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb.js';
import { create } from '@bufbuild/protobuf';
import { parseAndEval } from './parse';

describe('eval', () => {
  it('all helper', () => {
    expect(parseAndEval('[1, 2, 3].all(e, e > 0)')).toEqual(
      create(ExprValueSchema, {
        kind: {
          case: 'value',
          value: create(ValueSchema, {
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
      create(ExprValueSchema, {
        kind: {
          case: 'error',
          value: create(ErrorSetSchema, {
            errors: [
              create(StatusSchema, {
                message: 'no_such_overload',
              }),
            ],
          }),
        },
      })
    );
  });

  it('lists 1', () => {
    expect(parseAndEval('[7, 8, 9][0]')).toEqual(
      create(ExprValueSchema, {
        kind: {
          case: 'value',
          value: create(ValueSchema, {
            kind: {
              case: 'int64Value',
              value: BigInt(7),
            },
          }),
        },
      })
    );
  });

  it('lists size', () => {
    expect(parseAndEval('[7, 8, 9].size()')).toEqual(
      create(ExprValueSchema, {
        kind: {
          case: 'value',
          value: create(ValueSchema, {
            kind: {
              case: 'int64Value',
              value: BigInt(3),
            },
          }),
        },
      })
    );
  });

  it('has map key', () => {
    expect(parseAndEval('has({"a": 1, "b": 2}.a)')).toEqual(
      create(ExprValueSchema, {
        kind: {
          case: 'value',
          value: create(ValueSchema, {
            kind: {
              case: 'boolValue',
              value: true,
            },
          }),
        },
      })
    );
  });
});
