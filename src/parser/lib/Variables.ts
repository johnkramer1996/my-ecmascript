import IStatement from 'parser/ast/IStatement'
import IValue from './IValue'
import IVisitor from 'parser/ast/IVisitor'
import Function from './Function'
import UndefinedValue from './types/UndefinedValue'
import ObjectValue from './types/ObjectValue'
import { FunctionValue } from './types/FunctionValue'
import ArrayValue from './types/ArrayValue'
import StringValue from './types/StringValue'
import Types from './types/Types'
import Lexer from 'parser/Lexer'
import Parser from 'parser/Parser'

const uninitialized = '<uninitialized>'

// var Scope = function Scope(flags) {
//   this.flags = flags;
//   this.var = [];
//   this.lexical = [];
//   this.functions = [];
//   this.inClassFieldInit = false;
//   pp$3.enterScope = function(flags) {
//     this.scopeStack.push(new Scope(flags));
//   };

//   pp$3.exitScope = function() {
//     this.scopeStack.pop();
//   };

// };

type Variable = { value: IValue | Function | typeof uninitialized; kind: string }

export class Scope<T extends This = This> {
  public variables: Map<String, Variable> = new Map()

  constructor(public parent: Scope<T> | null = null, public this_: T) {}
}

type GlobalThis = ObjectValue
type This = GlobalThis | ArrayValue | UndefinedValue

export class Variables {
  public static globalScope: Scope<GlobalThis>
  public static scope: Scope<This>

  public static init(this_: ObjectValue) {
    this.globalScope = this.scope = new Scope(null, this_)

    const _FunctionValue = new ObjectValue(FunctionValue.FunctionPrototype)

    const _Function = new FunctionValue({
      call(string: IValue) {
        const lexer = new Lexer(string.asString())
        const tokens = lexer.tokenize()
        const parser = new Parser(tokens)
        const ast = parser.parseFunction()

        return new FunctionValue({
          call: () => {
            try {
              Variables.enterScope(Variables.globalScope)
              ast.execute()
              Variables.exitScope()
            } catch (e) {
              console.error(e)
            }

            return UndefinedValue.UNDEFINED
          },
          getValue() {
            return new ObjectValue()
          },
        })
      },
      getValue() {
        return _FunctionValue
      },
      toString() {
        return 'Functoin'
      },
    })

    ObjectValue.ObjectPrototype.set(
      'toString',
      new FunctionValue({
        call(...args) {
          const _this = Variables.get('this')
          return new StringValue(`[${Types[_this.type()]} object]`)
        },
        getValue() {
          return new ObjectValue()
        },
      }),
    )

    _FunctionValue.set('prototype', FunctionValue.FunctionPrototype)
    _FunctionValue.set('constructor', _Function)
    Variables.hoisting('Function', 'func', _Function)
  }

  public static bindThis(value: This): void {
    this.scope.this_ = value
  }

  public static getThis(): This {
    return this.scope.this_
  }

  public static enterScope(parent?: Scope): void {
    this.scope = new Scope(parent ?? this.scope, UndefinedValue.UNDEFINED)
  }

  public static exitScope(): Scope {
    const scope = this.scope
    if (this.scope.parent) this.scope = this.scope.parent
    return scope
  }

  public static isExists(key: string): boolean {
    return Boolean(this.lookUp(key))
  }

  public static get(key: string): IValue {
    const scopeData = this.lookUp(key)
    if (!scopeData) {
      const this_ = this.globalScope.this_
      const value = this_.get(key)
      if (!(value === UndefinedValue.UNDEFINED)) return value
      throw new ReferenceError(`${key} is not defined`)
    }
    const variable = scopeData.variables.get(key)
    if (variable?.value === uninitialized) throw new ReferenceError(`"Cannot access '${key}' before init`)
    return (scopeData.variables.get(key) as Variable).value as IValue
  }

  public static set(key: string, value: IValue): IValue {
    const scopeData = this.lookUp(key)
    if (!scopeData) throw new ReferenceError(`${key} is not defined`)
    const variable = scopeData.variables.get(key)
    if (variable?.value === uninitialized) throw new ReferenceError(`"Cannot access '${key}' before init`)
    if (!variable) throw new ReferenceError('Varaible undefined ' + key)
    if (variable.kind === 'const') throw new SyntaxError(`Cannot assign to '${key}' because it is a constant.`)
    variable.value = value
    // if (value instanceof FunctionValue) value.setScope(new Scope(Variables.scope))
    return value
  }

  public static define(key: string, value: IValue): void {
    const variable = this.scope.variables.get(key)
    if (!variable) throw new ReferenceError('Variable undefined ' + key)
    if (!(variable.value === uninitialized) && variable.kind === 'func') return
    variable.value = value
  }

  public static hoisting(key: string, kind: string, val: IValue = UndefinedValue.UNDEFINED) {
    const variable = this.scope.variables.get(key)
    if (variable?.value === uninitialized) {
      throw new SyntaxError(`Identifier '${key}' has already been declared. `)
    }
    const value = kind === 'func' ? val : kind === 'var' ? UndefinedValue.UNDEFINED : uninitialized
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

// export class BuiltInFunction implements IStatement {
//   constructor(public callback: Function) {}

//   execute(...values: IValue[]): IValue {
//     return this.callback.execute(...values)
//   }

//   accept(visitor: IVisitor): void {}
// }
