import { parse } from './parse';

describe('parse', () => {
  it('should work', () => {
    expect(parse(`'asdf'`)).toEqual('asdf');
  });
});
