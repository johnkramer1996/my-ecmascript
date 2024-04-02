import Lexer from 'parser/Lexer'
import IValue from '../IValue'
import { FunctionValue } from '../types/FunctionValue'
import NumberValue from '../types/NumberValue'
import { ClassInstance, ObjectValue } from '../types/ObjectValue'
import Parser from 'parser/Parser'
import { Variables } from '../Variables'
import UndefinedValue from '../types/UndefinedValue'
import BooleanValue from '../types/BooleanValue'
import StringValue from '../types/StringValue'
import NullValue from '../types/NullValue'
import { initObject } from './Object'

export const initFundamentalObjects = () => {
  const Object_ = initObject()
  const FunctionValueObject = new ObjectValue(ObjectValue.FunctionPrototype)

  const Function_ = new FunctionValue({
    call(string: IValue) {
      const lexer = new Lexer(string.asString())
      const tokens = lexer.tokenize()
      const parser = new Parser(tokens)
      const ast = parser.parseFunction()

      return new FunctionValue({
        call: () => {
          try {
            Variables.enterScope(undefined, Variables.globalScope)
            ast.execute()
            Variables.exitScope()
          } catch (e) {
            console.error(e)
          }

          return UndefinedValue.UNDEFINED
        },
        getValue() {
          return new ObjectValue()
        },
      })
    },
    getValue() {
      return FunctionValueObject
    },
    toString() {
      return 'Functoin'
    },
  })

  FunctionValueObject.set('prototype', ObjectValue.FunctionPrototype)
  ObjectValue.FunctionPrototype.set('constructor', Function_)

  const NumberValueObject = new ObjectValue()

  const Number_ = new FunctionValue({
    call(value: IValue): IValue {
      const this_ = Variables.getThis()
      if (!(this_ instanceof ClassInstance)) return new NumberValue(value.asNumber())
      this_.set('value', value)
      return this_
    },
    getValue(): ObjectValue {
      return NumberValueObject
    },
    toString() {
      return '[native func]'
    },
    name: 'Number',
  })

  NumberValueObject.set('prototype', ObjectValue.NumberPrototype)
  ObjectValue.NumberPrototype.set('constructor', Number_)

  const StringValueObject = new ObjectValue()

  const String_ = new FunctionValue({
    call(value: IValue): IValue {
      return new NumberValue(value.asNumber())
    },
    getValue(): ObjectValue {
      return StringValueObject
    },
    toString() {
      return '[native func]'
    },
  })

  const BooleanValueObject = new ObjectValue()

  const Boolean_ = new FunctionValue({
    call(value: IValue): IValue {
      if (value instanceof NullValue) return BooleanValue.FALSE
      if (value instanceof UndefinedValue) return BooleanValue.FALSE
      if (value instanceof NumberValue && value.asNumber() === 0) return BooleanValue.FALSE
      if (value instanceof NumberValue && value.asNumber() === -0) return BooleanValue.FALSE
      if (value instanceof StringValue && value.asString() === '') return BooleanValue.FALSE
      if (value instanceof BooleanValue) return value
      return BooleanValue.TRUE
    },
    getValue(): ObjectValue {
      return BooleanValueObject
    },
    toString() {
      return '[native func]'
    },
  })

  return { Object_, Function_, Number_, String_, Boolean_ }
}
