class A {
    constructor(a){
      log this
    }
   method(a) {
    log a
    return {
      method(a) {
        log a
        return (a) => {
          log a
        }
      }
    }
   }
  }
  const instance = new A(1).method(2).method(3)(4)