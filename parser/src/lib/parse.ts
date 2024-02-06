import { Decl } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { EnumType, MessageType } from '@bufbuild/protobuf';
import { CELEnvironment } from './environment';
import { Binding } from './types';
import { isNil } from './util';

export interface ParseOptions {
  /**
   * The named value or function declarations to use.
   */
  declarations?: Decl[];
  /**
   * The message types to use for message type declarations.
   */
  messageTypes?: MessageType[];
  /**
   * The enum types to use for enum type declarations.
   */
  enumTypes?: EnumType[];
  /**
   * A map of named values or functions to use for declarations.
   */
  bindings?: Record<string, Binding>;
  /**
   * Whether to check the expression for errors. This can be computationaly
   * expensive, so it is disabled by default.
   */
  check?: boolean;
}

/**
 * Helper function to parse and evaluate an expression.
 *
 * @param expr the expression to parse
 * @param options the options to use for parsing
 * @returns the result of the expression evaluation
 */
export function parse(expr: string, options?: ParseOptions) {
  const environment = new CELEnvironment(
    options?.declarations ?? [],
    options?.messageTypes ?? [],
    options?.enumTypes ?? []
  );
  const ast = environment.compile(
    expr,
    isNil(options?.check) ? false : options?.check
  );
  const program = environment.program(ast);
  return program.eval(options?.bindings ?? {});
}
Decl;
