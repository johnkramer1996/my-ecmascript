import IStatement from 'parser/ast/IStatement'
import Value from '../Value'
import Types from './Types'
import TypeException from 'exceptions/TypeException'
import IValue from '../IValue'
import { Scope, Variables } from '../Variables'
import UndefinedValue from './UndefinedValue'
import ECStack from '../CallStack'
import { Params } from 'parser/ast/Params'
import { Identifier } from 'parser/ast/Identifier'
import { MyObject, ObjectValue } from './ObjectValue'
import Function from '../Function'
import { ClassDeclaration } from 'parser/ast/ClassDeclarationStatement'

export class UserDefinedFunction implements Function {
  public scope: Scope
  private value: ObjectValue

  constructor(
    public body: IStatement,
    public params = new Params(),
    public id: Identifier | null,
    public name: string,
  ) {
    this.scope = Variables.scope

    const prototype = new ObjectValue(ObjectValue.ObjectPrototype)
    prototype.set('constructor', new FunctionValue(this))

    this.value = new ObjectValue(ObjectValue.FunctionPrototype)
    this.value.set('prototype', prototype)
  }

  public getValue(): ObjectValue {
    return this.value
  }

  public call(...values: IValue[]): IValue {
    this.hoisting()
    this.setArguments(values)
    this.body.execute()
    return ECStack.getReturn()
  }

  private hoisting(): void {
    for (const param of this.getParams()) param.hoisting('var')
    this.id && this.id.hoisting('var')
  }

  private setArguments(values: IValue[]) {
    this.getParams().forEach((arg, i) => arg.define(values[i] ?? UndefinedValue.UNDEFINED))
    this.id?.define(new FunctionValue(this))
  }

  private getParams() {
    return this.params.values
  }

  public toString(): string {
    return `[function ${this.name}]`
  }
}

export class FunctionValue extends Value<Function> implements IValue {
  constructor(public value: Function) {
    super(value, Types.function)
  }

  public get(key: string) {
    return this.value.getValue().get(key)
  }

  public set(key: string, value: IValue) {
    return this.value.getValue().set(key, value)
  }

  public compareTo(o: IValue): number {
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IValue): boolean {
    if (this === value) return true
    if (!(value instanceof FunctionValue)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    throw new TypeException('Cannot cast function to number')
  }

  public asString(): string {
    return String(this.value)
  }

  public toString(): string {
    return this.asString()
  }
}
