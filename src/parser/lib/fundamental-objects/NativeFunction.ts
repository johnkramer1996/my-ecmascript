import IECMAScriptLanguageType from '../IValue'
import { FunctionObjectType } from '../types/FunctionValue'
import NumberType from '../types/NumberValue'
import { ClassInstance, ObjectType } from '../types/ObjectValue'
import UndefinedType from '../types/UndefinedValue'
import { initObject } from './Object'
import { initBoolean } from './Boolean'
import { initFunction } from './Function'

export const initFundamentalObjects = () => {
  const Object_ = initObject()
  const Function_ = initFunction()
  const Boolean_ = initBoolean()

  const Number_ = new FunctionObjectType()

  const String_ = new FunctionObjectType()

  return { Object_, Function_, Number_, String_, Boolean_ }
}
