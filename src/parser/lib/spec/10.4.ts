import IECMAScriptLanguageType from '../IValue'
import { ObjectType } from '../types/ObjectValue'
import { Assert } from './5.2'
import { IFunctionObject, IObject, TInternalMethodFunctionObject } from './6.1'
import { CompletionRecord, CompletionRecordWithError, List } from './6.2'
import { IsConstructor, SameValue } from './7.2'
import { Construct_7_14, MakeBasicObject } from './7.3'

// 10.4 Built-in Exotic Object Internal Methods and Slots

// Table 31: Internal Slots of Bound Function Exotic Objects
export interface IExoticObject extends IObject, TInternalMethodFunctionObject {
  '[[BoundTargetFunction]]': IFunctionObject
  '[[BoundThis]]': IECMAScriptLanguageType
  '[[BoundArguments]]': List
}

// 10.4.1.1 [[Call]] ( thisArgument, argumentsList )
function Call_4_1(this: IFunctionObject, thisArgument: IECMAScriptLanguageType, argumentsList: List) {}

// 10.4.1.2 [[Construct]] ( argumentsList, newTarget )
function Construct_10_4(
  this: IExoticObject,
  argumentsList: List,
  newTarget: IFunctionObject,
): CompletionRecordWithError<IObject> {
  // 1. Let target be F.[[BoundTargetFunction]].
  const target = this['[[BoundTargetFunction]]']
  // 2. Assert: IsConstructor(target) is true.
  Assert(IsConstructor(target) === true)
  // 3. Let boundArgs be F.[[BoundArguments]].
  let boundArgs = this['[[BoundArguments]]']
  // 4. Let args be the list-concatenation of boundArgs and argumentsList.
  const args = boundArgs.concat(argumentsList)
  // 5. If SameValue(F, newTarget) is true, set newTarget to target.
  if (SameValue(this, newTarget)) newTarget = target
  // 6. Return ? Construct(target, args, newTarget).
  return Construct_7_14(target, args, newTarget)
}

// 10.4.1.3 BoundFunctionCreate ( targetFunction, boundThis, boundArgs )
export function BoundFunctionCreate(
  targetFunction: IFunctionObject,
  boundThis: IECMAScriptLanguageType,
  boundArgs: List,
): IExoticObject {
  // 1. Let proto be ? targetFunction.[[GetPrototypeOf]]().
  const proto = targetFunction['[[GetPrototypeOf]]']()
  // 2. Let internalSlotsList be the list-concatenation of « [[Prototype]], [[Extensible]] » and the internal slots listed in Table 31.
  let internalSlotsList = ['[[Prototype]]', '[[Extensible]]']
  // 3. Let obj be MakeBasicObject(internalSlotsList).
  const obj = MakeBasicObject(internalSlotsList) as IExoticObject
  // 4. Set obj.[[Prototype]] to proto.
  obj['[[Prototype]]'] = proto
  // 5. Set obj.[[Call]] as described in 10.4.1.1.
  obj['[[Call]]']
  // 6. If IsConstructor(targetFunction) is true, then
  if (IsConstructor(targetFunction)) {
    // a. Set obj.[[Construct]] as described in 10.4.1.2.
    obj['[[Construct]]'] = Construct_10_4
  }
  // 7. Set obj.[[BoundTargetFunction]] to targetFunction.
  obj['[[BoundTargetFunction]]'] = targetFunction
  // 8. Set obj.[[BoundThis]] to boundThis.
  obj['[[BoundThis]]'] = boundThis
  // 9. Set obj.[[BoundArguments]] to boundArgs.
  obj['[[BoundArguments]]'] = boundArgs
  // 10. Return obj.
  return obj
}
