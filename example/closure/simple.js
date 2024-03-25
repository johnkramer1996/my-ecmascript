function createCounter(init = 0) {
    let count = init
    return () => count++
  }
  const counter = createCounter(1)
  log counter()
  log counter()