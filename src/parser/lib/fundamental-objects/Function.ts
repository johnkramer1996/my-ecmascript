import { FunctionObjectType } from '../types/FunctionValue'

export const initFunction = () => {
  new FunctionObjectType()
}

{
  // call(string: IECMAScriptLanguageType) {
  //   const lexer = new Lexer(string.asString())
  //   const tokens = lexer.tokenize()
  //   const parser = new Parser(tokens)
  //   const ast = parser.parseFunction()
  //   return new FunctionObjectType({
  //     call: () => {
  //       try {
  //         1.enterScope(undefined, 1.globalScope)
  //         ast.execute()
  //         1.exitScope()
  //       } catch (e) {
  //         console.error(e)
  //       }
  //       return UndefinedType.UNDEFINED
  //     },
  //   })
  // },
  // toString() {
  //   return 'Functoin'
  // },
}
