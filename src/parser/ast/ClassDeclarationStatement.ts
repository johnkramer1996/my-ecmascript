import IValue from 'parser/lib/IValue'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import Function from 'parser/lib/Function'
import { ClassInstance, ObjectValue } from 'parser/lib/types/ObjectValue'
import { FunctionValue } from 'parser/lib/types/FunctionValue'
import { Identifier } from './Identifier'
import IExpression from './IExpression'
import UndefinedValue from 'parser/lib/types/UndefinedValue'
import { Scope, This, Variables } from 'parser/lib/Variables'
import FunctionExpression from './FunctionExpression'
import { CallExpression } from './CallExpression'

export type KindMethod = 'constructor' | 'method'

export class MethodDefinition {
  constructor(
    public key: Identifier,
    public value: FunctionExpression,
    public static_ = false,
    public kind: KindMethod = 'method',
  ) {}
}

export class PropertyDefinition {
  constructor(public key: Identifier, public value: IExpression | null, public static_ = false) {}
}

export class ClassField {
  constructor(public name: string, public value: IValue) {}
}

export class ClassMethod {
  constructor(public name: string, public value: FunctionValue) {}
}

export class Super implements IExpression {
  public eval(): IValue {
    const class_ = Variables.getScope().calleeParent?.callee
    if (!class_)
      throw new Error('Super calls are not permitted outside constructors or in nested functions inside constructors.')
    if (!(class_ instanceof ClassDeclaration)) throw new Error('not have extends class')
    const superClass = class_.superClass && class_.superClass.eval().raw()
    if (!(superClass instanceof ClassDeclaration)) throw new Error("'super' can only be referenced in a derived class.")
    return new FunctionValue(superClass)
  }

  public accept(visitor: IVisitor): void {
    throw new Error('Method not implemented.')
  }

  public toString(): string {
    return 'super'
  }
}

export class ClassDeclaration implements Function {
  public scope: Scope
  private value: ObjectValue
  public constructor_: FunctionValue | null = null
  public name: string

  constructor(
    public id: Identifier,
    public superClass: Identifier | null,
    public classFields: ClassField[] = [],
    public classMethods: ClassMethod[] = [],
    public staticClassFields: ClassField[] = [],
    public staticClassMethods: ClassMethod[] = [],
  ) {
    this.name = id.name
    this.scope = Variables.scope
    const superClassValue = this.getSuperClass()
    const proto = superClassValue?.getValue()
    const prototype = new ObjectValue(proto?.get('prototype'))
    prototype.set('constructor', new FunctionValue(this))

    const value = (this.value = new ObjectValue(proto ?? ObjectValue.FunctionPrototype))
    value.set('prototype', prototype)

    classMethods.map((method) => {
      const name = method.name
      prototype.set(method.name, method.value)
      if (name === 'constructor') {
        this.constructor_ = method.value
      }
    })

    staticClassFields.forEach((m) => value.set(m.name, m.value))
    staticClassMethods.forEach((m) => value.set(m.name, m.value))
  }

  public getSuperClass(): Function | undefined {
    const superClassValue = this.superClass?.eval()
    if (superClassValue && !(superClassValue instanceof FunctionValue))
      throw new Error('Extends can only func or class')
    return superClassValue?.raw()
  }

  public getScope(): Scope {
    return this.scope
  }

  public getValue(): ObjectValue {
    return this.value
  }

  public call(...args: IValue[]): IValue {
    const this_ = Variables.getThis()
    if (!(this_ instanceof ClassInstance)) throw new Error('only class instance')
    if (!this.superClass) {
      console.log('active')
      this_.activate()
    }

    const superClass = this.getSuperClass()
    if (!this.constructor_ && superClass) {
      // new scope
      superClass.call(...args)
      CallExpression.eval(new FunctionValue(superClass), [], this_)
    }

    if (!this.constructor_ || (this.constructor_ && !superClass)) {
      this.initValue()
    }

    const result = this.constructor_ && CallExpression.eval(this.constructor_, args, this_)

    if (this.superClass && this_ instanceof ClassInstance) {
      console.log('first')
      // this_.activate()
      this_.hasAccess()
    }

    return result ?? UndefinedValue.UNDEFINED
  }

  public initValue() {
    const this_ = Variables.getThis()
    if (this_ instanceof ObjectValue) {
      for (const f of this.classFields) this_.set(f.name, f.value)
    }
  }

  public toString() {
    return `[Class ${this.id.name}]`
  }
}

export class ClassDeclarationStatement implements IStatement {
  public fields: PropertyDefinition[] = []
  public methods: MethodDefinition[] = []

  constructor(public id: Identifier, public extends_: Identifier | null) {}

  public execute(): void {
    const classMethods: ClassMethod[] = []
    const staticClassMethods: ClassMethod[] = []
    const classFields: ClassField[] = []
    const staticClassFields: ClassField[] = []

    this.fields.forEach((f) => {
      const field = new ClassField(f.key.toString(), f.value?.eval() || UndefinedValue.UNDEFINED)
      if (f.static_) staticClassFields.push(field)
      else classFields.push(field)
    })

    this.methods.forEach((m) => {
      const method = new ClassMethod(m.key.toString(), m.value.eval())
      if (m.kind)
        if (m.static_) staticClassMethods.push(method)
        else classMethods.push(method)
    })

    const declaration = new ClassDeclaration(
      this.id,
      this.extends_,
      classFields,
      classMethods,
      staticClassFields,
      staticClassMethods,
    )
    this.id.hoisting('var')
    this.id.define(new FunctionValue(declaration))
  }

  public addField(field: PropertyDefinition) {
    this.fields.push(field)
  }

  public addMethod(method: MethodDefinition) {
    this.methods.push(method)
  }

  public accept(visitor: IVisitor): void {
    throw new Error('Method `ClassDeclarationStatement.accept` not implemented.')
  }
}
