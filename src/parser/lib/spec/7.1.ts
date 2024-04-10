import { CompletionRecord, CompletionRecordWithError } from './6.2'
import IECMAScriptLanguageType from '../IValue'
import { BooleanType } from '../types/BooleanValue'
import NullType from '../types/NullValue'
import NumberType from '../types/NumberValue'
import { ObjectType } from '../types/ObjectValue'
import StringType from '../types/StringValue'
import SymbolType from '../types/SymbolValue'
import UndefinedType from '../types/UndefinedValue'

// 7.1.2 ToBoolean ( argument )
export function ToBoolean(argument: IECMAScriptLanguageType): BooleanType {
  // 1. If argument is a Boolean, return argument.
  if (argument instanceof BooleanType) return argument
  // 2. If argument is one of undefined, null, +0𝔽, -0𝔽, NaN, 0ℤ, or the empty String, return false.
  if (argument instanceof NullType) return BooleanType.FALSE
  if (argument instanceof UndefinedType) return BooleanType.FALSE
  if (argument instanceof NumberType && argument.asNumber() === 0) return BooleanType.FALSE
  if (argument instanceof NumberType && argument === NumberType.NaN) return BooleanType.FALSE
  if (argument instanceof NumberType && argument.asNumber() === -0) return BooleanType.FALSE
  if (argument instanceof StringType && argument.asString() === '') return BooleanType.FALSE
  // 3. NOTE: This step is replaced in section B.3.6.1.
  // 4. Return true.
  return BooleanType.TRUE
}
// 7.1.18 ToObject ( argument )
export function ToObject(argument: IECMAScriptLanguageType): CompletionRecordWithError<ObjectType> {
  if (argument instanceof UndefinedType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  if (argument instanceof NullType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  // if (argument instanceof BooleanType) BooleanConstructor_.raw.call(argument)
  if (argument instanceof NumberType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  if (argument instanceof StringType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  if (argument instanceof SymbolType) return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
  if (argument instanceof ObjectType) return CompletionRecord.NormalCompletion(argument)
  return CompletionRecord.ThrowCompletion(new TypeError('toObject'))
}
