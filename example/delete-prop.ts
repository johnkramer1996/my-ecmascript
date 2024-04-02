// simple
const b = {a: {b: 123}}
log b
delete b.a.b
log b

// with clocuse
const func = () => {
  const obj = {a: {a: 123}, b: 456}
  return () => {
    log obj 
    return obj
  }
}
const closure = func()
delete closure().a
closure() // without a
