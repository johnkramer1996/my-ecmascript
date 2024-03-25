import IValue from 'parser/lib/IValue'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import Function from 'parser/lib/Function'
import ObjectValue from 'parser/lib/types/ObjectValue'
import { FunctionValue } from 'parser/lib/types/FunctionValue'
import { Identifier } from './Identifier'
import IExpression from './IExpression'
import UndefinedValue from 'parser/lib/types/UndefinedValue'
import { Scope, Variables } from 'parser/lib/Variables'
import FunctionExpression from './FunctionExpression'

export class MethodDefinition {
  constructor(public key: string, public value: FunctionExpression, public static_ = false) {}
}

export class PropertyDefinition {
  constructor(public key: string, public value: IExpression | null, public static_ = false) {}
}

export class ClassField {
  constructor(public name: string, public value: IValue) {}
}

export class ClassMethod {
  constructor(public name: string, public value: FunctionValue) {}
}

export class ClassDeclaration {
  public scope: Scope
  private value: ObjectValue
  private constructor_: FunctionValue | null = null

  constructor(
    public name: string,
    public classFields: ClassField[] = [],
    public classMethods: ClassMethod[] = [],
    public staicClassFields: ClassField[] = [],
    public staticClassMethods: ClassMethod[] = [],
  ) {
    this.scope = Variables.scope

    const prototype = new ObjectValue(ObjectValue.ObjectPrototype)
    prototype.set('constructor', new FunctionValue(this))

    classMethods.map((method) => {
      const name = method.name
      prototype.set(method.name, method.value)
      if (name === 'constructor') {
        this.constructor_ = method.value
      }
    })

    const value = (this.value = new ObjectValue(FunctionValue.FunctionPrototype))
    value.set('prototype', prototype)

    staicClassFields.forEach((m) => value.set(m.name, m.value))
    staticClassMethods.forEach((m) => value.set(m.name, m.value))
  }

  public call(...args: IValue[]): IValue {
    const this_ = Variables.getThis()
    if (this_ instanceof ObjectValue) {
      for (const f of this.classFields) this_.set(f.name, f.value)
    }
    const result = this.constructor_?.raw().call(...args)
    return result ?? UndefinedValue.UNDEFINED
  }

  public getValue(): ObjectValue {
    return this.value
  }

  public toString() {
    return `[Class ${this.name}]`
  }
}

export class ClassDeclarationStatement implements IStatement {
  public fields: PropertyDefinition[] = []
  public methods: MethodDefinition[] = []

  constructor(public id: Identifier) {}

  public execute(): void {
    const classMethods: ClassMethod[] = []
    const staticClassMethods: ClassMethod[] = []
    const classFields: ClassField[] = []
    const staticClassFields: ClassField[] = []

    this.fields.forEach((f) => {
      const field = new ClassField(f.key, f.value?.eval() || UndefinedValue.UNDEFINED)
      if (f.static_) staticClassFields.push(field)
      else classFields.push(field)
    })

    this.methods.forEach((m) => {
      const method = new ClassMethod(m.key, m.value.eval())
      if (m.static_) staticClassMethods.push(method)
      else classMethods.push(method)
    })

    const declaration = new ClassDeclaration(
      this.id.name,
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
