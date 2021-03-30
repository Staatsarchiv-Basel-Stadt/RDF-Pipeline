const { transformDates } = require('./date')

async function transformQuads(quad){

    let quads
    if (quad.predicate.value === 'https://www.ica.org/standards/RiC/ontology#expressedDate') {
        quads = transformDates(quad)
    } else {
        quads = [quad]
    }
    return quads
}

module.exports = {
    transformQuads
}