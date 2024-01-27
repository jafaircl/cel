import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { Operator } from './operator';

/**
 * Choose one of two values based on a condition. Only supports boolean conditions.
 *
 * @param x the condition
 * @param y the value to return if the condition is true
 * @param z the value to return if the condition is false
 * @returns the value of y if x is true, otherwise the value of z
 */
export function logicalCondition(x: Value, y: Value, z: Value) {
  if (x.kind.case !== 'boolValue') {
    throw new TypeError(`Expected BoolValue, got ${typeof x}`);
  }
  return x.kind.value ? y : z;
}

/**
 * Native JavaScript has a left to right rule for logical operators, but CEL is
 * commutative. This function implements CEL semantics for the && operator.
 *
 * @param x the first value
 * @param y the second value
 * @returns the result of x && y
 */
export function logicalAnd(x: Value, y: Value) {
  if (x.kind.case !== 'boolValue' && y.kind.case !== 'boolValue') {
    throw new TypeError(`${typeof x} ${x} and ${typeof y} ${y}`);
  } else if (x.kind.case !== 'boolValue' && y.kind.case === 'boolValue') {
    if (y.kind.value) {
      return x; // whatever && true == whatever
    } else {
      return y; // whatever && false == false
    }
  } else if (x.kind.case === 'boolValue' && y.kind.case !== 'boolValue') {
    if (x.kind.value) {
      return y; // true && whatever == whatever
    } else {
      return x; // false && whatever == false
    }
  }
  const result = x.kind.value && y.kind.value;
  if (result === x.kind.value) {
    return x;
  }
  return y;
}

/**
 * CEL not operator. The native JavaScript not operator is not fully compatible with CEL
 * semantics.
 *
 * @param x the value to negate
 * @returns the negated value
 */
export function logicalNot(x: Value) {
  if (x.kind.case !== 'boolValue') {
    throw new TypeError(`Expected BoolValue, got ${typeof x}`);
  }
  // TODO: need a more robust way to do this
  return {
    ...x,
    kind: {
      ...x.kind,
      value: !x.kind.value,
    },
  };
}

/**
 * Native JavaScript has a left to right rule for logical operators, but CEL is
 * commutative. This function implements CEL semantics for the || operator.
 *
 * @param x the first value
 * @param y the second value
 * @returns the result of x || y
 */
export function logicalOr(x: Value, y: Value) {
  if (x.kind.case !== 'boolValue' && y.kind.case !== 'boolValue') {
    throw new TypeError(
      `${x.kind.case} ${x.kind.value} or ${y.kind.case} ${y.kind.value}`
    );
  } else if (x.kind.case !== 'boolValue' && y.kind.case === 'boolValue') {
    if (y.kind.value) {
      return y; // whatever || true == true
    } else {
      return x; // whatever || false == whatever
    }
  } else if (x.kind.case === 'boolValue' && y.kind.case !== 'boolValue') {
    if (x.kind.value) {
      return x; // true || whatever == true
    } else {
      return y; // false || whatever == whatever
    }
  }
  const result = x.kind.value || y.kind.value;
  if (result === x.kind.value) {
    return x;
  }
  return y;
}

export function equals(x: Value, y: Value): Value {
  switch (x.kind.case) {
    case 'listValue':
      if (y.kind.case !== 'listValue') {
        throw new Error('no such overload');
      }
      if (x.kind.value.values.length !== y.kind.value.values.length) {
        return new Value({
          kind: {
            case: 'boolValue',
            value: false,
          },
        });
      }
      for (let i = 0; i < x.kind.value.values.length; i++) {
        if (
          !equals(x.kind.value.values[i], y.kind.value.values[i]).kind.value
        ) {
          return new Value({
            kind: {
              case: 'boolValue',
              value: false,
            },
          });
        }
      }
      return new Value({
        kind: {
          case: 'boolValue',
          value: true,
        },
      });
    case 'mapValue':
      if (y.kind.case !== 'mapValue') {
        throw new Error('no such overload');
      }
      if (x.kind.value.entries.length !== y.kind.value.entries.length) {
        return new Value({
          kind: {
            case: 'boolValue',
            value: false,
          },
        });
      }
      // eslint-disable-next-line no-case-declarations
      const sortedXMapEntries = [...x.kind.value.entries].sort((a, b) => {
        if (
          a.key!.kind.case === 'stringValue' &&
          b.key!.kind.case === 'stringValue'
        ) {
          return a.key!.kind.value.localeCompare(b.key!.kind.value);
        }
        return 0;
      });
      // eslint-disable-next-line no-case-declarations
      const sortedYMapEntries = [...y.kind.value.entries].sort((a, b) => {
        if (
          a.key!.kind.case === 'stringValue' &&
          b.key!.kind.case === 'stringValue'
        ) {
          return a.key!.kind.value.localeCompare(b.key!.kind.value);
        }
        return 0;
      });

      for (let i = 0; i < sortedXMapEntries.length; i++) {
        if (
          !equals(sortedXMapEntries[i].key!, sortedYMapEntries[i].key!).kind
            .value ||
          !equals(sortedXMapEntries[i].value!, sortedYMapEntries[i].value!).kind
            .value
        ) {
          return new Value({
            kind: {
              case: 'boolValue',
              value: false,
            },
          });
        }
      }
      return new Value({
        kind: {
          case: 'boolValue',
          value: true,
        },
      });
    default:
      if (x.kind.case === 'nullValue' || y.kind.case === 'nullValue') {
        return new Value({
          kind: {
            case: 'boolValue',
            value: x.kind.case === y.kind.case && x.kind.value === y.kind.value,
          },
        });
      }
      return new Value({
        kind: {
          case: 'boolValue',
          value: x.equals(y) || x.kind.value == y.kind.value,
        },
      });
  }
}

