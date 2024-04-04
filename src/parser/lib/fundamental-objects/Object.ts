import { FunctionObjectType } from '../types/FunctionValue'
import { ObjectType } from '../types/ObjectValue'
import UndefinedType from '../types/UndefinedValue'
import IECMAScriptLanguageType from '../IValue'

export const initObject = () => {
  return new ObjectType()
}
