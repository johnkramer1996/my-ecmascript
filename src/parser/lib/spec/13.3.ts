import IECMAScriptLanguageType from '../IValue'
import { ObjectType } from '../types/ObjectValue'
import UndefinedType from '../types/UndefinedValue'
import { Assert } from './5.2'
import { GetThisValue, GetValue, IsPropertyReference, ReferenceRecord, getNC } from './6.2'
import { IsCallable } from './7.2'
import { Call_7_13 } from './7.3'
import { EnvironmentRecord } from './9.1'
import IExpression from 'parser/ast/IExpression'
import { IsInTailPosition, PrepareForTailCall } from './15.10'

// 13.3.6 Function Calls

// 13.3.6.1 Runtime Semantics: Evaluation
export function Evalution(CallExpression: IExpression, args: IExpression[]) {
  //   1. Let ref be ? Evaluation of CallExpression.
  const ref = CallExpression.eval()
  // 2. Let func be ? GetValue(ref).
  const func = getNC(GetValue(ref))['[[Value]]']
  // 3. Let thisCall be this CallExpression.
  const thisCall = CallExpression
  // 4. Let tailCall be IsInTailPosition(thisCall).
  const tailCall = IsInTailPosition(thisCall)
  // 5. Return ? EvaluateCall(func, ref, Arguments, tailCall).
  return EvaluateCall(func, ref, args, tailCall)
}

// 13.3.6.2 EvaluateCall ( func, ref, arguments, tailPosition )
export function EvaluateCall(
  func: IECMAScriptLanguageType,
  ref: IECMAScriptLanguageType | ReferenceRecord,
  args: IExpression[],
  tailPosition: boolean,
) {
  let thisValue = undefined
  // 1. If ref is a Reference Record, then
  if (ref instanceof ReferenceRecord) {
    // a. If IsPropertyReference(ref) is true, then
    if (IsPropertyReference(ref)) {
      // i. Let thisValue be GetThisValue(ref).
      thisValue = GetThisValue(ref)
    } // b. Else,
    else {
      // i. Let refEnv be ref.[[Base]].
      const refEnv = ref['[[Base]]']
      // ii. Assert: refEnv is an Environment Record.
      Assert(refEnv instanceof EnvironmentRecord)
      // iii. Let thisValue be refEnv.WithBaseObject().
      thisValue = (refEnv as EnvironmentRecord).WithBaseObject()
    }
  }
  // 2. Else,
  else {
    // a. Let thisValue be undefined.
    thisValue = UndefinedType.UNDEFINED
  }
  // 3. Let argList be ? ArgumentListEvaluation of arguments.
  const argList: [] = [] //TODO: ArgumentListEvaluation(arguments)

  // 4. If func is not an Object, throw a TypeError exception.
  if (!(func instanceof ObjectType)) throw TypeError('!(func instanceof ObjectType)')
  // 5. If IsCallable(func) is false, throw a TypeError exception.
  if (IsCallable(func) === false) throw TypeError('IsCallable(func) === false')
  //  TODO: 6. If tailPosition is true, perform PrepareForTailCall().
  if (tailPosition === true) PrepareForTailCall()
  // 7. Return ? Call(func, thisValue, argList).
  // TODO: thisValue as IECMAScriptLanguageType,
  return Call_7_13(func, thisValue as IECMAScriptLanguageType, argList)
}
