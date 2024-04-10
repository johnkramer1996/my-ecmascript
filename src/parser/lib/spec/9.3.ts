import { AgentSignifier } from './9.7'
import { ObjectType } from '../types/ObjectValue'
import UndefinedType from '../types/UndefinedValue'
import { Record, CompletionRecord, getNC } from './6.2'
import { GlobalEnvironmentRecord, NewGlobalEnvironment } from './9.1'
import { OrdinaryObjectCreate } from './10.1'
import { FunctionObjectType } from '../types/FunctionValue'
import { ToObject } from './7.1'
import { Assert } from './5.2'
import { IObject } from './6.1'

// 9.3 Realms

// Table 24: Realm Record Fields
export class RealmRecord {
  '[[AgentSignifier]]': any
  '[[Intrinsics]]': Record
  '[[GlobalObject]]': IObject | undefined
  '[[GlobalEnv]]': GlobalEnvironmentRecord | undefined
  '[[TemplateMap]]': any[]
  '[[LoadedModules]]': any
  '[[HostDefined]]': any = undefined
}

// 9.3.1 CreateRealm ( )
export function createRealm(): RealmRecord {
  // 1. Let realmRec be a new Realm Record.
  const realmRec = new RealmRecord()
  // 2. Perform CreateIntrinsics(realmRec).
  CreateIntrinsics(realmRec)
  // 3. Set realmRec.[[AgentSignifier]] to AgentSignifier().
  realmRec['[[AgentSignifier]]'] = AgentSignifier()
  // 4. Set realmRec.[[GlobalObject]] to undefined.
  realmRec['[[GlobalObject]]'] = undefined
  // 5. Set realmRec.[[GlobalEnv]] to undefined.
  realmRec['[[GlobalEnv]]'] = undefined
  // 6. Set realmRec.[[TemplateMap]] to a new empty List.
  realmRec['[[TemplateMap]]'] = []
  // 7. Return realmRec.
  return realmRec
}

// 9.3.2 CreateIntrinsics ( realmRec )
function CreateIntrinsics(realmRec: RealmRecord): 'UNUSED' {
  // 1. Set realmRec.[[Intrinsics]] to a new Record.
  const record = (realmRec['[[Intrinsics]]'] = new Record())
  // 2. Set fields of realmRec.[[Intrinsics]] with the values listed in Table 6. The field names are the names listed in column one of the table. The value of each field is a new object value fully and recursively populated with property values as defined by the specification of each object in clauses 19 through 28. All object property values are newly created object values. All values that are built-in function objects are created by performing CreateBuiltinFunction(steps, length, name, slots, realmRec, prototype) where steps is the definition of that function provided by this specification, name is the initial value of the function's "name" property, length is the initial value of the function's "length" property, slots is a list of the names, if any, of the function's specified internal slots, and prototype is the specified value of the function's [[Prototype]] internal slot. The creation of the intrinsics and their properties must be ordered to avoid any dependencies upon objects that have not yet been created.
  record['%Array%'] = UndefinedType.UNDEFINED
  record['%Function%'] = UndefinedType.UNDEFINED
  record['%Number%'] = UndefinedType.UNDEFINED
  record['%Object%'] = record['%String%'] = UndefinedType.UNDEFINED
  // 3. Perform AddRestrictedFunctionProperties(realmRec.[[Intrinsics]].[[%Function.prototype%]], realmRec).
  // 4. Return UNUSED.
  return 'UNUSED'
}
// 9.3.3 SetRealmGlobalObject ( realmRec, globalObj, thisValue )
export function SetRealmGlobalObject(
  realmRec: RealmRecord,
  globalObj: IObject | undefined,
  thisValue: IObject | undefined,
): 'UNUSED' {
  // 1. If globalObj is undefined, then
  if (globalObj === undefined) {
    // a. Let intrinsics be realmRec.[[Intrinsics]].
    const intrinsics = realmRec['[[Intrinsics]]']
    // b. Set globalObj to OrdinaryObjectCreate(intrinsics.[[%Object.prototype%]]).
    globalObj = OrdinaryObjectCreate(getNC(ToObject(intrinsics['[[%Object%]]']))['[[Value]]'], [])
  }
  // 2. Assert: globalObj is an Object.
  Assert(globalObj instanceof ObjectType, 'globalObj instanceof ObjectType')
  // 3. If thisValue is undefined, set thisValue to globalObj.
  if (thisValue === undefined) thisValue = globalObj
  // 4. Set realmRec.[[GlobalObject]] to globalObj.
  realmRec['[[GlobalObject]]'] = globalObj
  // 5. Let newGlobalEnv be NewGlobalEnvironment(globalObj, thisValue).
  const newGlobalEnv = NewGlobalEnvironment(globalObj, thisValue)
  // 6. Set realmRec.[[GlobalEnv]] to newGlobalEnv.
  realmRec['[[GlobalEnv]]'] = newGlobalEnv
  // 7. Return UNUSED.
  return 'UNUSED'
}

// 9.3.4 SetDefaultGlobalBindings ( realmRec )
export function SetDefaultGlobalBindings(realmRec: RealmRecord) {
  // 1. Let global be realmRec.[[GlobalObject]].
  const global = realmRec['[[GlobalObject]]']
  // 2. For each property of the Global Object specified in clause 19, do
  // a. Let name be the String value of the property name.
  // b. Let desc be the fully populated data Property Descriptor for the property, containing the specified attributes for the property. For properties listed in 19.2, 19.3, or 19.4 the value of the [[Value]] attribute is the corresponding intrinsic object from realmRec.
  // c. Perform ? DefinePropertyOrThrow(global, name, desc).
  // 3. Return global.
  return global
}
