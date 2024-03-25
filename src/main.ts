import Lexer from 'parser/Lexer'
import Parser from 'parser/Parser'

const program = `
class A {
  a() {
    this.name = 123
  }
}
log new A()`

const lexer = new Lexer(program)
const tokens = lexer.tokenize()
const parser = new Parser(tokens)
const ast = parser.parse()
try {
  ast.execute()
} catch (e) {
  console.error('[main.ts]', e)
}

class A {
  a = function () {
    return { a: 123 }
  }
}

// @ts-ignore
new new A().a()

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
