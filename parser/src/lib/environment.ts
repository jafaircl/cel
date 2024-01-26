import { Decl } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { EnumType, MessageType, createRegistry } from '@bufbuild/protobuf';
import { CharStream, CommonTokenStream } from 'antlr4';
import CELLexer from './gen/CELLexer';
import CELParser, { StartContext } from './gen/CELParser';
import { CELProgram } from './program';
import { base_messages } from './types';

export class CELEnvironment {
  #registry: ReturnType<typeof createRegistry>;

  constructor(
    public readonly declarations: Decl[] = [],
    public readonly messageTypes: MessageType[] = [],
    public readonly enumTypes: EnumType[] = []
  ) {
    // TODO: validate declarationss
    this.#registry = createRegistry(
      ...base_messages,
      ...messageTypes,
      ...enumTypes
    );
  }

  compile(input: string, check = false) {
    const chars = new CharStream(input);
    const lexer = new CELLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new CELParser(tokens);
    const tree = parser.start();
    if (tree.exception) throw tree.exception;
    if (check) this.check(tree);
    return tree;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  check(ast: StartContext) {
    // TODO: implement
  }

  program(ast: StartContext) {
    return new CELProgram(ast, this.#registry);
  }
}
