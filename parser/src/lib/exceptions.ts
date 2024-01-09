/**
 * Signals that an error has been reached unexpectedly while parsing.
 */
export class ParseException extends Error {
  constructor(public message: string, public offset: number) {
    super(message);
  }
}
