import IECMAScriptLanguageType from 'parser/lib/IValue'
import { INode } from './INode'

export function isIExpression(node: any): node is IExpression {
  return 'eval' in node
}

export default interface IExpression extends INode {
  eval(): IECMAScriptLanguageType
}
