const { transformDates } = require('./date')
const { splitLiterals } = require('./split')

async function transformQuads(quad){

    let quads
    if (quad.predicate.value === 'https://www.ica.org/standards/RiC/ontology#expressedDate') {
        quads = transformDates(quad)
    } else {
        quads = [quad]
    }
    return quads
}

async function transformLiterals(quad){
    
    let quads
    const  lb = RegExp(/\\r\\n/)
  
    if (lb.test(quad.object.value)) {
        quads = splitLiterals(quad, lb)
    } else {
        quads = [quad]
    }
    return quads
}

module.exports = {
    transformQuads,
    transformLiterals
}