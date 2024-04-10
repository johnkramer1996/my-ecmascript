// 11.2 Types of Source Code

import IExpression from 'parser/ast/IExpression'
import IStatement from 'parser/ast/IStatement'

// 11.2.2.1 Static Semantics: IsStrict ( node )
export function IsStrict(node?: IStatement | IExpression): boolean {
  return true
}
