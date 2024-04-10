import { ObjectType } from './ObjectValue'
import IECMAScriptLanguageType from '../IValue'
import { ClassFieldDefinitionRecord, CompletionRecordWithError, List } from '../spec/6.2'
import { EnvironmentRecord, PrivateEnvironmentRecord } from '../spec/9.1'
import { Params } from 'parser/ast/Params'
import IStatement from 'parser/ast/IStatement'
import IExpression from 'parser/ast/IExpression'
import { RealmRecord } from '../spec/9.3'
import { IFunctionObject, IObject } from '../spec/6.1'
import { PrivateElement, PrivateName } from '../spec/spec'
import { EMPTY } from 'main'

export class FunctionObjectType extends ObjectType implements IFunctionObject {
  '[[Call]]': any //TODO:
  '[[Construct]]': any //TODO:
  '[[Environment]]': EnvironmentRecord
  '[[PrivateEnvironment]]': PrivateEnvironmentRecord | null
  '[[FormalParameters]]': Params
  '[[ECMAScriptCode]]': IStatement | IExpression
  '[[ConstructorKind]]': 'BASE' | 'DERIVED'
  '[[Realm]]': RealmRecord
  '[[ScriptOrModule]]': any
  '[[ThisMode]]': 'LEXICAL' | 'STRICT' | 'GLOBAL'
  '[[Strict]]': boolean
  '[[HomeObject]]': IObject | undefined // DefineMethodProperty(proto, "constructor", F, false). prototype
  '[[SourceText]]': string
  '[[Fields]]': List<ClassFieldDefinitionRecord>
  '[[PrivateMethods]]': PrivateElement[]
  '[[ClassFieldInitializerName]]': string | symbol | PrivateName | typeof EMPTY
  '[[IsClassConstructor]]': boolean

  constructor(__proto__: IECMAScriptLanguageType | null = ObjectType.FunctionPrototype) {
    super(__proto__)
  }
}

export class ConstructorValue extends FunctionObjectType implements IECMAScriptLanguageType {
  public '[[construct]]'(this_: ObjectType, values: IECMAScriptLanguageType[]): CompletionRecordWithError {
    return this['[[Call]]'](this, values)
  }
}
