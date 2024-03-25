import IValue from 'parser/lib/IValue'
import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { FunctionValue } from 'parser/lib/types/FunctionValue'
import CallStack from 'parser/lib/CallStack'
import MemberExpression from './MemberExpression'
import { Variables } from 'parser/lib/Variables'
import UndefinedValue from 'parser/lib/types/UndefinedValue'
import ObjectValue from 'parser/lib/types/ObjectValue'
import ArrayValue from 'parser/lib/types/ArrayValue'

// function execution context.
// this.createFEC()
// this.hoisting()
// this.bindThis()

export class CallExpression implements IExpression {
  constructor(public callee: IExpression, public args: IExpression[]) {}

  public eval(): IValue {
    const value = this.callee.eval()
    if (!(value instanceof FunctionValue)) throw new Error('expect function ' + value)

    const func = value.raw()
    const _this = this.callee instanceof MemberExpression ? this.callee.getThis() : UndefinedValue.UNDEFINED

    CallStack.enter('call')
    Variables.enterScope()
    Variables.bindThis(_this)
    const values = this.args.map((v) => v.eval())
    const result = func.call(...values)
    Variables.exitScope()
    CallStack.exit()

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
    if (!(value instanceof FunctionValue)) throw new Error('expect function ' + value)

    const func = value.raw()
    const _this = new ObjectValue(func.getValue().get('prototype'))

    CallStack.enter('new')
    Variables.enterScope()
    Variables.bindThis(_this)
    const values = this.args.map((v) => v.eval())
    const result = func.call(...values) // this === 0
    Variables.exitScope()
    CallStack.exit()
    const res = result instanceof ObjectValue || result instanceof ArrayValue ? result : _this

    return res
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.callee + '(' + this.args.toString() + ')'
  }
}
