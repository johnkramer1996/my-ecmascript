import Lexer from 'parser/Lexer'
import Parser from 'parser/Parser'

const program = `
function name() {
  log 123
}
log name()
`

// const a = {a: 123, __proto__: {b: 123}}
// log a.b

// function Name() {
//   super()
// }
// class A {
//   constructor() {
//     super()
//     // console.log(this)
//   }
// }
// class B extends A {
//   // a = 'b'
//   // @ts-ignore
//   constructor() {
//     super()
//     // console.log(this)
//   }
// }
// class C extends B {
//   a = 'c'
//   constructor() {
//     // @ts-ignore
//     // console.log(this)
//     super()
//   }
// }

export const EMPTY = 'EMPTY '

const lexer = new Lexer(program)
const tokens = lexer.tokenize()
const parser = new Parser(tokens)
const ast = parser.parse()
try {
  ast.execute()
} catch (e) {
  console.error('[main.ts]', e)
}

// function myFunc() {
//   // @ts-ignore
//   this.a = 10
// }
// console.log(myFunc())

// console.log(new Number(123).toString())
// console.log(Number)
// // @ts-ignore
// const A = Name.bind({ aa: 1 })
// console.log(new A())
// [Number: 1]
// @ts-ignore
// console.log(Number.prototype === new Number().__proto__)

// class A {
//   constructor() {
//     // @ts-ignore
//     return function name() {
//       return { a: 1 }
//     }
//   }
//   a = function () {
//     return { a: 123 }
//   }
// }

// // @ts-ignore
// console.log(new new A()())

// @ts-ignore
// const func = (a: number = 10, b: number, c: number = 20) => {
//   console.warn(a, b, c)
// }
// func(undefined, 1, undefined)

// const func = function Name(...rest: any[]) {
//   // @ts-ignore
//   console.warn(this)
//   console.warn({ rest })
// }

// const bind = Function.bind

// const A = bind.apply(func, [null, 1, 2, 3])
// const B = func.bind(null, 1, 2, 3)
// // @ts-ignore
// const instance = new A(1, 2)
// // @ts-ignore
// const instanceB = new B()
// console.warn(instance)
// console.warn(instanceB)

// function foo(x = 2, y) {
//   console.warn(x, y)
// }

// // @ts-ignore
// foo(1) // 1, undefined
// foo(undefined, 1) // 2, 1
