import IValue from './IValue'

export function isFunction(func: any): func is Function {
  return 'execute' in func
}

type Function = { execute: (...args: IValue[]) => IValue }
// (...args: IValue[]): void

export default Function
