import IValue from './IValue'
import UndefinedValue from './types/UndefinedValue'

export class CallInfo {
  // constructor(public name: string, public func: Function) {}
  constructor(public name: string) {}

  public toString(): string {
    return `${this.name}`
  }
}

export default class ECStack {
  private static calls: CallInfo[] = []
  private static return: IValue = UndefinedValue.UNDEFINED

  public static enter(name: string): void {
    this.calls.push(new CallInfo(name))
  }

  public static exit(): void {
    this.calls.pop()
  }

  public static getCalls() {
    return this.calls.reverse()
  }

  public static setReturn(value: IValue) {
    this.return = value
  }

  public static getReturn(): IValue {
    const result = this.return
    this.return = UndefinedValue.UNDEFINED
    return result
  }
}
