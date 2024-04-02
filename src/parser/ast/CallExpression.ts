import IValue from 'parser/lib/IValue'
import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { FunctionValue } from 'parser/lib/types/FunctionValue'
import ECStack from 'parser/lib/CallStack'
import MemberExpression from './MemberExpression'
import { This, Variables } from 'parser/lib/Variables'
import UndefinedValue from 'parser/lib/types/UndefinedValue'
import { ClassInstance, ObjectValue } from 'parser/lib/types/ObjectValue'
import ArrayValue from 'parser/lib/types/ArrayValue'
import { ClassDeclaration, Super } from './ClassDeclarationStatement'

// function execution context.
// this.createFEC()
// this.hoisting()
// this.bindThis()

export class CallExpression implements IExpression {
  constructor(public callee: IExpression, public args: IExpression[]) {}

  public eval(): IValue {
    const value = this.callee.eval()
    const args = this.args.map((v) => v.eval())

    const this_ =
      this.callee instanceof MemberExpression
        ? this.callee.getThis()
        : this.callee instanceof Super
        ? Variables.getThis()
        : UndefinedValue.UNDEFINED

    return CallExpression.eval(value, args, this_, this.callee instanceof Super)
  }

  static eval(value: IValue, args: IValue[], this_: This, super_ = false): IValue {
    if (!(value instanceof FunctionValue)) throw new Error('expect function instead get1 ' + value)

    const func = value.raw()

    ECStack.enter('call')
    Variables.enterScope(func, func.scope)
    Variables.bindThis(this_)
    const result = func.call(...args)
    Variables.exitScope()
    ECStack.exit()

    if (super_) {
      const value = Variables.getScope().callee
      if (value instanceof ClassDeclaration) {
        value.initValue()
      }
    }

    return result
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.callee + '(' + this.args.toString() + ')'
  }
}

export class NewExpression implements IExpression {
  constructor(public callee: IExpression, public args: IExpression[]) {}

  public eval(): IValue {
    const value = this.callee.eval()
    if (!(value instanceof FunctionValue)) throw new Error('expect function instead get2 ' + value)

    const func = value.raw()
    const this_ = new ClassInstance(func.getValue().get('prototype'), undefined, func.name ?? '')

    ECStack.enter('new')
    Variables.enterScope(func, func.scope)
    Variables.bindThis(this_)
    const values = this.args.map((v) => v.eval())
    const result = func.call(...values) // this === 0
    Variables.exitScope()
    ECStack.exit()

    const isObject = result instanceof ObjectValue || result instanceof ArrayValue || result instanceof FunctionValue
    return isObject ? result : this_
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.callee + '(' + this.args.toString() + ')'
  }
}
