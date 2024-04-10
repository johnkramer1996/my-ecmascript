import { CompletionRecord } from './6.2'

// 5.2 Algorithm Conventions
export function Assert(expr: boolean, err?: Error | string) {
  if (expr) return true

  throw typeof err === 'string' ? new Error(err) : err ?? new Error('error')
}
// 5.2.3.1 Completion ( completionRecord )
export function Completion<T>(completionRecord: T): T {
  Assert(completionRecord instanceof CompletionRecord, 'Completion ' + completionRecord)
  return completionRecord as T
}
// 5.2.3.3 ReturnIfAbrupt
export function ReturnIfAbrupt(argument: unknown) {
  // 1. Assert: argument is a Completion Record.
  Assert(argument instanceof CompletionRecord)
  const arg = argument as CompletionRecord<any, 'NORMAL' | 'THROW'>
  // 2. If argument is an abrupt completion, return Completion(argument).
  if (arg['[[Type]]'] === 'THROW') return Completion(arg)
  // 3. Else, set argument to argument.[[Value]].
  arg['[[Value]]'] = arg
}
