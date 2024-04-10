import IECMAScriptLanguageType from './IValue'
import UndefinedType from './types/UndefinedValue'

export class CallInfo {
  // constructor(public name: string, public func: Function) {}
  constructor(public name: string) {}

  public toString(): string {
    return `${this.name}`
  }
}

export class CallStack {
  private static calls: CallInfo[] = []
  private static return: IECMAScriptLanguageType = UndefinedType.UNDEFINED

  public static enter(name: string): void {
    this.calls.push(new CallInfo(name))
  }

  public static exit(): void {
    this.calls.pop()
  }

  public static getCalls() {
    return this.calls.reverse()
  }

  public static setReturn(value: IECMAScriptLanguageType) {
    this.return = value
  }

  public static getReturn(): IECMAScriptLanguageType {
    const result = this.return
    this.return = UndefinedType.UNDEFINED
    return result
  }
}
