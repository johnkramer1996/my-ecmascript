export default class ParserException extends Error {
  constructor(message: string, public row: number, public col: number) {
    super(message)
  }
}
