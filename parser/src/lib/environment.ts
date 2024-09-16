import { Decl } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  MutableRegistry,
  Registry,
  createMutableRegistry,
} from '@bufbuild/protobuf';
import { CharStream, CommonTokenStream } from 'antlr4';
import CELLexer from './gen/CELLexer';
import CELParser, { StartContext } from './gen/CELParser';
import { CELProgram } from './program';
import { base_messages } from './types';

export interface CELEnvironmentOptions {
  declarations?: Decl[];
  registry?: Registry;
  container?: string;
}

export class CELEnvironment {
  #registry: MutableRegistry;

  constructor(public readonly options?: CELEnvironmentOptions) {
    // TODO: validate declarations
    this.#registry = createMutableRegistry(...base_messages);
    if (options?.registry) {
      for (const desc of options.registry) {
        this.#registry.add(desc);
      }
    }
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
    return new CELProgram(ast, this.#registry, this.options?.container);
  }
}
