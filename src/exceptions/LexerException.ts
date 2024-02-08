export default class LexerException extends Error {
  constructor(public message: string, public row: number, public col: number) {
    super(message + (row && col ? '[' + row + ':' + col + '] ' : ''))
  }
}
