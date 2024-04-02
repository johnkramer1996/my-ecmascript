import IValue from './IValue'
import { Scope } from './Variables'
import { ObjectValue } from './types/ObjectValue'

export const isFunction = (func: any): func is Function => 'execute' in func

type Function = {
  call: (...args: IValue[]) => IValue
  getValue: () => ObjectValue
  scope?: Scope
  name?: string
  toString: () => string
}

export default Function
