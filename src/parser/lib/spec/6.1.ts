import IStatement from 'parser/ast/IStatement'
import { ObjectType } from '../types/ObjectValue'
import IECMAScriptLanguageType from '../IValue'
import UndefinedType from '../types/UndefinedValue'
import { RealmRecord } from './9.3'
import { ClassFieldDefinitionRecord, CompletionRecord, CompletionRecordWithError } from './6.2'
import { List } from './6.2'
import { EnvironmentRecord, PrivateEnvironmentRecord } from './9.1'
import { Params } from 'parser/ast/Params'
import { EMPTY } from 'main'
import { PrivateElement, PrivateName, PropertyDescriptor } from './spec'
import NullType from '../types/NullValue'
import IExpression from 'parser/ast/IExpression'

// 6.1 ECMAScript Language Types

export interface TInternalMethodFunctionObject {
  '[[Call]]': (thisArgument: IECMAScriptLanguageType, argumentsList: List) => CompletionRecordWithError
  '[[Construct]]': (argumentsList: List, newTarget: IFunctionObject) => CompletionRecordWithError<IObject>
}

export interface IObject extends IECMAScriptLanguageType {
  '[[Prototype]]': ObjectType | NullType
  '[[Extensible]]': boolean
  '[[PrivateElements]]': List
  '[[GetPrototypeOf]]'(): ObjectType | NullType
  '[[SetPrototypeOf]]'(V: ObjectType | NullType): CompletionRecordWithError<boolean>
  '[[IsExtensible]]'(): CompletionRecordWithError<boolean>
  '[[PreventExtensions]]'(): CompletionRecordWithError<boolean>
  '[[GetOwnProperty]]'(propertyKey: PropertyKey): CompletionRecordWithError<PropertyDescriptor | undefined>
  '[[DefineOwnProperty]]'(
    propertyKey: PropertyKey,
    propertyDescriptor: PropertyDescriptor,
  ): CompletionRecordWithError<boolean>
  '[[HasProperty]]'(propertyKey: PropertyKey): CompletionRecordWithError<boolean>
  '[[Get]]'(propertyKey: PropertyKey, Receiver?: any): CompletionRecordWithError
  '[[Set]]'(
    propertyKey: PropertyKey,
    value: IECMAScriptLanguageType,
    Receiver?: any,
  ): CompletionRecordWithError<boolean>
  '[[Delete]]'(propertyKey: PropertyKey): CompletionRecordWithError<boolean>
  '[[OwnPropertyKeys]]'(): CompletionRecordWithError<List<IECMAScriptLanguageType>>
}

export interface IFunctionObject extends IObject, TInternalMethodFunctionObject {
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
}
