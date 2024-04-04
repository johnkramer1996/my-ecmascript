import IECMAScriptLanguageType from 'parser/lib/IValue'
import IExpression from './IExpression'
import IVisitor from './IVisitor'
import ArrayValue from 'parser/lib/types/ArrayValue'
import UndefinedType from 'parser/lib/types/UndefinedValue'

export default class ArrayExpression implements IExpression {
  constructor(public elements: (IExpression | null)[]) {}

  public eval(): IECMAScriptLanguageType {
    const size = this.elements.length
    const array = new ArrayValue(size)
    this.elements.forEach((expr, i) => {
      array.set(String(i), expr?.eval() ?? UndefinedType.UNDEFINED)
    })
    return array
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.elements.toString()
  }
}
