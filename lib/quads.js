import { transformDates } from './date.js'

const transformQuads = async (quad) => {
  let quads
  if (quad.predicate.value === 'https://www.ica.org/standards/RiC/ontology#expressedDate') {
    quads = transformDates(quad)
  } else {
    quads = [quad]
  }
  return quads
}

export default {
  transformQuads
}
