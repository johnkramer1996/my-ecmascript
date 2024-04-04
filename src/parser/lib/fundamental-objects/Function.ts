import Lexer from 'parser/Lexer'
import IECMAScriptLanguageType from '../IValue'
import { FunctionObjectType } from '../types/FunctionValue'
import NumberType from '../types/NumberValue'
import { ClassInstance, ObjectType } from '../types/ObjectValue'
import Parser from 'parser/Parser'
import { Variables } from '../Variables'
import UndefinedType from '../types/UndefinedValue'
import { initObject } from './Object'
import { initBoolean } from './Boolean'

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
  //         Variables.enterScope(undefined, Variables.globalScope)
  //         ast.execute()
  //         Variables.exitScope()
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
