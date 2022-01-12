
const fetch = require('node-fetch')

const stardogUser = process.env.SOURCE_ENDPOINT_USER
const stardogPassword = process.env.SOURCE_ENDPOINT_PASSWORD
const database = process.env.SOURCE_ENDPOINT_DATABASE


const metadata = `
INSERT  { GRAPH <http://data.alod.ch/graph/bs> {
  <http://data.staatsarchiv-bs.ch/dataset/Archivkatalog> <http://purl.org/dc/terms/modified> ?modified .
}}  WHERE {
  BIND( NOW() as ?modified)
}
`

function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    console.log(`Request successfully executed, got ${res.status}: ${res.statusText}`)
    return res
  } else {
    console.log(`Could not execute request, got ${res.status}: ${res.statusText}`)
  }
}

fetch(`http://${stardogUser}:${stardogPassword}@pdstasvogdp:8081/${database}/update?query=COPY <virtual://scope-virtual> TO <https://ld.staatsarchiv.bs.ch/graph/source>`)
  .then(checkStatus)
  .then(() => fetch(`http://${stardogUser}:${stardogPassword}@pdstasvogdp:8081/scope/update?query=${metadata}`))
  .then(checkStatus)
  .catch((err) => console.error(err))
