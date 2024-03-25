import IExpression from './IExpression'
import { IAccessible } from './IAccessible'
import { AssignmentPattern } from './AssignmentPattern'

export class Params implements Iterable<IAccessible> {
  public values: IAccessible[] = []
  public requiredArgumentsCount = 0
  public hasOptionalParams = false

  public add(name: IAccessible, expr: IExpression | null): void {
    this.values.push(expr ? new AssignmentPattern(name, expr) : name)
    !expr && ++this.requiredArgumentsCount

    if (!expr && this.hasOptionalParams) throw Error('Required argument cannot be after optional')
    if (expr) this.hasOptionalParams = true
  }

  public get(index: number): IAccessible {
    return this.values[index]
  }

  public getRequiredArgumentsCount(): number {
    return this.requiredArgumentsCount
  }

  public size(): number {
    return this.values.length
  }

  public iterator(): Iterator<IAccessible> {
    return this[Symbol.iterator]()
  }

  public [Symbol.iterator](): Iterator<IAccessible> {
    return this.values[Symbol.iterator]()
  }

  public toString(): string {
    return `(${this.values.join(', ')})`
  }

  public toHtml(): string {
    return `(${this.values.join(', ')})`
  }
}
