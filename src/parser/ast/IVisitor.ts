import IExpression from './IExpression'
import IStatement from './IStatement'

export default interface IVisitor {
  visit(s: IExpression): void
  visit(s: IStatement): void
}
