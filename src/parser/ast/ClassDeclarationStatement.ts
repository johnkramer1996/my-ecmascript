import IECMAScriptLanguageType from 'parser/lib/IValue'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import Function from 'parser/lib/Function'
import { ClassInstance, ObjectType } from 'parser/lib/types/ObjectValue'
import { FunctionObjectType } from 'parser/lib/types/FunctionValue'
import { Identifier } from './Identifier'
import IExpression from './IExpression'
import UndefinedType from 'parser/lib/types/UndefinedValue'
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
  constructor(public name: string, public value: IECMAScriptLanguageType) {}
}

export class ClassMethod {
  constructor(public name: string, public value: FunctionObjectType) {}
}

export class Super implements IExpression {
  public eval(): IECMAScriptLanguageType {
    return UndefinedType.UNDEFINED
    // const class_ = Variables.getScope().calleeParent?.callee
    // if (!class_)
    //   throw new Error('Super calls are not permitted outside constructors or in nested functions inside constructors.')
    // if (!(class_ instanceof ClassDeclaration)) throw new Error('not have extends class')
    // const superClass = class_.superClass && class_.superClass.eval().raw()
    // if (!(superClass instanceof ClassDeclaration)) throw new Error("'super' can only be referenced in a derived class.")
    // return new FunctionValue(superClass)
  }

  public accept(visitor: IVisitor): void {
    throw new Error('Method not implemented.')
  }

  public toString(): string {
    return 'super'
  }
}

export class ClassDeclaration extends ObjectType {
  public constructor_: FunctionObjectType | null = null
  private name: string
  private scope: Scope

  constructor(
    public id: Identifier,
    public superClass: Identifier | null,
    public classFields: ClassField[] = [],
    public classMethods: ClassMethod[] = [],
    public staticClassFields: ClassField[] = [],
    public staticClassMethods: ClassMethod[] = [],
  ) {
    const __proto__ = superClass?.eval()
    if (__proto__ && !(__proto__ instanceof ClassDeclaration)) throw new Error('Extends can only func or class')

    super(__proto__ ?? ObjectType.FunctionPrototype)
    this.name = id.name

    const prototype = new ObjectType(__proto__ && __proto__['[[Get]]']('prototype')['[[Value]]'])
    prototype['[[Set]]']('constructor', this)
    this['[[Set]]']('prototype', prototype)

    classMethods.map((method) => {
      prototype['[[Set]]'](method.name, method.value)
      if (method.name === 'constructor') {
        this.constructor_ = method.value
      }
    })

    staticClassFields.forEach((m) => this['[[Set]]'](m.name, m.value))
    staticClassMethods.forEach((m) => this['[[Set]]'](m.name, m.value))
    this.scope = Variables.scope
  }

  public getScope(): Scope {
    return this.scope
  }

  public getName(): string {
    return this.name ?? ''
  }

  public call(thisArgument: This, ...argumentsList: IECMAScriptLanguageType[]): IECMAScriptLanguageType {
    Variables.bindThis(this)
    if (!(thisArgument instanceof ClassInstance)) throw new Error('only class instance')
    if (!this.superClass) {
    }

    const __proto__ = this.superClass?.eval()
    if (__proto__ && !(__proto__ instanceof ClassDeclaration)) throw new Error('Extends can only func or class')
    if (!this.constructor_ && __proto__) {
      CallExpression.eval(__proto__, [], thisArgument)
    }

    if (!this.constructor_ || (this.constructor_ && !__proto__)) {
      this.initValue()
    }

    const result = this.constructor_ && CallExpression.eval(this.constructor_, argumentsList, thisArgument)

    if (this.superClass && thisArgument instanceof ClassInstance) {
      // this_.activate()
    }

    return result ?? UndefinedType.UNDEFINED
  }

  public initValue() {
    const this_ = Variables.getThis()
    if (this_ instanceof ObjectType) {
      for (const f of this.classFields) this_['[[Set]]'](f.name, f.value)
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
      const field = new ClassField(f.key.toString(), f.value?.eval() || UndefinedType.UNDEFINED)
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
    this.id.define(declaration)
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
