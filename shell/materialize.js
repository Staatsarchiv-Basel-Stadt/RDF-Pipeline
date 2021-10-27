
const fetch = require('node-fetch')

const stardogUser = process.env.SOURCE_ENDPOINT_USER
const stardogPassword = process.env.SOURCE_ENDPOINT_PASSWORD

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

fetch(`http://${stardogUser}:${stardogPassword}@pdstavs13:5820/scope/update?query=COPY <virtual://scope-virtual> TO <http://data.alod.ch/graph/bs>`)
  .then(checkStatus)
  .then(() => fetch(`http://${stardogUser}:${stardogPassword}@pdstavs13:5820/scope/update?query=${metadata}`))
  .then(checkStatus)
  .catch((err) => console.error(err))
