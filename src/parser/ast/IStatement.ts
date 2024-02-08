import { INode } from 'parser/ast/INode'

export function isIStatement(node: any): node is IStatement {
  return 'execute' in node && 'accept' in node
}

export default interface IStatement extends INode {
  execute(): void
}
