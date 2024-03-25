import IValue from './IValue'
import ObjectValue from './types/ObjectValue'

export const isFunction = (func: any): func is Function => 'execute' in func

type Function = {
  call: (...args: IValue[]) => IValue
  getValue: () => ObjectValue
}

export default Function