export function notEquals(x: Value, y: Value): Value {
  return new Value({
    kind: {
      case: 'boolValue',
      value: !equals(x, y).kind.value,
    },
  });
}

function assertComparable(x: Value, y: Value): void {
  // TODO: a better way to do this
  if (
    x.kind.case === 'listValue' ||
    y.kind.case === 'listValue' ||
    x.kind.case === 'mapValue' ||
    y.kind.case === 'mapValue' ||
    x.kind.case === 'nullValue' ||
    y.kind.case === 'nullValue' ||
    (x.kind.case === 'stringValue' && y.kind.case !== 'stringValue') ||
    (x.kind.case !== 'stringValue' && y.kind.case === 'stringValue')
  ) {
    throw new Error('no such overload');
  }
}

function normalizeNumberValue(x: Value) {
  return x.kind.case === 'int64Value' || x.kind.case === 'uint64Value'
    ? Number(x.kind.value)
    : x.kind.value;
}

function normalizeNumberValues(x: Value, y: Value) {
  const xValue = normalizeNumberValue(x);
  const yValue = normalizeNumberValue(y);
  return [xValue, yValue];
}

export function greaterThan(x: Value, y: Value): Value {
  assertComparable(x, y);
  const [xValue, yValue] = normalizeNumberValues(x, y);
  return new Value({
    kind: {
      case: 'boolValue',
      value: xValue! > yValue!,
    },
  });
}

export function greaterThanOrEqual(x: Value, y: Value): Value {
  assertComparable(x, y);
  const [xValue, yValue] = normalizeNumberValues(x, y);
  return new Value({
    kind: {
      case: 'boolValue',
      value: xValue! >= yValue!,
    },
  });
}

export function lessThan(x: Value, y: Value): Value {
  assertComparable(x, y);
  const [xValue, yValue] = normalizeNumberValues(x, y);
  return new Value({
    kind: {
      case: 'boolValue',
      value: xValue! < yValue!,
    },
  });
}

export function lessThanOrEqual(x: Value, y: Value): Value {
  assertComparable(x, y);
  const [xValue, yValue] = normalizeNumberValues(x, y);
  return new Value({
    kind: {
      case: 'boolValue',
      value: xValue! <= yValue!,
    },
  });
}

export function _in(x: Value, y: Value): Value {
  if (y.kind.case !== 'listValue' && y.kind.case !== 'mapValue') {
    throw new Error('no such overload');
  }
  if (y.kind.case === 'mapValue') {
    return new Value({
      kind: {
        case: 'boolValue',
        value: y.kind.value.entries.some(
          (entry) => equals(x, entry.key!).kind.value
        ),
      },
    });
  }
  return new Value({
    kind: {
      case: 'boolValue',
      value: y.kind.value.values.some((value) => equals(x, value).kind.value),
    },
  });
}

export function add(x: Value, y: Value): Value {
  if (x.kind.case === 'listValue') {
    if (y.kind.case !== 'listValue') {
      throw new Error('no such overload');
    }
    return new Value({
      kind: {
        case: 'listValue',
        value: {
          values: [...x.kind.value.values, ...y.kind.value.values],
        },
      },
    });
  }
  return new Value({
    kind: {
      case: x.kind.case,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: ((x.kind.value as any) + y.kind.value) as any,
    },
  });
}

export function subtract(x: Value, y: Value): Value {
  // TODO: better implemenation for this
  if (x.kind.case === 'listValue') {
    if (y.kind.case !== 'listValue') {
      throw new TypeError(`Expected ListValue, got ${y.kind.case}`);
    }
    const ySet = new Set(y.kind.value.values);
    return new Value({
      kind: {
        case: 'listValue',
        value: {
          values: x.kind.value.values.filter((value) => !ySet.has(value)),
        },
      },
    });
  }
  return new Value({
    kind: {
      case: x.kind.case,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: ((x.kind.value as any) - (y.kind.value as any)) as any,
    },
  });
}

export function multiply(x: Value, y: Value): Value {
  return new Value({
    kind: {
      case: x.kind.case,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: ((x.kind.value as any) * (y.kind.value as any)) as any,
    },
  });
}

export function divide(x: Value, y: Value): Value {
  return new Value({
    kind: {
      case: x.kind.case,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: ((x.kind.value as any) / (y.kind.value as any)) as any,
    },
  });
}

export function modulo(x: Value, y: Value): Value {
  return new Value({
    kind: {
      case: x.kind.case,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: ((x.kind.value as any) % (y.kind.value as any)) as any,
    },
  });
}

export const base_functions = {
  [Operator.CONDITIONAL]: logicalCondition,
  [Operator.LOGICAL_AND]: logicalAnd,
  [Operator.LOGICAL_NOT]: logicalNot,
  [Operator.LOGICAL_OR]: logicalOr,
  [Operator.EQUALS]: equals,
  [Operator.NOT_EQUALS]: notEquals,
  [Operator.GREATER]: greaterThan,
  [Operator.GREATER_EQUALS]: greaterThanOrEqual,
  [Operator.LESS]: lessThan,
  [Operator.LESS_EQUALS]: lessThanOrEqual,
  [Operator.IN]: _in,
  [Operator.ADD]: add,
  [Operator.SUBTRACT]: subtract,
  [Operator.MULTIPLY]: multiply,
  [Operator.DIVIDE]: divide,
  [Operator.MODULO]: modulo,
  dyn: (x: Value) => x,
};
