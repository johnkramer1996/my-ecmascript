// log Boolean('false')==true
// log Boolean(false)==false
// log Boolean(true)==true
// log Boolean(0)==false
// log Boolean(-0)==false
// log Boolean(1)==true
// log Boolean('')==false
// log Boolean('0')==true

let obj = {name: 1}
let obj2 = obj
log obj == obj2
log obj === obj2
obj = {name: 1}
log obj == obj2
log obj === obj2