import { ExprValue } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { parse } from './parse';

describe('parse', () => {
  it('should work', () => {
    expect(parse(`'asdf'`)).toEqual(
      new ExprValue({
        kind: {
          case: 'value',
          value: {
            kind: {
              case: 'stringValue',
              value: 'asdf',
            },
          },
        },
      })
    );
  });

  it('readme example', () => {
    expect(
      parse(`name.startsWith("/groups/" + group)`, {
        bindings: {
          name: new Value({
            kind: {
              case: 'stringValue',
              value: '/groups/acme.co/documents/secret-stuff',
            },
          }),
          group: new Value({
            kind: {
              case: 'stringValue',
              value: 'acme.co',
            },
          }),
        },
      })
    ).toEqual(
      new ExprValue({
        kind: {
          case: 'value',
          value: {
            kind: {
              case: 'boolValue',
              value: true,
            },
          },
        },
      })
    );
  });
});
