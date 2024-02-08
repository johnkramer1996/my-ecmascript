import IStatement from 'parser/ast/IStatement'
import Value from '../Value'
import Types from './Types'
import TypeException from 'exceptions/TypeException'
import IValue from '../IValue'
import Variables, { BuiltInFunction, Scope } from '../Variables'
import UserDefinedFunction from '../UserDefinedFunction'
import UndefinedValue from './UndefinedValue'
import CallStack from '../CallStack'
import { Params } from 'parser/ast/Params'

export default class FunctionValue extends Value<IStatement> implements IValue {
  // public static EMPTY: FunctionValue = new FunctionValue({ execute: () => BooleanValue.FALSE })

  constructor(value: IStatement, public params: Params = new Params()) {
    super(value, Types.FUNCTION)
  }

  public execute(...values: IValue[]): IValue {
    if (this.value instanceof BuiltInFunction) return this.value.execute(...values)
    this.hoisting()
    this.setArgs(values)
    console.log(this.params)
    console.log(Variables.scope)
    console.log(this.params.params)
    this.value.execute()
    return CallStack.getReturn()
  }

  public hoisting() {
    for (const param of this.getParams()) Variables.hoisting(param.getName(), 'var')
  }

  public getValue(): IStatement {
    return this.value
  }

  public setArgs(values: IValue[]) {
    this.getParams().forEach((arg, i) => arg.define(values[i] ?? UndefinedValue.UNDEFINED))
  }

  public getParams() {
    return this.params.params
  }

  public setScope(scope: Scope) {
    if (this.value instanceof UserDefinedFunction) {
      this.value.outer = scope
    }
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
