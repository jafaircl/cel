import {
  ConstantSchema,
  ExprSchema,
  Expr_CallSchema,
  Expr_CreateListSchema,
  Expr_CreateStructSchema,
  Expr_CreateStruct_EntrySchema,
  Expr_IdentSchema,
  Expr_SelectSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create, fromJson } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import { parse } from './parse';

describe('parse', () => {
  describe('go tests', () => {
    const tests = [
      {
        I: '"A"',
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_-_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'constExpr',
                    value: create(ConstantSchema, {
                      constantKind: {
                        case: 'int64Value',
                        value: BigInt(4),
                      },
                    }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'constExpr',
                    value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_-_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'constExpr',
                    value: create(ConstantSchema, {
                      constantKind: {
                        case: 'int64Value',
                        value: BigInt(4),
                      },
                    }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'constExpr',
                    value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '!_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'null',
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'identExpr',
            value: create(Expr_IdentSchema, { name: 'a' }),
          },
        }),
      },
      {
        I: 'a?b:c',
        P: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_?_:_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(3),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(4),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'c' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a || b',
        P: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_||_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a || b || c || d || e || f ',
        P: fromJson(ExprSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_&&_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a && b && c && d && e && f && g',
        P: fromJson(ExprSchema, {
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
        P: fromJson(ExprSchema, {
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
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_+_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a - b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_-_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a * b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_*_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a / b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_/_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a % b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_%_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a in b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '@in',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a == b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_==_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a != b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_!=_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a > b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_>_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a >= b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_>=_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a < b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_<_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a <= b',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_<=_',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a.b',
        P: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'selectExpr',
            value: create(Expr_SelectSchema, {
              operand: create(ExprSchema, {
                id: BigInt(1),
                exprKind: {
                  case: 'identExpr',
                  value: create(Expr_IdentSchema, { name: 'a' }),
                },
              }),
              field: 'b',
            }),
          },
        }),
      },
      {
        I: 'a.b.c',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'selectExpr',
            value: create(Expr_SelectSchema, {
              operand: create(ExprSchema, {
                id: BigInt(2),
                exprKind: {
                  case: 'selectExpr',
                  value: create(Expr_SelectSchema, {
                    operand: create(ExprSchema, {
                      id: BigInt(1),
                      exprKind: {
                        case: 'identExpr',
                        value: create(Expr_IdentSchema, { name: 'a' }),
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
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: '_[_]',
              args: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'foo{ }',
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'structExpr',
            value: create(Expr_CreateStructSchema, {
              messageName: 'foo',
            }),
          },
        }),
      },
      {
        I: 'foo{ a:b }',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'structExpr',
            value: create(Expr_CreateStructSchema, {
              messageName: 'foo',
              entries: [
                create(Expr_CreateStruct_EntrySchema, {
                  id: BigInt(2),
                  keyKind: {
                    case: 'fieldKey',
                    value: 'a',
                  },
                  value: create(ExprSchema, {
                    id: BigInt(1),
                    exprKind: {
                      case: 'identExpr',
                      value: create(Expr_IdentSchema, { name: 'b' }),
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
        P: create(ExprSchema, {
          id: BigInt(5),
          exprKind: {
            case: 'structExpr',
            value: create(Expr_CreateStructSchema, {
              messageName: 'foo',
              entries: [
                create(Expr_CreateStruct_EntrySchema, {
                  id: BigInt(2),
                  keyKind: {
                    case: 'fieldKey',
                    value: 'a',
                  },
                  value: create(ExprSchema, {
                    id: BigInt(1),
                    exprKind: {
                      case: 'identExpr',
                      value: create(Expr_IdentSchema, { name: 'b' }),
                    },
                  }),
                }),
                create(Expr_CreateStruct_EntrySchema, {
                  id: BigInt(4),
                  keyKind: {
                    case: 'fieldKey',
                    value: 'c',
                  },
                  value: create(ExprSchema, {
                    id: BigInt(3),
                    exprKind: {
                      case: 'identExpr',
                      value: create(Expr_IdentSchema, { name: 'd' }),
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'structExpr',
            value: create(Expr_CreateStructSchema, {}),
          },
        }),
      },
      {
        I: '{a:b, c:d}',
        P: create(ExprSchema, {
          id: BigInt(7),
          exprKind: {
            case: 'structExpr',
            value: create(Expr_CreateStructSchema, {
              entries: [
                create(Expr_CreateStruct_EntrySchema, {
                  id: BigInt(3),
                  keyKind: {
                    case: 'mapKey',
                    value: create(ExprSchema, {
                      id: BigInt(1),
                      exprKind: {
                        case: 'identExpr',
                        value: create(Expr_IdentSchema, { name: 'a' }),
                      },
                    }),
                  },
                  value: create(ExprSchema, {
                    id: BigInt(2),
                    exprKind: {
                      case: 'identExpr',
                      value: create(Expr_IdentSchema, { name: 'b' }),
                    },
                  }),
                }),
                create(Expr_CreateStruct_EntrySchema, {
                  id: BigInt(6),
                  keyKind: {
                    case: 'mapKey',
                    value: create(ExprSchema, {
                      id: BigInt(4),
                      exprKind: {
                        case: 'identExpr',
                        value: create(Expr_IdentSchema, { name: 'c' }),
                      },
                    }),
                  },
                  value: create(ExprSchema, {
                    id: BigInt(5),
                    exprKind: {
                      case: 'identExpr',
                      value: create(Expr_IdentSchema, { name: 'd' }),
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
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'listExpr',
            value: create(Expr_CreateListSchema),
          },
        }),
      },
      {
        I: '[a]',
        P: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'listExpr',
            value: create(Expr_CreateListSchema, {
              elements: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: '[a, b, c]',
        P: create(ExprSchema, {
          id: BigInt(4),
          exprKind: {
            case: 'listExpr',
            value: create(Expr_CreateListSchema, {
              elements: [
                create(ExprSchema, {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'a' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(3),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'c' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: '(a)',
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'identExpr',
            value: create(Expr_IdentSchema, { name: 'a' }),
          },
        }),
      },
      {
        I: '((a))',
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'identExpr',
            value: create(Expr_IdentSchema, { name: 'a' }),
          },
        }),
      },
      {
        I: 'a()',
        P: create(ExprSchema, {
          id: BigInt(1),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: 'a',
            }),
          },
        }),
      },
      {
        I: 'a(b)',
        P: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: 'a',
              args: [
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a(b, c)',
        P: create(ExprSchema, {
          id: BigInt(4),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: 'a',
              args: [
                create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'b' }),
                  },
                }),
                create(ExprSchema, {
                  id: BigInt(3),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'c' }),
                  },
                }),
              ],
            }),
          },
        }),
      },
      {
        I: 'a.b()',
        P: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: 'b',
              target: create(ExprSchema, {
                id: BigInt(1),
                exprKind: {
                  case: 'identExpr',
                  value: create(Expr_IdentSchema, { name: 'a' }),
                },
              }),
            }),
          },
        }),
      },
      {
        I: 'a.b(c)',
        P: create(ExprSchema, {
          id: BigInt(4),
          exprKind: {
            case: 'callExpr',
            value: create(Expr_CallSchema, {
              function: 'b',
              target: create(ExprSchema, {
                id: BigInt(1),
                exprKind: {
                  case: 'identExpr',
                  value: create(Expr_IdentSchema, { name: 'a' }),
                },
              }),
              args: [
                create(ExprSchema, {
                  id: BigInt(3),
                  exprKind: {
                    case: 'identExpr',
                    value: create(Expr_IdentSchema, { name: 'c' }),
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
