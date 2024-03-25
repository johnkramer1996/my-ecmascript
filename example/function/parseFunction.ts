const a = 'a global'
const b = 'b global'
const d = 'd global'
function name() {
  const a = 'a local'
  const b = 'b local'
  const c = 'c local'
  const func = Function('const b = "inner b"; log a; log b; log d; log c')
  func()
}

name()
log a
log b
log c
log d