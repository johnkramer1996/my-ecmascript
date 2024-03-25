export default class ParseException extends Error {
  constructor(message: string, public row: number, public col: number) {
    super(`${message} [${row}, ${col}]`)
  }
}
