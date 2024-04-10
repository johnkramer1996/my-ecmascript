import Lexer from 'parser/Lexer'
import Parser from 'parser/Parser'

const program = `
const obj = {func: function() {
  log '123'
  log this
}}
obj.func()
`

export const EMPTY = 'EMPTY '

const lexer = new Lexer(program)
const tokens = lexer.tokenize()
const parser = new Parser(tokens)
const ast = parser.parse()
try {
  ast.execute()
} catch (e) {
  console.error('[main.ts]', e)
}
