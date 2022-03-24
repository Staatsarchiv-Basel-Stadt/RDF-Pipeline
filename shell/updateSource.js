/* Update source graph
/  -------------------
/  fix errors in date graphs
*/

const fetch = require('node-fetch')

const stardogUser = process.env.SOURCE_ENDPOINT_USER
const stardogPassword = process.env.SOURCE_ENDPOINT_PASSWORD
const database = process.env.SOURCE_ENDPOINT_DATABASE

// update to choose only first date value
const updateDate1 = `
PREFIX rico: <https://www.ica.org/standards/RiC/ontology#>

WITH <https://ld.staatsarchiv.bs.ch/graph/source>
DELETE {?s rico:expressedDate ?o}
INSERT {?s rico:expressedDate ?1Date}
WHERE { 
  ?s rico:expressedDate ?o .
  filter regex(?o, '\r\n\r\n')
  BIND (strbefore(?o, '\r\n\r\n') as ?1Date)
}
`

function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    console.log(`Update request successfully executed, got ${res.status}: ${res.statusText}`)
    return res
  } else {
    console.log(`Could not update execute request, got ${res.status}: ${res.statusText}`)
  }
}

// do update query
fetch(`http://${stardogUser}:${stardogPassword}@pdstasvogdp:8081/${database}/update?query=${updateDate1}`)
  .then(checkStatus)
  .catch((err) => console.error(err))