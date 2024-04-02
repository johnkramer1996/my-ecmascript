class A {
  
}
class B extends A{
  constructor() {
    super()
    log this
    log 'run b constructor'
  }
}

const func = A.method

// log A.method()
// log B.method()
// log new A
const a= new B