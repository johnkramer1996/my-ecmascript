import { NumberSameValue } from './spec'

import IECMAScriptLanguageType from '../IValue'
import { BooleanType } from '../types/BooleanValue'
import { FunctionObjectType, ConstructorValue } from '../types/FunctionValue'
import { IFunctionObject } from './6.1'
import NullType from '../types/NullValue'
import NumberType from '../types/NumberValue'
import { ObjectType } from '../types/ObjectValue'
import StringType from '../types/StringValue'
import UndefinedType from '../types/UndefinedValue'
import { Assert } from './5.2'

// 7.2 Testing and Comparison Operations

// 7.2.7 IsPropertyKey ( argument )
export function IsPropertyKey(argument: any): boolean {
  if (typeof argument === 'string') return true
  if (typeof argument === 'symbol') return true
  return false
}
export function IsExtensible(O: ObjectType) {
  return O['[[IsExtensible]]']()
}
// 7.2.10 SameValue ( x, y )
export function SameValue(a: IECMAScriptLanguageType, b: IECMAScriptLanguageType) {
  if (!(a.type() === b.type())) return false
  if (a instanceof NumberType && b instanceof NumberType) return NumberSameValue(a, b)
  return SameValueNonNumber(a, b)
}
// 7.2.12 SameValueNonNumber ( x, y )
function SameValueNonNumber(x: IECMAScriptLanguageType, y: IECMAScriptLanguageType) {
  // 1. Assert: Type(x) is Type(y).
  Assert(x.type() === x.type())
  // 2. If x is either null or undefined, return true.
  if (x instanceof UndefinedType || x instanceof NullType) return true
  // 3. If x is a BigInt, then
  // a. Return BigInt::equal(x, y).
  // 4. If x is a String, then
  if (x instanceof StringType) {
    // a. If x and y have the same length and the same code units in the same positions, return true; otherwise, return false.
    if (x.raw() === y.raw()) return true
  }
  // 5. If x is a Boolean, then
  if (x instanceof BooleanType) {
    // a. If x and y are both true or both false, return true; otherwise, return false.
    return x.raw() === y.raw()
  }
  // 6. NOTE: All other ECMAScript language values are compared by identity.
  // 7. If x is y, return true; otherwise, return false.
  return x === y
}
// 7.2.3 IsCallable ( argument )
export function IsCallable(argument: any): argument is IFunctionObject {
  // 1. If argument is not an Object, return false.
  if (!(argument instanceof ObjectType)) return false
  // 2. If argument has a [[Call]] internal method, return true.
  if (!((argument as FunctionObjectType)['[[Call]]'] === undefined)) return true
  // 3. Return false.
  return false
}
// 7.2.4 IsConstructor ( argument )
export function IsConstructor(argument: any): argument is IFunctionObject {
  // 1. If argument is not an Object, return false.
  if (!(argument instanceof ObjectType)) return false
  // 2. If argument has a [[Construct]] internal method, return true.
  if (!((argument as FunctionObjectType)['[[Construct]]'] === undefined)) return true
  // 3. Return false.
  return false
}
// 7.2.4 IsConstructor ( argument )
// export function IsConstructor(argument: any): argument is IFunctionObject {
//   // 1. If argument is not an Object, return false.
//   if (!(argument instanceof ObjectType)) return false
//   // 2. If argument has a [[Construct]] internal method, return true.
//   if (!((argument as FunctionObjectType)['[[Construct]]'] === undefined)) return true
//   // 3. Return false.
//   return false
// }
