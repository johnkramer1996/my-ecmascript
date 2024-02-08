import IStatement from 'parser/ast/IStatement'
import IValue from './IValue'
import IVisitor from 'parser/ast/IVisitor'
import FunctionValue from './types/FunctionValue'
import Function from './Functions'
import UndefinedValue from './types/UndefinedValue'

const uninitialized = '<uninitialized>'

type Variable = { value: IValue | typeof uninitialized; kind: string }

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

export class BuiltInFunction implements IStatement {
  constructor(public callback: Function) {}

  execute(...values: IValue[]): IValue {
    return this.callback.execute(...values)
  }

  accept(visitor: IVisitor): void {}
}

export class Scope {
  public variables: Map<String, Variable> = new Map()

  constructor(public parent: Scope | null = null) {}
}

export default class Variables {
  public static scope: Scope

  static {
    this.init()
  }

  public static init() {
    this.scope = new Scope()
    // TODO:
    // this.scope.variables.set('console', {
    //   value: new MapValue({
    //     log: new FunctionValue(new BuiltInFunction({ execute: (...values: IValue[]) => (Console.log(values.toString()), UndefinedValue.UNDEFINED) })),
    //   }),
    //   kind: 'conts',
    // })
  }

  public static push(scope?: Scope): void {
    this.scope = scope ?? new Scope(this.scope)
  }

  public static pop(): Scope {
    const scope = this.scope
    if (this.scope.parent) this.scope = this.scope.parent
    return scope
  }

  public static isExists(key: string): boolean {
    return Boolean(this.lookUp(key))
  }

  public static get(key: string): IValue {
    const scopeData = this.lookUp(key)
    if (!scopeData) throw new ReferenceError(`${key} is not defined`)
    const variable = scopeData.variables.get(key)
    if (variable?.value === uninitialized) throw new ReferenceError(`"Cannot access '${key}' before init`)
    return (scopeData.variables.get(key) as Variable).value as IValue
  }

  public static set(key: string, value: IValue): IValue {
    const scopeData = this.lookUp(key)
    if (!scopeData) throw new ReferenceError(`${key} is not defined`)
    const variable = scopeData.variables.get(key)
    if (variable?.value === uninitialized) throw new ReferenceError(`"Cannot access '${key}' before init`)
    if (!variable) throw new ReferenceError('Varaible undefined' + key)
    if (variable.kind === 'const') throw new SyntaxError(`Cannot assign to '${key}' because it is a constant.`)
    variable.value = value
    // if (value instanceof FunctionValue) value.setScope(new Scope(Variables.scope))
    return value
  }

  public static define(key: string, value: IValue): IValue {
    const variable = this.scope.variables.get(key)
    if (!variable) throw new ReferenceError('Variable undefined ' + key)
    if (!(variable.value === uninitialized) && variable.kind === 'func') return variable.value
    variable.value = value
    return value
  }

  public static hoisting(key: string, kind: string, val: IValue = UndefinedValue.UNDEFINED) {
    const variable = this.scope.variables.get(key)
    if (variable?.value === uninitialized) {
      throw new SyntaxError(`Identifier '${key}' has already been declared. `)
    }
    const value = kind === 'func' ? val : kind === 'var' ? UndefinedValue.UNDEFINED : uninitialized
    this.scope.variables.set(key, { value, kind })
    if (val instanceof FunctionValue) {
      val.setScope(Variables.scope)
    }
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
