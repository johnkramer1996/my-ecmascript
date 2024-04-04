import IECMAScriptLanguageType from 'parser/lib/IValue'
import IExpression from './IExpression'

export interface IAccessible extends IExpression {
  set(value: IECMAScriptLanguageType): IECMAScriptLanguageType
  define(value: IECMAScriptLanguageType): void
  hoisting(kind: string): void
}

export const instanceOfIAccessible = (object: any): object is IAccessible => {
  return 'set' in object
}
