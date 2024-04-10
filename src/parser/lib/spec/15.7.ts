import {
  ClassDeclarationStatement,
  ClassElement,
  FieldDefinition,
  MethodDefinition,
} from 'parser/ast/ClassDeclarationStatement'
import { IFunctionObject, IObject } from './6.1'
import { OrdinaryFunctionCreate } from './10.3'
import { ExecutionContextStack } from './9.4'
import { Params } from 'parser/ast/Params'
import { ObjectType } from '../types/ObjectValue'
import { MakeMethod } from './10.2'
import { ClassFieldDefinitionRecord } from './6.2'
import { MethodDefinitionEvaluation } from './15.4'
import { EMPTY } from 'main'

// 15.7.10 Runtime Semantics: ClassFieldDefinitionEvaluation
function ClassFieldDefinitionEvaluation(classElement: ClassElement, homeObject: IObject) {
  let initializer: IFunctionObject | typeof EMPTY = EMPTY
  // 1. Let name be ? Evaluation of ClassElementName.
  const name = classElement.classElementName.eval().asString()
  // 2. If Initializer is present, then
  if (classElement.initializer) {
    // a. Let formalParameterList be an instance of the production FormalParameters : [empty] .
    const formalParameterList = new Params()
    // b. Let env be the LexicalEnvironment of the running execution context.
    const env = ExecutionContextStack.runningExecutionContext().LexicalEnvironment
    // c. Let privateEnv be the running execution context's PrivateEnvironment.
    const privateEnv = ExecutionContextStack.runningExecutionContext().PrivateEnvironment
    // d. Let sourceText be the empty sequence of Unicode code points.
    const sourceText = ''
    // e. Let initializer be OrdinaryFunctionCreate(%Function.prototype%, sourceText, formalParameterList, Initializer, NON-LEXICAL-THIS, env, privateEnv).
    initializer = OrdinaryFunctionCreate(
      ObjectType.FunctionPrototype,
      sourceText,
      formalParameterList,
      classElement.initializer,
      'NON-LEXICAL-THIS',
      env,
      privateEnv,
    )
    // f. Perform MakeMethod(initializer, homeObject).
    MakeMethod(initializer, homeObject)
    // g. Set initializer.[[ClassFieldInitializerName]] to name.
    initializer['[[ClassFieldInitializerName]]'] = name
  }
  // 3. Else,
  else {
    // a. Let initializer be EMPTY.
    initializer = EMPTY
  }
  // 4. Return the ClassFieldDefinition Record { [[Name]]: name, [[Initializer]]: initializer }.
  return new ClassFieldDefinitionRecord({ '[[Name]]': name, '[[Initializer]]': initializer })
}
// 15.7.13 Runtime Semantics: ClassElementEvaluation
function ClassElementEvaluation(classElement: ClassElement, homeObject: IObject) {
  // 1. Return ? ClassFieldDefinitionEvaluation of FieldDefinition with argument object.
  if (classElement instanceof FieldDefinition) return ClassFieldDefinitionEvaluation(classElement, homeObject)
  // 2. Return ? MethodDefinitionEvaluation of MethodDefinition with arguments object and false.
  if (classElement instanceof MethodDefinition) return MethodDefinitionEvaluation(classElement, homeObject, false)
  // 3. Return UNUSED.
  return 'UNUSED'
}

// 15.7.14 Runtime Semantics: ClassDefinitionEvaluation
function ClassDefinitionEvaluation(classBinding: string | undefined, className: string) {}

// 15.7.15 Runtime Semantics: BindingClassDeclarationEvaluation
export function BindingClassDeclarationEvaluation(classDeclr: ClassDeclarationStatement) {
  // 1. Let className be StringValue of BindingIdentifier.
  const className = classDeclr.bindingIdentifier.name
  // 2. Let value be ? ClassDefinitionEvaluation of ClassTail with arguments className and className.
  const value = ClassDefinitionEvaluation(className, className)
  // 3. Set value.[[SourceText]] to the source text matched by ClassDeclaration.
  // 4. Let env be the running execution context's LexicalEnvironment.
  // 5. Perform ? InitializeBoundName(className, value, env).
  // 6. Return value.
}

// 15.7.16 Runtime Semantics: Evaluation
export function Evaluation(classDeclaration: ClassDeclarationStatement) {
  // 1. Perform ? BindingClassDeclarationEvaluation of this ClassDeclaration.
  BindingClassDeclarationEvaluation(classDeclaration)
  // 2. Return EMPTY.
  // return 'EMPTY'
}
