// import IValue from 'parser/lib/IValue'
// import Types from 'parser/lib/types/Types'
// import ObjectValue from 'parser/lib/types/ObjectValue'
// import CallStack from 'parser/lib/CallStack'
// import { ClassMethod, ClassField } from './ClassDeclarationStatement'

// export class ClassInstance implements IValue {
//   private value = new ObjectValue()
//   private constructor_: ClassMethod | null = null
//   private toString: ClassMethod | null = null
//   private isInstantiated: boolean = false

//   constructor(private className: string) {}

//   public getValue(): ObjectValue {
//     return this.value
//   }

//   public addField(f: ClassField) {
//     this.value.set(f.name, f.value)
//   }

//   public addMethod(method: ClassMethod) {
//     method.setClassInstance(this)
//     const name = method.getName()
//     // this.thisObj.set(name, new FunctionValue(method))
//     if (name === 'constructor') {
//       this.constructor_ = method
//     } else if (name === 'toString') {
//       this.toString = method
//     }
//   }

//   public callConstructor(args: IValue[]): ClassInstance {
//     // if (this.isInstantiated) {
//     //   throw new Error(`Class ${this.className} was already instantiated`)
//     // }
//     // if (this.constructor_) {
//     //   CallStack.enter('class ' + this.className)
//     //   this.constructor_.call(...args)
//     //   CallStack.exit()
//     // }
//     // this.isInstantiated = true
//     // return this
//   }

//   public raw(): number {
//     throw new Error('Method `ClassInstance.raw` not implemented.')
//   }

//   public asNumber(): number {
//     throw new Error('Method `ClassInstance.asNumber` not implemented.')
//   }

//   public asString(): string {
//     return ''
//     // return this?.toString?.call().asString() ?? this.value.asString()
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
