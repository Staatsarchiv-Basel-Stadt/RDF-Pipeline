import { namedNode } from 'rdf-ext'

const pred1 = namedNode('https://www.ica.org/standards/RiC/ontology#quantity')

export const fixDecimal = async (quad) => {
  if (pred1.equals(quad.predicate)) {
    const object = quad.object.value.replace(/,/g, '.')
    return quad(quad.subject, quad.predicate, object)
  }
}
