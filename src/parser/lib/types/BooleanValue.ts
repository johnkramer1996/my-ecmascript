import IECMAScriptLanguageType from '../IValue'
import Value from '../Value'
import { ConstructorValue, FunctionObjectType } from './FunctionValue'
import { ObjectType } from './ObjectValue'
import StringType from './StringValue'
import ECMAScriptLanguageTypes from './Types'

export class BooleanType extends Value<boolean> {
  public static TRUE = new BooleanType(true)
  public static FALSE = new BooleanType(false)

  constructor(value: boolean) {
    super(value, ECMAScriptLanguageTypes.boolean)
  }

  public compareTo(o: IECMAScriptLanguageType): number {
    return this.asString().localeCompare(o.asString())
  }

  public equals(value: IECMAScriptLanguageType): boolean {
    if (this === value) return true
    if (!(value instanceof BooleanType)) return false
    return this.value === value.value
  }

  public asNumber(): number {
    return Number(this.value)
  }

  public asString(): string {
    return String(this.value)
  }

  public toHtml() {
    return 'true'
  }
}

export const BooleanPrototype = new ObjectType(ObjectType.ObjectPrototype, {
  toString: new FunctionObjectType({
    execute() {
      return new StringType('boolean prototype')
    },
    accept(visitor) {},
    toString() {
      return ''
    },
  }),
})
