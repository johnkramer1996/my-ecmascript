// import IValue from 'parser/lib/IValue'
// import IStatement from './IStatement'
// import IVisitor from './IVisitor'
// import Types from 'parser/lib/types/Types'
// import Function from 'parser/lib/Function'
// import ObjectValue from 'parser/lib/types/ObjectValue'
// import CallStack from 'parser/lib/CallStack'
// import FunctionValue from 'parser/lib/types/FunctionValue'
// import { Identifier } from './Identifier'
// import IExpression from './IExpression'
// import UndefinedValue from 'parser/lib/types/UndefinedValue'
// import { Variables } from 'parser/lib/Variables'
// import FunctionExpression from './FunctionExpression'

// export class MethodDefinition {
//   constructor(public key: string, public value: FunctionExpression, public _static = false) {}
// }

// export class PropertyDefinition {
//   constructor(public key: string, public value: IExpression | null) {}
// }

// class ClassField {
//   constructor(public name: string, public value: IValue) {}
// }

// class ClassMethod implements Function {
//   private classInstance!: ClassInstance

//   constructor(private name: string, private func: FunctionValue) {}

//   public getName(): string {
//     return this.name
//   }

//   public setClassInstance(classInstance: ClassInstance): void {
//     this.classInstance = classInstance
//   }

//   public call(...args: IValue[]): IValue {
//     // Variables.push();
//     Variables.define('this', this.classInstance.getThis())

//     try {
//       const func = this.func.raw()
//       const result = func.call(...args)
//       return result
//     } finally {
//       // ScopeHandler.pop();
//     }
//   }

//   public getArgsCount() {
//     // return this.func.getArgsCount();
//   }

//   public equals(obj: any): boolean {
//     throw new Error('Method `ClassMethod.equals` not implemented.')
//   }

//   public toString(): string {
//     return 'ClassMethod[' + 'name=' + this.name + ', ' + 'func=' + this.func + ']'
//   }
// }

// export class ClassInstance implements IValue {
//   private thisMap = new ObjectValue()
//   private _constructor: ClassMethod | null = null
//   private toString: ClassMethod | null = null
//   private isInstantiated: boolean = false

//   constructor(private className: string) {}

//   public getThis(): ObjectValue {
//     return this.thisMap
//   }

//   public addField(f: ClassField) {
//     this.thisMap.set(f.name, f.value || f.value)
//   }

//   public addMethod(method: ClassMethod) {
//     method.setClassInstance(this)
//     const name = method.getName()
//     this.thisMap.set(name, new FunctionValue(method))
//     if (name === 'constructor') {
//       this._constructor = method
//     } else if (name === 'toString') {
//       this.toString = method
//     }
//   }

//   public callConstructor(args: IValue[]): ClassInstance {
//     if (this.isInstantiated) {
//       throw new Error(`Class ${this.className} was already instantiated`)
//     }
//     if (this._constructor) {
//       CallStack.enter('class ' + this.className)
//       this._constructor.call(...args)
//       CallStack.exit()
//     }
//     this.isInstantiated = true
//     return this
//   }

//   public raw(): number {
//     throw new Error('Method `ClassInstance.raw` not implemented.')
//   }

//   public asNumber(): number {
//     throw new Error('Method `ClassInstance.asNumber` not implemented.')
//   }

//   public asString(): string {
//     return this?.toString?.call().asString() ?? this.thisMap.asString()
//   }

//   public type(): Types {
//     throw new Error('Method `ClassInstance.type` not implemented.')
//   }

//   public equals(value: IValue): boolean {
//     throw new Error('Method `ClassInstance.equals` not implemented.')
//   }

//   public compareTo(o: IValue): number {
//     throw new Error('Method `ClassInstance.compareTo` not implemented.')
//   }
// }

// export class ClassDeclaration implements Function {
//   constructor(public name: string, public classFields: ClassField[] = [], public classMethods: ClassMethod[] = []) {}
//   public call(...args: IValue[]): IValue {
//     return UndefinedValue.UNDEFINED
//   }

//   public newInstance(args: IValue[]): ClassInstance {
//     const instance = new ClassInstance(this.name)

//     for (const f of this.classFields) instance.addField(f)
//     for (const m of this.classMethods) instance.addMethod(m)

//     return instance.callConstructor(args)
//   }

//   public toString() {
//     return 'ClassDeclaration ' + this.name
//   }
// }

// export class ClassDeclarationStatement implements IStatement {
//   public fields: PropertyDefinition[] = []
//   public methods: MethodDefinition[] = []

//   constructor(public id: Identifier) {}

//   public execute(): void {
//     const classFields = this.fields.map(this.toClassField)
//     const classMethods = this.methods.map(this.toClassMethod)

//     const declaration = new ClassDeclaration(this.id.name, classFields, classMethods)
//     Variables.hoisting(this.id.name, 'var')
//     Variables.define(this.id.name, new FunctionValue(declaration))
//   }

//   private toClassField(f: PropertyDefinition): ClassField {
//     return new ClassField(f.key, f.value?.eval() || UndefinedValue.UNDEFINED)
//   }

//   private toClassMethod(method: MethodDefinition): ClassMethod {
//     const func = method.value.eval()
//     return new ClassMethod(method.key, func)
//   }

//   public addField(field: PropertyDefinition) {
//     this.fields.push(field)
//   }

//   public addMethod(method: MethodDefinition) {
//     this.methods.push(method)
//   }

//   public accept(visitor: IVisitor): void {
//     throw new Error('Method `ClassDeclarationStatement.accept` not implemented.')
//   }
// }
