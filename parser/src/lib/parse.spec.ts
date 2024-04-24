import {
  Constant,
  Expr,
  Expr_Call,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_CreateStruct_Entry,
  Expr_Ident,
  Expr_Select,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { NullValue } from '@bufbuild/protobuf';
import { parse } from './parse';

describe('parse', () => {
  describe('go tests', () => {
    const tests = [
      {
        I: '"A"',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'stringValue',
                value: 'A',
              },
            }),
          },
        }),
      },
      {
        I: 'true',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'boolValue',
                value: true,
              },
            }),
          },
        }),
      },
      {
        I: 'false',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'boolValue',
                value: false,
              },
            }),
          },
        }),
      },
      {
        I: '0',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'int64Value',
                value: BigInt(0),
              },
            }),
          },
        }),
      },
      {
        I: '42',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'int64Value',
                value: BigInt(42),
              },
            }),
          },
        }),
      },
      {
        I: '0xF',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'int64Value',
                value: BigInt(15),
              },
            }),
          },
        }),
      },
      {
        I: '0u',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'uint64Value',
                value: BigInt(0),
              },
            }),
          },
        }),
      },
      {
        I: '23u',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'uint64Value',
                value: BigInt(23),
              },
            }),
          },
        }),
      },
      {
        I: '24u',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'uint64Value',
                value: BigInt(24),
              },
            }),
          },
        }),
      },
      {
        I: '0xFu',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'uint64Value',
                value: BigInt(15),
              },
            }),
          },
        }),
      },
      {
        I: '-1',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'int64Value',
                value: BigInt(-1),
              },
            }),
          },
        }),
      },
      {
        I: '4--4',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_-_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'constExpr',
                    value: new Constant({
                      constantKind: {
                        case: 'int64Value',
                        value: BigInt(4),
                      },
                    }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'constExpr',
                    value: new Constant({
                      constantKind: {
                        case: 'int64Value',
                        value: BigInt(-4),
                      },
                    }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: '4--4.1',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_-_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'constExpr',
                    value: new Constant({
                      constantKind: {
                        case: 'int64Value',
                        value: BigInt(4),
                      },
                    }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'constExpr',
                    value: new Constant({
                      constantKind: {
                        case: 'doubleValue',
                        value: -4.1,
                      },
                    }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'b"abc"',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'bytesValue',
                value: new TextEncoder().encode('abc'),
              },
            }),
          },
        }),
      },
      {
        I: '23.39',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'doubleValue',
                value: 23.39,
              },
            }),
          },
        }),
      },
      {
        I: '!a',
        P: new Expr({
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '!_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'null',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: new Constant({
              constantKind: {
                case: 'nullValue',
                value: NullValue.NULL_VALUE,
              },
            }),
          },
        }),
      },
      {
        I: 'a',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'identExpr',
            value: new Expr_Ident({ name: 'a' }),
          },
        }),
      },
      {
        I: 'a?b:c',
        P: new Expr({
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_?_:_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(3),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
                new Expr({
                  id: BigInt(4),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'c' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a || b',
        P: new Expr({
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_||_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a || b || c || d || e || f ',
        P: Expr.fromJson({
          id: '4',
          callExpr: {
            function: '_||_',
            args: [
              {
                id: '3',
                callExpr: {
                  function: '_||_',
                  args: [
                    {
                      id: '2',
                      callExpr: {
                        function: '_||_',
                        args: [
                          {
                            id: '1',
                            identExpr: {
                              name: 'a',
                            },
                          },
                          {
                            id: '2',
                            identExpr: {
                              name: 'b',
                            },
                          },
                        ],
                      },
                    },
                    {
                      id: '3',
                      identExpr: {
                        name: 'c',
                      },
                    },
                  ],
                },
              },
              {
                id: '6',
                callExpr: {
                  function: '_||_',
                  args: [
                    {
                      id: '5',
                      callExpr: {
                        function: '_||_',
                        args: [
                          {
                            id: '4',
                            identExpr: {
                              name: 'd',
                            },
                          },
                          {
                            id: '5',
                            identExpr: {
                              name: 'e',
                            },
                          },
                        ],
                      },
                    },
                    {
                      id: '6',
                      identExpr: {
                        name: 'f',
                      },
                    },
                  ],
                },
              },
            ],
          },
        }),
      },
      {
        I: 'a && b',
        P: new Expr({
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_&&_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a && b && c && d && e && f && g',
        P: Expr.fromJson({
          id: '5',
          callExpr: {
            function: '_&&_',
            args: [
              {
                id: '3',
                callExpr: {
                  function: '_&&_',
                  args: [
                    {
                      id: '2',
                      callExpr: {
                        function: '_&&_',
                        args: [
                          {
                            id: '1',
                            identExpr: {
                              name: 'a',
                            },
                          },
                          {
                            id: '2',
                            identExpr: {
                              name: 'b',
                            },
                          },
                        ],
                      },
                    },
                    {
                      id: '4',
                      callExpr: {
                        function: '_&&_',
                        args: [
                          {
                            id: '3',
                            identExpr: {
                              name: 'c',
                            },
                          },
                          {
                            id: '4',
                            identExpr: {
                              name: 'd',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                id: '7',
                callExpr: {
                  function: '_&&_',
                  args: [
                    {
                      id: '6',
                      callExpr: {
                        function: '_&&_',
                        args: [
                          {
                            id: '5',
                            identExpr: {
                              name: 'e',
                            },
                          },
                          {
                            id: '6',
                            identExpr: {
                              name: 'f',
                            },
                          },
                        ],
                      },
                    },
                    {
                      id: '7',
                      identExpr: {
                        name: 'g',
                      },
                    },
                  ],
                },
              },
            ],
          },
        }),
      },
      {
        I: 'a && b && c && d || e && f && g && h',
        P: Expr.fromJson({
          id: '7',
          callExpr: {
            function: '_||_',
            args: [
              {
                id: '3',
                callExpr: {
                  function: '_&&_',
                  args: [
                    {
                      id: '2',
                      callExpr: {
                        function: '_&&_',
                        args: [
                          {
                            id: '1',
                            identExpr: {
                              name: 'a',
                            },
                          },
                          {
                            id: '2',
                            identExpr: {
                              name: 'b',
                            },
                          },
                        ],
                      },
                    },
                    {
                      id: '4',
                      callExpr: {
                        function: '_&&_',
                        args: [
                          {
                            id: '3',
                            identExpr: {
                              name: 'c',
                            },
                          },
                          {
                            id: '4',
                            identExpr: {
                              name: 'd',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                id: '7',
                callExpr: {
                  function: '_&&_',
                  args: [
                    {
                      id: '6',
                      callExpr: {
                        function: '_&&_',
                        args: [
                          {
                            id: '5',
                            identExpr: {
                              name: 'e',
                            },
                          },
                          {
                            id: '6',
                            identExpr: {
                              name: 'f',
                            },
                          },
                        ],
                      },
                    },
                    {
                      id: '8',
                      callExpr: {
                        function: '_&&_',
                        args: [
                          {
                            id: '7',
                            identExpr: {
                              name: 'g',
                            },
                          },
                          {
                            id: '8',
                            identExpr: {
                              name: 'h',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        }),
      },
      {
        I: 'a + b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_+_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a - b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_-_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a * b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_*_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a / b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_/_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a % b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_%_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a in b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '@in',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a == b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_==_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a != b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_!=_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a > b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_>_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a >= b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_>=_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a < b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_<_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a <= b',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_<=_',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a.b',
        P: new Expr({
          id: BigInt(2),
          exprKind: {
            case: 'selectExpr',
            value: new Expr_Select({
              operand: new Expr({
                id: BigInt(1),
                exprKind: {
                  case: 'identExpr',
                  value: new Expr_Ident({ name: 'a' }),
                },
              }),
              field: 'b',
            }),
          },
        }),
      },
      {
        I: 'a.b.c',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'selectExpr',
            value: new Expr_Select({
              operand: new Expr({
                id: BigInt(2),
                exprKind: {
                  case: 'selectExpr',
                  value: new Expr_Select({
                    operand: new Expr({
                      id: BigInt(1),
                      exprKind: {
                        case: 'identExpr',
                        value: new Expr_Ident({ name: 'a' }),
                      },
                    }),
                    field: 'b',
                  }),
                },
              }),
              field: 'c',
            }),
          },
        }),
      },
      {
        I: 'a[b]',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: '_[_]',
              args: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'foo{ }',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'structExpr',
            value: new Expr_CreateStruct({
              messageName: 'foo',
            }),
          },
        }),
      },
      {
        I: 'foo{ a:b }',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'structExpr',
            value: new Expr_CreateStruct({
              messageName: 'foo',
              entries: [
                new Expr_CreateStruct_Entry({
                  id: BigInt(2),
                  keyKind: {
                    case: 'fieldKey',
                    value: 'a',
                  },
                  value: new Expr({
                    id: BigInt(1),
                    exprKind: {
                      case: 'identExpr',
                      value: new Expr_Ident({ name: 'b' }),
                    },
                  }),
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'foo{ a:b, c:d }',
        P: new Expr({
          id: BigInt(5),
          exprKind: {
            case: 'structExpr',
            value: new Expr_CreateStruct({
              messageName: 'foo',
              entries: [
                new Expr_CreateStruct_Entry({
                  id: BigInt(2),
                  keyKind: {
                    case: 'fieldKey',
                    value: 'a',
                  },
                  value: new Expr({
                    id: BigInt(1),
                    exprKind: {
                      case: 'identExpr',
                      value: new Expr_Ident({ name: 'b' }),
                    },
                  }),
                }),
                new Expr_CreateStruct_Entry({
                  id: BigInt(4),
                  keyKind: {
                    case: 'fieldKey',
                    value: 'c',
                  },
                  value: new Expr({
                    id: BigInt(3),
                    exprKind: {
                      case: 'identExpr',
                      value: new Expr_Ident({ name: 'd' }),
                    },
                  }),
                }),
              ],
            }),
          },
        }),
      },
      {
        I: '{}',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'structExpr',
            value: new Expr_CreateStruct({}),
          },
        }),
      },
      {
        I: '{a:b, c:d}',
        P: new Expr({
          id: BigInt(7),
          exprKind: {
            case: 'structExpr',
            value: new Expr_CreateStruct({
              entries: [
                new Expr_CreateStruct_Entry({
                  id: BigInt(3),
                  keyKind: {
                    case: 'mapKey',
                    value: new Expr({
                      id: BigInt(1),
                      exprKind: {
                        case: 'identExpr',
                        value: new Expr_Ident({ name: 'a' }),
                      },
                    }),
                  },
                  value: new Expr({
                    id: BigInt(2),
                    exprKind: {
                      case: 'identExpr',
                      value: new Expr_Ident({ name: 'b' }),
                    },
                  }),
                }),
                new Expr_CreateStruct_Entry({
                  id: BigInt(6),
                  keyKind: {
                    case: 'mapKey',
                    value: new Expr({
                      id: BigInt(4),
                      exprKind: {
                        case: 'identExpr',
                        value: new Expr_Ident({ name: 'c' }),
                      },
                    }),
                  },
                  value: new Expr({
                    id: BigInt(5),
                    exprKind: {
                      case: 'identExpr',
                      value: new Expr_Ident({ name: 'd' }),
                    },
                  }),
                }),
              ],
            }),
          },
        }),
      },
      {
        I: '[]',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'listExpr',
            value: new Expr_CreateList(),
          },
        }),
      },
      {
        I: '[a]',
        P: new Expr({
          id: BigInt(2),
          exprKind: {
            case: 'listExpr',
            value: new Expr_CreateList({
              elements: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: '[a, b, c]',
        P: new Expr({
          id: BigInt(4),
          exprKind: {
            case: 'listExpr',
            value: new Expr_CreateList({
              elements: [
                new Expr({
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'a' }),
                  },
                }),
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
                new Expr({
                  id: BigInt(3),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'c' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: '(a)',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'identExpr',
            value: new Expr_Ident({ name: 'a' }),
          },
        }),
      },
      {
        I: '((a))',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'identExpr',
            value: new Expr_Ident({ name: 'a' }),
          },
        }),
      },
      {
        I: 'a()',
        P: new Expr({
          id: BigInt(1),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: 'a',
            }),
          },
        }),
      },
      {
        I: 'a(b)',
        P: new Expr({
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: 'a',
              args: [
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a(b, c)',
        P: new Expr({
          id: BigInt(4),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: 'a',
              args: [
                new Expr({
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'b' }),
                  },
                }),
                new Expr({
                  id: BigInt(3),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'c' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a.b()',
        P: new Expr({
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: 'b',
              target: new Expr({
                id: BigInt(1),
                exprKind: {
                  case: 'identExpr',
                  value: new Expr_Ident({ name: 'a' }),
                },
              }),
            }),
          },
        }),
      },
      {
        I: 'a.b(c)',
        P: new Expr({
          id: BigInt(4),
          exprKind: {
            case: 'callExpr',
            value: new Expr_Call({
              function: 'b',
              target: new Expr({
                id: BigInt(1),
                exprKind: {
                  case: 'identExpr',
                  value: new Expr_Ident({ name: 'a' }),
                },
              }),
              args: [
                new Expr({
                  id: BigInt(3),
                  exprKind: {
                    case: 'identExpr',
                    value: new Expr_Ident({ name: 'c' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
    ];
    // console.log(
    //   parse('a && b && c && d || e && f && g && h').toJsonString({
    //     prettySpaces: 2,
    //   })
    // );
    for (const test of tests) {
      it(test.I, () => {
        expect(parse(test.I)).toEqual(test.P);
      });
    }
  });
});
