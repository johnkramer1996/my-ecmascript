import IVisitor from './IVisitor'
import { IAccessible } from './IAccessible'
import { Location } from 'parser/Parser'
import Variables from 'parser/lib/Variables'
import IValue from 'parser/lib/IValue'

export class Identifier implements IAccessible {
  // start: number
  // end: number
  constructor(private name: string) {
    // this.start = Location.getPrevToken().start
    // this.end = Location.getPrevToken().end
  }

  public eval(): IValue {
    return Variables.get(this.getName())
  }

  public get(): IValue {
    return Variables.get(this.getName())
  }

  public set(value: IValue): IValue {
    return Variables.set(this.getName(), value), value
  }

  public define(value: IValue): IValue {
    return Variables.define(this.getName(), value), value
  }

  public getName(): string {
    return this.name
  }

  public accept(visitor: IVisitor): void {
    visitor.visit(this)
  }

  public toString(): string {
    return this.name
  }

  public toHtml(): string {
    return `<span class='variable'>${this.name}</span>`
  }
}
