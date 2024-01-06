import { CharStream, CommonTokenStream } from 'antlr4';
import CELLexer from './gen/CELLexer';
import CELParser, { StartContext } from './gen/CELParser';
import { CELProgram } from './program';

export class CELEnvironment {
  constructor() {
    // TODO: implement environment
  }

  compile(input: string) {
    const chars = new CharStream(input);
    const lexer = new CELLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new CELParser(tokens);
    const tree = parser.start();
    if (tree.exception) throw tree.exception;
    return tree;
  }

  program(ast: StartContext) {
    return new CELProgram(ast);
  }
}
