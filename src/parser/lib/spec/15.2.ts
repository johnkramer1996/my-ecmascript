import IECMAScriptLanguageType from '../IValue'
import { CallStack } from '../CallStack'
import { CompletionRecord } from './6.2'
import { FunctionObjectType } from '../types/FunctionValue'
import { IFunctionObject } from './6.1'
import { FunctionDeclarationInstantiation, MakeConstructor, SetFunctionName } from './10.2'
import { isIExpression } from 'parser/ast/IExpression'
import { EnvironmentRecord, PrivateEnvironmentRecord } from './9.1'
import { FunctionDeclarationStatement } from 'parser/ast/FunctionDeclarationStatement'
import { OrdinaryFunctionCreate } from './10.3'
import { ObjectType } from '../types/ObjectValue'

// 15.2.3 Runtime Semantics: EvaluateFunctionBody
export function EvaluateFunctionBody(
  functionObject: IFunctionObject,
  argumentsList: IECMAScriptLanguageType[],
): CompletionRecord<IECMAScriptLanguageType> {
  FunctionDeclarationInstantiation(functionObject, argumentsList)

  if (isIExpression(functionObject['[[ECMAScriptCode]]'])) functionObject['[[ECMAScriptCode]]'].eval()
  else functionObject['[[ECMAScriptCode]]'].execute()

  const result = CallStack.getReturn()
  return CompletionRecord.NormalCompletion(result)
}

// 15.2.4 Runtime Semantics: InstantiateOrdinaryFunctionObject
function InstantiateOrdinaryFunctionObject(
  functionDecl: FunctionDeclarationStatement,
  env: EnvironmentRecord,
  privateEnv: PrivateEnvironmentRecord | null,
): IFunctionObject {
  // 1. Let name be StringValue of BindingIdentifier.
  const name = functionDecl.bindingIdentifier.toString()
  // 2. Let sourceText be the source text matched by FunctionDeclaration.
  const sourceText = functionDecl.functionBody.toString()
  // 3. Let F be OrdinaryFunctionCreate(%Function.prototype%, sourceText, FormalParameters, FunctionBody, NON-LEXICAL-THIS, env, privateEnv).
  const F = OrdinaryFunctionCreate(
    ObjectType.FunctionPrototype,
    sourceText,
    functionDecl.formalParameters,
    functionDecl.functionBody,
    'NON-LEXICAL-THIS',
    env,
    privateEnv,
  )
  // 4. Perform SetFunctionName(F, name).
  SetFunctionName(F, name)
  // 5. Perform MakeConstructor(F).
  MakeConstructor(F)
  // 6. Return F.
  return F
}
