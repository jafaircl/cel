import { Decl } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { EnumType, MessageType } from '@bufbuild/protobuf';
import { CELEnvironment } from './environment';
import { Binding } from './types';

/**
 * Helper function to parse and evaluate an expression.
 *
 * @param expr the expression to parse
 * @param declarations the named value or function declarations to use
 * @param messageTypes the message types to use for message type declarations
 * @param enumTypes the enum types to use for enum type declarations
 * @param bindings a map of named values or functions to use for declarations
 * @param check whether to check the expression for errors. This can be
 * computationaly expensive, so it is disabled by default.
 * @returns the result of the expression evaluation
 */
export function parse(
  expr: string,
  declarations: Decl[] = [],
  messageTypes: MessageType[] = [],
  enumTypes: EnumType[] = [],
  bindings: Record<string, Binding> = {},
  check = false
) {
  const environment = new CELEnvironment(declarations, messageTypes, enumTypes);
  const ast = environment.compile(expr, check);
  const program = environment.program(ast);
  return program.eval(bindings);
}
Decl;
