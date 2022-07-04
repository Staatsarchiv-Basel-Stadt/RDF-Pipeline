import fetch, { Headers } from 'node-fetch'

const stardogUser = process.env.SOURCE_ENDPOINT_USER
const stardogPassword = process.env.SOURCE_ENDPOINT_PASSWORD
const database = process.env.SOURCE_ENDPOINT_DATABASE

const sourceHostname = process.env.SOURCE_HOSTNAME
const sourceHostport = process.env.SOURCE_HOSTPORT

const metadata = `
INSERT  { GRAPH <https://ld.staatsarchiv.bs.ch/graph/source> {
  <https://ld.bs.ch/set/archival-catalog> <http://purl.org/dc/terms/issued> ?issued .
}}  WHERE {
  BIND( NOW() as ?issued)
}
`

const checkStatus = (res) => {
  if (res.ok) { // res.status >= 200 && res.status < 300
    console.log(`Request successfully executed, got ${res.status}: ${res.statusText}`)
    return res
  } else {
    console.log(`Could not execute request, got ${res.status}: ${res.statusText}`)
  }
}

const basicAuth = btoa(`${stardogUser}:${stardogPassword}`)
const headers = new Headers({
  Authorization: `Basic ${basicAuth}`
})

// According to UPDATE spec: The COPY operation is a shortcut for inserting all data from an input graph into a destination graph. Data from the input graph is not affected, but data from the destination graph, if any, is removed before insertion.
fetch(`http://${sourceHostname}:${sourceHostport}/${database}/update?query=COPY <virtual://scope-virtual> TO <https://ld.staatsarchiv.bs.ch/graph/source>`, { headers })
  .then(checkStatus)
  .then(() => fetch(`http://${sourceHostname}:${sourceHostport}/${database}/update?query=${metadata}`, { headers }))
  .then(checkStatus)
  .catch((err) => console.error(err))
