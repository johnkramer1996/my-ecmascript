// import IStatement from 'parser/ast/IStatement'
// import IECMAScriptLanguageType from '../IValue'
// import UndefinedType from './UndefinedValue'
// import { CallStack } from '../CallStack'
// import { Params } from 'parser/ast/Params'
// import { Identifier } from 'parser/ast/Identifier'
// import Function from '../Function'

// export class UserDefinedFunction implements Function {
//   constructor(
//     public body: IStatement,
//     public params = new Params(),
//     public id: Identifier | null,
//     public name: string,
//   ) {}

//   public call(...values: IECMAScriptLanguageType[]): IECMAScriptLanguageType {
//     this.hoisting()
//     this.setArguments(values)
//     this.body.execute()
//     return CallStack.getReturn()
//   }

//   private hoisting(): void {
//     for (const param of this.getParams()) param.hoisting('var')
//     this.id && this.id.hoisting('var')
//   }

//   private setArguments(values: IECMAScriptLanguageType[]) {
//     this.getParams().forEach((arg, i) => arg.define(values[i] ?? UndefinedType.UNDEFINED))
//     // this.id?.define(new FunctionObjectType(this))
//   }

//   private getParams() {
//     return this.params.values
//   }

//   public toString(): string {
//     return `[function ${this.name}]`
//   }
// }
