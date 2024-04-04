import IECMAScriptLanguageType from './IValue'
import UndefinedType from './types/UndefinedValue'
import { ObjectType } from './types/ObjectValue'
import { FunctionObjectType } from './types/FunctionValue'
import ArrayValue from './types/ArrayValue'
import StringType from './types/StringValue'
import NumberType from './types/NumberValue'
import { initFundamentalObjects } from './fundamental-objects/NativeFunction'
import { ClassDeclaration } from 'parser/ast/ClassDeclarationStatement'

const uninitialized = '<uninitialized>'

type Variable = { value: IECMAScriptLanguageType | typeof uninitialized; kind: string }

export class Scope<T extends This = This> {
  public variables: Map<String, Variable> = new Map()

  constructor(
    public callee: FunctionObjectType | ClassDeclaration | null = null,
    public parent: Scope<T> | null = null,
    public calleeParent: Scope<T> | null = null,
    public this_: T,
  ) {}
}

type GlobalThis = ObjectType
export type This = GlobalThis | ArrayValue | UndefinedType

export class Variables {
  public static globalScope: Scope<GlobalThis>
  public static scope: Scope<This>

  public static init() {
    const globalObject = new ObjectType()
    globalObject['[[Set]]']('window', globalObject)
    globalObject['[[Set]]']('globalThis', globalObject)
    globalObject['[[Set]]']('NaN', NumberType.NaN)
    globalObject['[[Set]]']('undefined', UndefinedType.UNDEFINED)

    this.globalScope = this.scope = new Scope(null, null, null, globalObject)

    ObjectType.ObjectPrototype['[[Set]]'](
      'toString',
      new FunctionObjectType({
        execute(...args) {
          const _this = Variables.get('this')
          return new StringType(`[${_this.type()} object]`)
        },
        accept(visitor) {},
      }),
    )

    const { Object_, Function_, Number_, String_, Boolean_ } = initFundamentalObjects()

    Variables.hoisting('Object', 'func', Object_)
    // Variables.hoisting('Function', 'func', Function_)
    Variables.hoisting('Number', 'func', Number_)
    Variables.hoisting('String', 'func', String_)
    // Variables.hoisting('Boolean', 'func', Boolean_)
  }

  public static bindThis(value: This): void {
    this.scope.this_ = value
  }

  public static getThis(): This {
    return this.scope.this_
  }

  public static getScope(): Scope {
    return this.scope
  }

  public static enterScope(callee?: FunctionObjectType | ClassDeclaration, parent?: Scope): void {
    this.scope = new Scope(callee, parent ?? this.scope, this.scope, UndefinedType.UNDEFINED)
  }

  public static exitScope(): Scope {
    const scope = this.scope
    if (this.scope.calleeParent) this.scope = this.scope.calleeParent
    return scope
  }

  public static isExists(key: string): boolean {
    return Boolean(this.lookUp(key))
  }

  public static get(key: string): IECMAScriptLanguageType {
    const scopeData = this.lookUp(key)
    if (!scopeData) {
      const value = this.globalScope.this_['[[Get]]'](key)['[[Value]]']
      if (!(value === UndefinedType.UNDEFINED && key !== 'undefined')) return value
      throw new ReferenceError(`${key} is not defined`)
    }
    const variable = scopeData.variables.get(key) as Variable
    if (variable.value === uninitialized) throw new ReferenceError(`"Cannot access '${key}' before init`)
    return variable.value
  }

  public static set(key: string, value: IECMAScriptLanguageType): IECMAScriptLanguageType {
    const scopeData = this.lookUp(key)
    if (!scopeData) throw new ReferenceError(`${key} is not defined`)
    const variable = scopeData.variables.get(key)
    if (variable?.value === uninitialized) throw new ReferenceError(`"Cannot access '${key}' before init`)
    if (!variable) throw new ReferenceError('Varaible undefined ' + key)
    if (variable.kind === 'const') throw new SyntaxError(`Cannot assign to '${key}' because it is a constant.`)
    variable.value = value
    return value
  }

  public static define(key: string, value: IECMAScriptLanguageType): void {
    const variable = this.scope.variables.get(key)
    if (!variable) throw new ReferenceError('Variable undefined ' + key)
    if (!(variable.value === uninitialized) && variable.kind === 'func') return
    variable.value = value
  }

  public static hoisting(key: string, kind: string, val: IECMAScriptLanguageType = UndefinedType.UNDEFINED) {
    const variable = this.scope.variables.get(key)
    if (variable?.value === uninitialized) {
      throw new SyntaxError(`Identifier '${key}' has already been declared. `)
    }
    const value = kind === 'func' ? val : kind === 'var' ? UndefinedType.UNDEFINED : uninitialized
    this.scope.variables.set(key, { value, kind })
  }

  public static remove(key: string) {
    this.lookUp(key)?.variables.delete(key)
  }

  private static lookUp(variable: string): Scope | null {
    let current: Scope | null = this.scope
    do {
      if (!current.variables.has(variable)) continue
      return current
    } while ((current = current.parent))

    return null
  }
}
