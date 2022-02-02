
const rdf = require('rdf-ext')

let pred1 = rdf.namedNode('https://www.ica.org/standards/RiC/ontology#quantity')

async function fixDecimal(quad){
    if (pred1.equals(quad.predicate)) {
      const object = quad.object.value.replace(/,/g, '.')
      return quad(quad.subject, quad.predicate, object)
      }
    }