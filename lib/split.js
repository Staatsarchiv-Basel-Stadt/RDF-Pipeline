const rdf = require('rdf-ext')
const namespace = require('@rdfjs/namespace')
const ns = {
  time: namespace('http://www.w3.org/2006/time#'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  rico: namespace('https://www.ica.org/standards/RiC/ontology#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

function splitLiterals(quad){
    dateValues = quad.object.value.split(lb)
    dateValues.forEach(value => {
        return rdf.quad(quad.subject, quad.predicate, value)
    });
    quads.push(rdf.quad(quad.subject, quad.predicate, quad.object))

    return quads
}