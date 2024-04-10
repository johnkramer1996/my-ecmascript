import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import IECMAScriptLanguageType from 'parser/lib/IValue'
import ArrayValue from 'parser/lib/types/ArrayValue'
import { BooleanType } from 'parser/lib/types/BooleanValue'
import IExpression from './IExpression'
import { ExecutionContextStack } from 'parser/lib/spec/9.4'
import { getNC } from 'parser/lib/spec/6.2'

export class ArrayPattern implements IExpression, IAccessible, Iterable<IAccessible> {
  constructor(public elements: IAccessible[]) {}

  public eval(): IECMAScriptLanguageType {
    const colleeContext = ExecutionContextStack.runningExecutionContext()
    return getNC(colleeContext.LexicalEnvironment.GetBindingValue(this.getName(), true))['[[Value]]']
  }

  public set(value: IECMAScriptLanguageType): IECMAScriptLanguageType {
    if (!(value instanceof ArrayValue)) throw new Error('expect array')
    this.elements.forEach((variable, i) => variable.set(value.get(String(i))))
    return BooleanType.FALSE
  }

  public define(value: IECMAScriptLanguageType): IECMAScriptLanguageType {
    if (!(value instanceof ArrayValue)) throw new Error('expect array')
    this.elements.forEach((variable, i) => variable.define(value.get(String(i))))
    return BooleanType.FALSE
  }

  public hoisting(kind: string): void {
    this.elements.forEach((variable) => variable.hoisting(kind))
  }

  public getName(): string {
    return ''
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public [Symbol.iterator](): Iterator<IAccessible> {
    return this.elements[Symbol.iterator]()
  }
}
