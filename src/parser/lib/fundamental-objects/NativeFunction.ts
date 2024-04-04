import Lexer from 'parser/Lexer'
import IECMAScriptLanguageType from '../IValue'
import { FunctionObjectType } from '../types/FunctionValue'
import NumberType from '../types/NumberValue'
import { ClassInstance, ObjectType } from '../types/ObjectValue'
import { Variables } from '../Variables'
import UndefinedType from '../types/UndefinedValue'
import { initObject } from './Object'
import { initBoolean } from './Boolean'
import { initFunction } from './Function'

export const initFundamentalObjects = () => {
  const Object_ = initObject()
  const Function_ = initFunction()
  const Boolean_ = initBoolean()

  const Number_ = new FunctionObjectType(
    {
      execute(): IECMAScriptLanguageType {
        const value = UndefinedType.UNDEFINED
        const this_ = Variables.getThis()
        if (!(this_ instanceof ClassInstance)) return new NumberType(value.asNumber())
        this_['[[Set]]']('value', value)
        return this_
      },
      accept(visitor) {},
      toString() {
        return '[native func]'
      },
    },
    ObjectType.NumberPrototype,
  )

  const String_ = new FunctionObjectType(
    {
      execute(): IECMAScriptLanguageType {
        const value = UndefinedType.UNDEFINED
        return new NumberType(value.asNumber())
      },
      accept(visitor) {},
      toString() {
        return '[native func]'
      },
    },
    ObjectType.StringPrototype,
  )

  return { Object_, Function_, Number_, String_, Boolean_ }
}
