import IECMAScriptLanguageType from './IValue'

export const isFunction = (func: any): func is Function => 'execute' in func

type Function = {
  call: (...args: IECMAScriptLanguageType[]) => IECMAScriptLanguageType
  name?: string
  toString: () => string
}

export default Function
