import { Decl } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { Registry } from '@bufbuild/protobuf';
import { CELEnvironment } from './environment';
import { exprValueToNative } from './to-native';
import { Binding } from './types';
import { isNil } from './util';

export interface ParseOptions {
  /**
   * The named value or function declarations to use.
   */
  declarations?: Decl[];
  /**
   * The type registry to use.
   */
  registry?: Registry;
  /**
   * A map of named values or functions to use for declarations.
   */
  bindings?: Record<string, Binding>;
  /**
   * Whether to check the expression for errors. This can be computationaly
   * expensive, so it is disabled by default.
   */
  check?: boolean;
  /**
   * The container namespace
   */
  container?: string;
}

/**
 * Helper function to parse  an expression.
 *
 * @param expr the expression to parse
 * @param options the options to use for parsing
 * @returns the result of the expression evaluation
 */
export function parse(expr: string, options?: ParseOptions) {
  const environment = new CELEnvironment({
    declarations: options?.declarations ?? [],
    registry: options?.registry,
    container: options?.container ?? '',
  });
  const ast = environment.compile(
    expr,
    isNil(options?.check) ? false : options?.check
  );
  const program = environment.program(ast);
  return program.parse();
}

/**
 * Helper function to parse and evaluate an expression.
 *
 * @param expr the expression to parse
 * @param options the options to use for parsing
 * @returns the result of the expression evaluation as an ExprValue object
 */
export function parseAndEval(expr: string, options?: ParseOptions) {
  const environment = new CELEnvironment({
    declarations: options?.declarations ?? [],
    registry: options?.registry,
    container: options?.container ?? '',
  });
  const ast = environment.compile(
    expr,
    isNil(options?.check) ? false : options?.check
  );
  const program = environment.program(ast);
  return program.eval(options?.bindings ?? {});
}

/**
 * Helper function to parse and evaluate an expression.
 *
 * @param expr the expression to parse
 * @param options the options to use for parsing
 * @returns the result of the expression evaluation as a native TypeScript value
 */
export function parseAndEvalToNative(expr: string, options?: ParseOptions) {
  const evaluated = parseAndEval(expr, options);
  return exprValueToNative(evaluated);
}
