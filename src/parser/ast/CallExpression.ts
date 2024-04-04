import IECMAScriptLanguageType from 'parser/lib/IValue'
import IExpression from './IExpression'
import IVisitor from './IVisitor'
import { ConstructorValue, FunctionObjectType } from 'parser/lib/types/FunctionValue'
import { CallStack, ExecutionContextStack } from 'parser/lib/CallStack'
import MemberExpression from './MemberExpression'
import { This, Variables } from 'parser/lib/Variables'
import UndefinedType from 'parser/lib/types/UndefinedValue'
import { ClassInstance, ObjectType } from 'parser/lib/types/ObjectValue'
import ArrayValue from 'parser/lib/types/ArrayValue'
import { ClassDeclaration, Super } from './ClassDeclarationStatement'

// function execution context.
// this.createFEC()
// this.hoisting()
// this.bindThis()

// TODO: MERGE FUNCTION AND CALSS

export class CallExpression implements IExpression {
  constructor(public callee: IExpression, public args: IExpression[]) {}

  public eval(): IECMAScriptLanguageType {
    const value = this.callee.eval()
    const args = this.args.map((v) => v.eval())

    const this_ =
      this.callee instanceof MemberExpression
        ? this.callee.getThis()
        : this.callee instanceof Super
        ? Variables.getThis()
        : UndefinedType.UNDEFINED

    return CallExpression.eval(value, args, this_, this.callee instanceof Super)
  }

  static eval(
    value: IECMAScriptLanguageType,
    args: IECMAScriptLanguageType[],
    this_: This,
    super_ = false,
  ): IECMAScriptLanguageType {
    if (!(value instanceof FunctionObjectType)) throw new Error('expect function instead get1 ' + value)

    CallStack.enter('call')
    Variables.enterScope(value, value.getScope())
    const result = value['[[Call]]'](this_, args)
    Variables.exitScope()
    CallStack.exit()

    if (super_) {
      const value = Variables.getScope().callee
      if (value instanceof ClassDeclaration) {
        // value.initValue()
      }
    }

    return result['[[Value]]']
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

  public eval(): IECMAScriptLanguageType {
    const value = this.callee.eval()
    if (!(value instanceof ConstructorValue)) throw new Error('expect function instead get2 ' + value)

    const this_ = new ClassInstance(value['[[prototype]]'], undefined, '')
    // value.getName()

    CallStack.enter('new')
    Variables.enterScope(value, value.getScope())
    const values = this.args.map((v) => v.eval())
    const result = value['[[construct]]'](this_, values) // this === 0
    Variables.exitScope()
    CallStack.exit()

    return result['[[Value]]']
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.callee + '(' + this.args.toString() + ')'
  }
}
