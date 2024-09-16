# Common Expression Language

## NOTE: This is a work in progress and should not be used in production


<p align="center">
  <a href="https://www.npmjs.com/@celjs/parser">
    <img src="https://img.shields.io/npm/v/@celjs/parser.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen" alt="@celjs/parser on npm" />
  </a>
</p>

The Common Expression Language (CEL) is a non-Turing complete language designed
for simplicity, speed, safety, and portability. CEL's C-like [syntax][1] looks
nearly identical to equivalent expressions in C++, Go, Java, and TypeScript.

```java
// Check whether a resource name starts with a group name.
resource.name.startsWith("/groups/" + auth.claims.group)
```

```go
// Determine whether the request is in the permitted time window.
request.time - resource.age < duration("24h")
```

```typescript
// Check whether all resource names in a list match a given filter.
auth.claims.email_verified && resources.all(r, r.startsWith(auth.claims.email))
```

A CEL "program" is a single expression. The examples have been tagged as
`java`, `go`, and `typescript` within the markdown to showcase the commonality
of the syntax.

CEL is ideal for lightweight expression evaluation when a fully sandboxed
scripting language is too resource intensive. To get started, try the
[Codelab](https://codelabs.developers.google.com/codelabs/cel-go/index.html).

<!-- A dashboard that shows results of cel-go conformance tests can be found
[here](https://k8s-testgrid.appspot.com/google-cel#cel-go). -->

---

- [Common Expression Language](#common-expression-language)
  - [NOTE: This is a work in progress and should not be used in production](#note-this-is-a-work-in-progress-and-should-not-be-used-in-production)
  - [Overview](#overview)
    - [Environment Setup](#environment-setup)
    - [Parse and Check](#parse-and-check)
      - [Macros](#macros)
    - [Evaluate](#evaluate)
    - [Helper Functions](#helper-functions)
  - [Install](#install)
  - [Common Questions](#common-questions)
    - [Why not JavaScript, Lua, or WASM?](#why-not-javascript-lua-or-wasm)
    - [Do I need to Parse _and_ Check?](#do-i-need-to-parse-and-check)
    - [Where can I learn more about the language?](#where-can-i-learn-more-about-the-language)
    - [How can I contribute?](#how-can-i-contribute)
  - [License](#license)

---

## Overview

Determine the variables and functions you want to provide to CEL. Parse and
check an expression to make sure it's valid. Then evaluate the output AST
against some input. Checking is optional, but strongly encouraged.

### Environment Setup

Let's expose `name` and  `group` variables to CEL using the `cel.Declarations`
environment option:

```typescript
import { DeclSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { CELEnvironment } from '@celjs/parser';

const declarations = [
  fromJson(DeclSchema, {
    name: 'name',
    ident: {
      type: {
        primitive: Type_PrimitiveType.STRING,
      },
    },
  }),
  fromJson(DeclSchema, {
    name: 'group',
    ident: {
      type: {
        primitive: Type_PrimitiveType.STRING,
      },
    },
  }),
]
const environment = new CELEnvironment({ declarations });
```

That's it. The environment is ready to be used for parsing and type-checking.
CEL supports all the usual primitive types in addition to lists, maps, as well
as first-class support for JSON and Protocol Buffers.

### Parse and Check

The parsing phase indicates whether the expression is syntactically valid and
expands any macros present within the environment. Parsing and checking are
more computationally expensive than evaluation, and it is recommended that
expressions be parsed and checked ahead of time.

The parse and check phases are combined for convenience into the `Compile`
step:

```typescript
const ast = environment.compile(`name.startsWith("/groups/" + group)`);
const program = environment.program(ast);
```

The `cel.Program` generated at the end of parse and check is stateless,
thread-safe, and cachable.

<!-- Type-checking in an optional, but strongly encouraged, step that can reject some
semantically invalid expressions using static analysis. Additionally, the check
produces metadata which can improve function invocation performance and object
field selection at evaluation-time. -->

#### Macros

Macros are optional but enabled by default. Macros were introduced to
support optional CEL features that might not be desired in all use cases
without the syntactic burden and complexity such features might desire if
they were part of the core CEL syntax. Macros are expanded at parse time and
their expansions are type-checked at check time.

For example, when macros are enabled it is possible to support bounded
iteration / fold operators. The macros `all`, `exists`, `exists_one`, `filter`,
and `map` are particularly useful for evaluating a single predicate against
list and map values.

```javascript
// Ensure all tweets are less than 140 chars
tweets.all(t, t.size() <= 140)
```

The `has` macro is useful for unifying field presence testing logic across
protobuf types and dynamic (JSON-like) types.

```javascript
// Test whether the field is a non-default value if proto-based, or defined
// in the JSON case.
has(message.field)
```

Both cases traditionally require special syntax at the language level, but
these features are exposed via macros in CEL.

### Evaluate

Now, evaluate for fun and profit. The evaluation is thread-safe and side-effect
free. Many different inputs can be sent to the same `cel.Program` and if fields
are present in the input, but not referenced in the expression, they are
ignored. Note that the output of `eval` will be an `ExprValue` object. A helper
function, `exprValueToNative`, is provided which will convert the expression
value to a native TypeScript value.

```typescript
// The `out` var contains the output of a successful evaluation.
const out = program.eval({
    name: fromJson(ValueSchema, { stringValue: '/groups/acme.co/documents/secret-stuff' }),
    group: fromJson(ValueSchema, { stringValue: 'acme.co' }),
})
console.log(out) // new ExprValue({ kind: { case: 'value', value: { kind: { case: 'boolValue', value: true, }, }, }, })
console.log(exprValueToNative(out)) // true
```

### Helper Functions

If your use case involves evaluating the same expression against different variables,
it is highly suggested to compile and evaluate in separate steps. This will make sure
that your evaluations are not slowed down by repeatedly compiling the same program. If,
however, your use case is to use an expression once and discard it, we provide some
helper functions to deal with those use cases.

`parse` will parse your expression to a CEL `Expr` object.

```typescript
import { ExprSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { parse } from '@celjs/parser'; 

const parsed = parse('2 + 2');
parsed === fromJson(ExprSchema, {
  "id": "3",
  "callExpr": {
    "function": "_+_",
    "args": [
      {
        "id": "1",
        "constExpr": {
          "int64Value": "2"
        }
      },
      {
        "id": "2",
        "constExpr": {
          "int64Value": "2"
        }
      }
    ]
  }
})
```

`parseAndEval` will parse and evaluate your expression and return the result
as an `ExprValue` object.

```typescript
import { ExprValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import { parseAndEval } from '@celjs/parser'; 

const evaluated = parseAndEval(`2 + 2`);
evaluated === fromJson(ExprValueSchema, {
  "value": {
    "int64Value": "4"
  }
})
```

`parseAndEvalToNative` will parse and evaluate your expression and return the
result as a native TypeScript value.

```typescript
import { parseAndEvalToNative } from '@celjs/parser'; 

const native = parseAndEvalToNative(`2 + 2`);
native === 4
```

<!-- #### Partial State

What if `name` hadn't been supplied? CEL is designed for this case. In
distributed apps it is not uncommon to have edge caches and central services.
If possible, evaluation should happen at the edge, but it isn't always possible
to know the full state required for all values and functions present in the
CEL expression.

To improve the odds of successful evaluation with partial state, CEL uses
commutative logical operators `&&`, `||`. If an error or unknown value (not the
same thing) is encountered on the left-hand side, the right hand side is
evaluated also to determine the outcome. While it is possible to implement
evaluation with partial state without this feature, this method was chosen
because it aligns with the semantics of SQL evaluation and because it's more
robust to evaluation against dynamic data types such as JSON inputs.

In the following truth-table, the symbols `<x>` and `<y>` represent error or
unknown values, with the `?` indicating that the branch is not taken due to
short-circuiting. When the result is `<x, y>` this means that the both args
are possibly relevant to the result.

| Expression          | Result   |
|---------------------|----------|
| `false && ?`        | `false`  |
| `true && false`     | `false`  |
| `<x> && false`      | `false`  |
| `true && true`      | `true`   |
| `true && <x>`       | `<x>`    |
| `<x> && true`       | `<x>`    |
| `<x> && <y>`        | `<x, y>` |
| `true \|\| ?`       | `true`   |
| `false \|\| true`   | `true`   |
| `<x> \|\| true`     | `true`   |
| `false \|\| false`  | `false`  |
| `false \|\| <x>`    | `<x>`    |
| `<x> \|\| false`    | `<x>`    |
| `<x> \|\| <y>`      | `<x, y>` |

In the cases where unknowns are expected, `cel.EvalOptions(cel.OptTrackState)`
should be enabled. The `details` value returned by `Eval()` will contain the
intermediate evaluation values and can be provided to the `interpreter.Prune`
function to generate a residual expression. e.g.:

```cpp
// Residual when `name` omitted:
name.startsWith("/groups/acme.co")
```

This technique can be useful when there are variables that are expensive to
compute unless they are absolutely needed. This functionality will be the
focus of many future improvements, so keep an eye out for more goodness here!

### Errors

Parse and check errors have friendly error messages with pointers to where the
issues occur in source:

```sh
ERROR: <input>:1:40: undefined field 'undefined'
    | TestAllTypes{single_int32: 1, undefined: 2}
    | .......................................^`,
```

Both the parsed and checked expressions contain source position information
about each node that appears in the output AST. This information can be used
to determine error locations at evaluation time as well. -->

## Install

Run `npm install @celjs/parser` to install the package from npm.

## Common Questions

### Why not JavaScript, Lua, or WASM?

JavaScript and Lua are rich languages that require sandboxing to execute
safely. Sandboxing is costly and factors into the "what will I let users
evaluate?" question heavily when the answer is anything more than O(n)
complexity.

CEL evaluates linearly with respect to the size of the expression and the input
being evaluated when macros are disabled. The only functions beyond the
built-ins that may be invoked are provided by the host environment. While
extension functions may be more complex, this is a choice by the application
embedding CEL.

But, why not WASM? WASM is an excellent choice for certain applications and
is far superior to embedded JavaScript and Lua, but it does not have support
for garbage collection and non-primitive object types require semi-expensive
calls across modules. In most cases CEL will be faster and just as portable
for its intended use case, though for node.js and web-based execution CEL
too may offer a WASM evaluator with direct to WASM compilation.

### Do I need to Parse _and_ Check?

Checking is an optional, but strongly suggested, step in CEL expression
validation. It is sufficient in some cases to simply Parse and rely on the
runtime bindings and error handling to do the right thing.

### Where can I learn more about the language?

* See the [CEL Spec][1] for the specification and conformance test suite.
* Ask for support on the [CEL Go Discuss][2] Google group.

<!-- ### Where can I learn more about the internals?

* See [GoDoc][6] to learn how to integrate CEL into services written in Go.
* See the [CEL C++][3] toolchain (under development) for information about how
  to integrate CEL evaluation into other environments. -->

### How can I contribute?

<!-- * See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started. -->
* Pull requests are welcome. A code of conduct and more formal contributing guidelines are coming soon.
* Use [GitHub Issues][4] to request features or report bugs.

<!-- ### Some tests don't work with `go test`?

A handful of tests rely on [Bazel][5]. In particular dynamic proto support
at check time and the conformance test driver require Bazel to coordinate
the test inputs:

```sh
bazel test ...
``` -->

## License

Released under the [Apache License](LICENSE).

Disclaimer: This is not an official Google product.

[1]:  https://github.com/google/cel-spec
[2]:  https://groups.google.com/forum/#!forum/cel-go-discuss
[3]:  https://github.com/google/cel-cpp
[4]:  https://github.com/jafaircl/cel/issues
[5]:  https://bazel.build
[6]:  https://godoc.org/github.com/google/cel-go 
