/**
 * Package-private enumeration of Common Expression Language operators.
 */
export enum Operator {
  CONDITIONAL = '_?_:_',
  LOGICAL_AND = '_&&_',
  LOGICAL_OR = '_||_',
  LOGICAL_NOT = '!_',
  EQUALS = '_==_',
  NOT_EQUALS = '_!=_',
  LESS = '_<_',
  LESS_EQUALS = '_<=_',
  GREATER = '_>_',
  GREATER_EQUALS = '_>=_',
  ADD = '_+_',
  SUBTRACT = '_-_',
  MULTIPLY = '_*_',
  DIVIDE = '_/_',
  MODULO = '_%_',
  NEGATE = '-_',
  INDEX = '_[_]',
  HAS = 'has',
  ALL = 'all',
  EXISTS = 'exists',
  EXISTS_ONE = 'exists_one',
  MAP = 'map',
  FILTER = 'filter',
  NOT_STRICTLY_FALSE = '@not_strictly_false',
  IN = '@in',
  OPTIONAL_INDEX = '_[?_]',
  OPTIONAL_SELECT = '_?._',
}

export function getOperatorFromText(text: string): Operator | undefined {
  switch (text) {
    case '?':
      return Operator.CONDITIONAL;
    case '&&':
      return Operator.LOGICAL_AND;
    case '||':
      return Operator.LOGICAL_OR;
    case '!':
      return Operator.LOGICAL_NOT;
    case '==':
      return Operator.EQUALS;
    case '!=':
      return Operator.NOT_EQUALS;
    case '<':
      return Operator.LESS;
    case '<=':
      return Operator.LESS_EQUALS;
    case '>':
      return Operator.GREATER;
    case '>=':
      return Operator.GREATER_EQUALS;
    case '+':
      return Operator.ADD;
    case '-':
      return Operator.SUBTRACT;
    case '*':
      return Operator.MULTIPLY;
    case '/':
      return Operator.DIVIDE;
    case '%':
      return Operator.MODULO;
    case '[':
      return Operator.INDEX;
    case 'has':
      return Operator.HAS;
    case 'all':
      return Operator.ALL;
    case 'exists':
      return Operator.EXISTS;
    case 'exists_one':
      return Operator.EXISTS_ONE;
    case 'map':
      return Operator.MAP;
    case 'filter':
      return Operator.FILTER;
    case '@not_strictly_false':
      return Operator.NOT_STRICTLY_FALSE;
    case 'in':
      return Operator.IN;
    case '[?':
      return Operator.OPTIONAL_INDEX;
    case '?.':
      return Operator.OPTIONAL_SELECT;
    default:
      return undefined;
  }
}
