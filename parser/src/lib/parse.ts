import { CELEnvironment } from './environment';

/**
 * Helper function to parse and evaluate an expression.
 *
 * @param expr the expression to parse
 * @param environment the environment to use
 * @param input the input to use
 * @returns the result of the expression evaluation
 */
export function parse(
  expr: string,
  environment = new CELEnvironment(),
  input: Record<string, unknown> = {}
) {
  const ast = environment.compile(expr);
  const program = environment.program(ast);
  return program.eval(input);
}
