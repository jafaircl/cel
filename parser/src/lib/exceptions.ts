/**
 * Signals that an error has been reached unexpectedly while parsing.
 */
export class ParseException extends Error {
  constructor(public message: string, public offset: number) {
    super(message);
  }
}

/**
 * Signals that a null value was encountered unexpectedly while parsing.
 */
export class NullException extends Error {
  constructor(public message: string) {
    super(message);
  }
}
