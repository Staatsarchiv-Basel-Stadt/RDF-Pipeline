
const fetch = require('node-fetch')

function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    console.log('Request successfully executed')
    return res
  } else {
    console.log(`Could not execute request, got ${res.status}: ${res.statusText}`)
  }
}

fetch('http://admin:admin@pdstavs13:5820/scope/update?query=CLEAR default')
  .then(checkStatus)
  .then(() => fetch('http://admin:admin@pdstavs13:5820/scope/update?query=ADD <virtual://scope-virtual> TO <http://example.org/scope>'))
  .then(checkStatus)
  .catch((err) => console.error(err))
