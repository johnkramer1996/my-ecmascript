import { MethodDefinition } from 'parser/ast/ClassDeclarationStatement'
import { ObjectType } from '../types/ObjectValue'
import { IFunctionObject, IObject } from './6.1'
import { DefineMethodProperty, MakeMethod, SetFunctionName } from './10.2'
import { ExecutionContextStack } from './9.4'
import { OrdinaryFunctionCreate } from './10.3'

// 15.4.4 Runtime Semantics: DefineMethod
function DefineMethod(methodDefinition: MethodDefinition, object: IObject, functionPrototype?: ObjectType) {
  // 1. Let propKey be ? Evaluation of ClassElementName.
  const propKey = methodDefinition.classElementName.eval().asString()
  // 2. Let env be the running execution context's LexicalEnvironment.
  const env = ExecutionContextStack.runningExecutionContext().LexicalEnvironment
  // 3. Let privateEnv be the running execution context's PrivateEnvironment.
  const privateEnv = ExecutionContextStack.runningExecutionContext().PrivateEnvironment
  const prototype = (() => {
    // 4. If functionPrototype is present, then
    if (functionPrototype)
      // a. Let prototype be functionPrototype.
      return functionPrototype
    // 5. Else,
    // a. Let prototype be %Function.prototype%.
    else return ObjectType.FunctionPrototype
  })()

  // 6. Let sourceText be the source text matched by MethodDefinition.
  const sourceText = ''
  // 7. Let closure be OrdinaryFunctionCreate(prototype, sourceText, UniqueFormalParameters, FunctionBody, NON-LEXICAL-THIS, env, privateEnv).
  const closure = OrdinaryFunctionCreate(
    prototype,
    sourceText,
    methodDefinition.uniqueFormalParameters,
    methodDefinition.functionBody,
    'NON-LEXICAL-THIS',
    env,
    privateEnv,
  )
  // 8. Perform MakeMethod(closure, object).
  MakeMethod(closure, object)
  // 9. Return the Record { [[Key]]: propKey, [[Closure]]: closure }.
  return { '[[Key]]': propKey, '[[Closure]]': closure }
}

// 15.4.5 Runtime Semantics: MethodDefinitionEvaluation
export function MethodDefinitionEvaluation(methodDefinition: MethodDefinition, object: IObject, enumerable: boolean) {
  // 1. Let methodDef be ? DefineMethod of MethodDefinition with argument object.
  const methodDef = DefineMethod(methodDefinition, object)
  // 2. Perform SetFunctionName(methodDef.[[Closure]], methodDef.[[Key]]).
  SetFunctionName(methodDef['[[Closure]]'], methodDef['[[Key]]'])
  // 3. Return ? DefineMethodProperty(object, methodDef.[[Key]], methodDef.[[Closure]], enumerable).
  return DefineMethodProperty(object, methodDef['[[Key]]'], methodDef['[[Closure]]'], enumerable)
}
