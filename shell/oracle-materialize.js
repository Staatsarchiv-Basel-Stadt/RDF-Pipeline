
const fetch = require('node-fetch')

const metadata = `
INSERT  { GRAPH <http://data.alod.ch/graph/bs> {
  <http://data.staatsarchiv-bs.ch/dataset/Archivkatalog> <http://purl.org/dc/terms/modified> ?modified .
}}  WHERE {
  BIND( NOW() as ?modified)
}
`

function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    console.log('Request successfully executed')
    return res
  } else {
    console.log(`Could not execute request, got ${res.status}: ${res.statusText}`)
  }
}

fetch('http://admin:admin@pdstavs13:5820/scope/update?query=COPY <virtual://scope-virtual> TO <http://data.alod.ch/graph/bs>')
  .then(checkStatus)
  .then(() => fetch(`http://admin:admin@pdstavs13:5820/scope/update?query=${metadata}`))
  .then(checkStatus)
  .catch((err) => console.error(err))
