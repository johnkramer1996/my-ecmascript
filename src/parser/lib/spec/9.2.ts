import { Assert } from './5.2'
import { List } from './6.2'
import { PrivateName } from './spec'

// 9.2 PrivateEnvironment Records

// Table 23: PrivateEnvironment Record Fields
class PrivateEnvironmentRecord {
  '[[OuterPrivateEnvironment]]': PrivateEnvironmentRecord | null
  '[[Names]]': List<PrivateName>

  constructor(referenceRecord: PrivateEnvironmentRecord) {
    this['[[OuterPrivateEnvironment]]'] = referenceRecord['[[OuterPrivateEnvironment]]']
    this['[[Names]]'] = referenceRecord['[[Names]]']
  }
}

// 9.2.1.1 NewPrivateEnvironment ( outerPrivEnv )
export function NewPrivateEnvironment(outerPrivEnv: PrivateEnvironmentRecord | null) {
  // 1. Let names be a new empty List.
  const names = new List<PrivateName>()
  // 2. Return the PrivateEnvironment Record { [[OuterPrivateEnvironment]]: outerPrivEnv, [[Names]]: names }.
  return new PrivateEnvironmentRecord({
    '[[OuterPrivateEnvironment]]': outerPrivEnv,
    '[[Names]]': names,
  })
}

// 9.2.1.2 ResolvePrivateIdentifier ( privEnv, identifier )
export function ResolvePrivateIdentifier(privEnv: PrivateEnvironmentRecord, identifier: string): PrivateName {
  // 1. Let names be privEnv.[[Names]].
  const names = privEnv['[[Names]]']
  // 2. For each Private Name pn of names, do
  for (const pn of names) {
    // a. If pn.[[Description]] is identifier, then
    if (pn['[[Description]]'] === identifier)
      // i. Return pn.
      return pn
  }
  // 3. Let outerPrivEnv be privEnv.[[OuterPrivateEnvironment]].
  const outerPrivEnv = privEnv['[[OuterPrivateEnvironment]]']
  // 4. Assert: outerPrivEnv is not null.
  Assert(!(outerPrivEnv === null))
  // 5. Return ResolvePrivateIdentifier(outerPrivEnv, identifier).
  return ResolvePrivateIdentifier(outerPrivEnv as PrivateEnvironmentRecord, identifier)
}
