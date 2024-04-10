// 15.10 Tail Position Calls

import IExpression from 'parser/ast/IExpression'
import { IsStrict } from './11.2'

class GeneratorBody {}
class AsyncFunctionBody {}
class AsyncGeneratorBody {}
class AsyncConciseBody {}

// 15.10.1 Static Semantics: IsInTailPosition ( call )
export function IsInTailPosition(call: IExpression): boolean {
  // 1. If IsStrict(call) is false, return false.
  if (IsStrict(call) === false) return false
  // 2. If call is not contained within a FunctionBody, a ConciseBody, or an AsyncConciseBody, return false.
  if (!('FunctionBody' in call || 'ConciseBody' in call || 'AsyncConciseBody' in call)) return false
  // 3. Let body be the FunctionBody, ConciseBody, or AsyncConciseBody that most closely contains call.
  // @ts-ignore
  const body = call.FunctionBody || call.ConciseBody || call.AsyncConciseBody
  // 4. If body is the FunctionBody of a GeneratorBody, return false.
  if (body instanceof GeneratorBody) return false
  // 5. If body is the FunctionBody of an AsyncFunctionBody, return false.
  if (body instanceof AsyncFunctionBody) return false
  // 6. If body is the FunctionBody of an AsyncGeneratorBody, return false.
  if (body instanceof AsyncGeneratorBody) return false
  // 7. If body is an AsyncConciseBody, return false.
  if (body instanceof AsyncConciseBody) return false
  // 8. Return the result of HasCallInTailPosition of body with argument call.
  return HasCallInTailPosition(call)
}

// 15.10.2 Static Semantics: HasCallInTailPosition
function HasCallInTailPosition(call: IExpression) {
  return false
}

// 15.10.3 PrepareForTailCall ( )
export function PrepareForTailCall() {
  // 1. Assert: The current execution context will not subsequently be used for the evaluation of any ECMAScript code or built-in functions. The invocation of Call subsequent to the invocation of this abstract operation will create and push a new execution context before performing any such evaluation.
  // 2. Discard all resources associated with the current execution context.
  // 3. Return UNUSED.
  return 'UNUSED'
}
