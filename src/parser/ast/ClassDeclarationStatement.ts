import IECMAScriptLanguageType from 'parser/lib/IValue'
import IStatement from './IStatement'
import IVisitor from './IVisitor'
import { ClassInstance, ObjectType } from 'parser/lib/types/ObjectValue'
import { FunctionObjectType } from 'parser/lib/types/FunctionValue'
import { Identifier } from './Identifier'
import IExpression from './IExpression'
import UndefinedType from 'parser/lib/types/UndefinedValue'
import { List, getNC } from 'parser/lib/spec/6.2'
import { Params } from './Params'
import { Evaluation } from 'parser/lib/spec/15.7'

export type ClassElementKind = 'CONSTRUCTOR-METHOD' | 'NON-CONSTRUCTOR-METHOD' | 'EMPTY'

export abstract class ClassElement {
  constructor(public classElementName: Identifier, public initializer: IExpression | null, public static_ = false) {}

  // 15.7.2 Static Semantics: ClassElementKind
  public ClassElementKind(): ClassElementKind {
    return 'EMPTY'
  }

  // 15.7.3 Static Semantics: ConstructorMethod
  public ConstructorMethod() {
    if (this.ClassElementKind() === 'CONSTRUCTOR-METHOD') return this
    return 'EMPTY'
  }

  // 15.7.4 Static Semantics: IsStatic
  public IsStatic() {
    // Return false.
    return false
  }

  // 15.7.5 Static Semantics: NonConstructorElements
  public NonConstructorElements(): List<IECMAScriptLanguageType> | this {
    if (this.ClassElementKind() === 'NON-CONSTRUCTOR-METHOD') return this
    return new List()
  }

  public propName(): string {
    return this.classElementName.name
  }

  accept(visitor: IVisitor): void {
    throw new Error('Method not implemented.')
  }
  toString(): string {
    throw new Error('Method not implemented.')
  }
}

export class MethodDefinition extends ClassElement {
  constructor(
    public classElementName: Identifier,
    public uniqueFormalParameters: Params,
    public functionBody: IStatement,
    public static_ = false,
  ) {
    super(classElementName, null)
  }

  public ClassElementKind(): ClassElementKind {
    // 1. If PropName of MethodDefinition is "constructor", return CONSTRUCTOR-METHOD.
    if (this.propName() === 'constructor') return 'CONSTRUCTOR-METHOD'
    // 2. Return NON-CONSTRUCTOR-METHOD.
    return 'NON-CONSTRUCTOR-METHOD'
  }

  public IsStatic() {
    return this.static_
  }
}

export class FieldDefinition extends ClassElement {
  public ClassElementKind(): ClassElementKind {
    // 1. Return NON-CONSTRUCTOR-METHOD.
    return 'NON-CONSTRUCTOR-METHOD'
  }

  public IsStatic() {
    return this.static_
  }
}

export class ClassField {
  constructor(public name: string, public value: IECMAScriptLanguageType) {}
}

export class ClassMethod {
  constructor(public name: string, public value: IECMAScriptLanguageType) {}
}

export class Super implements IExpression {
  public eval(): IECMAScriptLanguageType {
    return UndefinedType.UNDEFINED
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

    const prototype = new ObjectType(__proto__ && getNC(__proto__['[[Get]]']('prototype'))['[[Value]]'])
    prototype['[[Set]]']('constructor', this)
    this['[[Set]]']('prototype', prototype)

    classMethods.map((method) => {
      prototype['[[Set]]'](method.name, method.value)
      if (method.name === 'constructor') {
        // this.constructor_ = method.value
      }
    })

    staticClassFields.forEach((m) => this['[[Set]]'](m.name, m.value))
    staticClassMethods.forEach((m) => this['[[Set]]'](m.name, m.value))
  }

  public getName(): string {
    return this.name ?? ''
  }

  public call(thisArgument: any, ...argumentsList: IECMAScriptLanguageType[]): IECMAScriptLanguageType {
    if (!(thisArgument instanceof ClassInstance)) throw new Error('only class instance')
    if (!this.superClass) {
    }

    const __proto__ = this.superClass?.eval()
    if (__proto__ && !(__proto__ instanceof ClassDeclaration)) throw new Error('Extends can only func or class')
    if (!this.constructor_ && __proto__) {
      // CallExpression.eval(__proto__, [], thisArgument)
    }

    const result = this.constructor_
    // && CallExpression.eval(this.constructor_, argumentsList, thisArgument)

    if (this.superClass && thisArgument instanceof ClassInstance) {
      // this_.activate()
    }

    return result ?? UndefinedType.UNDEFINED
  }

  public toString() {
    return `[Class ${this.id.name}]`
  }
}

export class ClassTail {
  constructor(public classHeritage: Identifier | null, public classBody: (MethodDefinition | FieldDefinition)[]) {}
}

export class ClassDeclarationStatement implements IStatement {
  constructor(public bindingIdentifier: Identifier, public classTail: ClassTail) {}

  public execute(): void {
    Evaluation(this)

    const classMethods: ClassMethod[] = []
    const staticClassMethods: ClassMethod[] = []
    const classFields: ClassField[] = []
    const staticClassFields: ClassField[] = []

    const fields = this.classTail.classBody.filter((p) => p instanceof FieldDefinition) as FieldDefinition[]
    const methods = this.classTail.classBody.filter((p) => p instanceof MethodDefinition) as MethodDefinition[]

    // fields.forEach((f) => {
    //   const field = new ClassField(f.classElementName.toString(), f.initializer?.eval() || UndefinedType.UNDEFINED)
    //   if (f.static_) staticClassFields.push(field)
    //   else classFields.push(field)
    // })

    // methods.forEach((m) => {
    //   const method = new ClassMethod(m.classElementName.toString(), m.initializer.eval())
    //   if (m.static_) staticClassMethods.push(method)
    //   else classMethods.push(method)
    // })

    const declaration = new ClassDeclaration(
      this.bindingIdentifier,
      this.classTail.classHeritage,
      classFields,
      classMethods,
      staticClassFields,
      staticClassMethods,
    )
    this.bindingIdentifier.hoisting()
    this.bindingIdentifier.define(declaration)
  }

  public accept(visitor: IVisitor): void {
    throw new Error('Method `ClassDeclarationStatement.accept` not implemented.')
  }
}
