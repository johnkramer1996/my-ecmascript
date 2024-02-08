import Lexer from 'parser/Lexer'
import Parser from 'parser/Parser'
import TokenType from 'parser/TokenType'

const program = `
log 1 + 2 + 3 + 4 + 5 * 1
`
// log 30 + 30 + 20 * 2 + ++a * 20

const lexer = new Lexer(program)
const tokens = lexer.tokenize()
console.log(tokens.toString())
const parser = new Parser(tokens)
const ast = parser.parse()

try {
  ast.execute()
} catch (e) {
  console.log(e)
}
