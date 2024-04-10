import { ObjectType } from '../types/ObjectValue'
import { OrdinaryObjectCreate } from './10.1'
import { CompletionRecord } from './6.2'
import { createRealm, SetDefaultGlobalBindings, SetRealmGlobalObject } from './9.3'
import { ExecutionContext, ExecutionContextStack } from './9.4'

// 9.6 InitializeHostDefinedRealm ( )
export function InitializeHostDefinedRealm() {
  // 1. Let realm be CreateRealm().
  const realm = createRealm()
  // 2. Let newContext be a new execution context.
  const newContext = new ExecutionContext()
  // 3. Set the Function of newContext to null.
  newContext['Function'] = null
  // 4. Set the Realm of newContext to realm.
  newContext['Realm'] = realm
  // 5. Set the ScriptOrModule of newContext to null.
  newContext['ScriptOrModule'] = null
  // 6. Push newContext onto the execution context stack; newContext is now the running execution context.
  ExecutionContextStack.push(newContext)
  // 7. If the host requires use of an exotic object to serve as realm's global object, let global be such an object created in a host-defined manner. Otherwise, let global be undefined, indicating that an ordinary object should be created as the global object.
  const global = OrdinaryObjectCreate(ObjectType.ObjectPrototype, [])
  // 8. If the host requires that the this binding in realm's global scope return an object other than the global object, let thisValue be such an object created in a host-defined manner. Otherwise, let thisValue be undefined, indicating that realm's global this binding should be the global object.
  const thisValue = undefined
  // 9. Perform SetRealmGlobalObject(realm, global, thisValue).
  SetRealmGlobalObject(realm, global, thisValue)
  // 10. Let globalObj be ? SetDefaultGlobalBindings(realm).
  const globalObj = SetDefaultGlobalBindings(realm)
  // 11. Create any host-defined global object properties on globalObj.
  // 12. Return UNUSED.
  return CompletionRecord.NormalCompletion('UNUSED')
}
