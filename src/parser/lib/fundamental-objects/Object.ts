import { FunctionValue } from '../types/FunctionValue'
import { ObjectValue } from '../types/ObjectValue'
import UndefinedValue from '../types/UndefinedValue'
import IValue from '../IValue'

export const initObject = () => {
  const ObjectValueObject = new ObjectValue(ObjectValue.FunctionPrototype)

  const Object_ = new FunctionValue({
    call(string: IValue) {
      return UndefinedValue.UNDEFINED
    },
    getValue() {
      return ObjectValueObject
    },
    toString() {
      return 'Object'
    },
  })
  return Object_
}
