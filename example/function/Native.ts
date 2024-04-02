log new Number(123)
log Number(123)

function Name() {

}
log  new Name


Number.prototype.getValue = () => {
    return this.value
  }
  const number =  new Number(123)
  log number.getValue()