import IECMAScriptLanguageType from '../IValue'
import UndefinedType from '../types/UndefinedValue'
import NumberType from '../types/NumberValue'
import { FunctionObjectType } from '../types/FunctionValue'
import StringType from '../types/StringValue'
import SymbolType from '../types/SymbolValue'
import { IFunctionObject } from './6.1'

class DataProperty {}
class AccessorProperty {}

// configurable?: boolean;
// enumerable?: boolean;
// value?: any;
// writable?: boolean;
// get?(): any;
// set?(v: any): void;

export class PropertyDescriptor {
  '[[Value]]': IECMAScriptLanguageType = UndefinedType.UNDEFINED
  '[[Writable]]': boolean = false
  '[[Get]]': FunctionObjectType | UndefinedType = UndefinedType.UNDEFINED
  '[[Set]]': FunctionObjectType | UndefinedType = UndefinedType.UNDEFINED
  '[[Enumerable]]': boolean = false
  '[[Configurable]]': boolean = false

  constructor(args: Partial<PropertyDescriptor> = {}) {
    this['[[Value]]'] = args['[[Value]]'] || this['[[Value]]']
    this['[[Writable]]'] = args['[[Writable]]'] || this['[[Writable]]']
    this['[[Get]]'] = args['[[Get]]'] || this['[[Get]]']
    this['[[Set]]'] = args['[[Set]]'] || this['[[Set]]']
    this['[[Enumerable]]'] = args['[[Enumerable]]'] || this['[[Enumerable]]']
    this['[[Configurable]]'] = args['[[Configurable]]'] || this['[[Configurable]]']
  }
}

// 6.1.6.1.14 Number::sameValue ( x, y )
export function NumberSameValue(x: NumberType, y: NumberType) {
  if (x === NumberType.NaN && y === NumberType.NaN) return true
  if (x.raw() === +0 && y.raw() === -0) return false
  if (x.raw() === -0 && y.raw() === +0) return false
  if (x === y) return true
  return false
}

export class PrivateElement {
  '[[Key]]': PrivateName
  '[[Kind]]': 'FIELD' | 'METHOD' | 'ACCESSOR'
  '[[Value]]': IECMAScriptLanguageType
  '[[Get]]'?: IFunctionObject | undefined
  '[[Set]]'?: IFunctionObject | undefined

  constructor(args: PrivateElement) {
    this['[[Key]]'] = args['[[Key]]']
    this['[[Kind]]'] = args['[[Kind]]']
    this['[[Value]]'] = args['[[Value]]']
    this['[[Get]]'] = args['[[Get]]']
    this['[[Set]]'] = args['[[Set]]']
  }
}
export class PrivateName {
  '[[Description]]': string
}
