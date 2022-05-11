// all required imports
const fs = require('fs')
const { Connection, query } = require('stardog')
const queries = process.env.SPARQL_REPO || '/usr/src/app/sparql'

// configuration for stardog connection
const config = {
  stardog: {
    user: process.env.SOURCE_ENDPOINT_USER || 'admin',
    password: process.env.SOURCE_ENDPOINT_PASSWORD || 'admin',
    endpoint: process.env.SOURCE_CONNECTIONSTRING || 'http://localhost:5820',
    database: process.env.SOURCE_ENDPOINT_DATABASE || 'ais-dev'
  }
}

// read queries from file content
const fixMultiDate = fs.readFileSync(`${queries}/fixMultiDate.rq`, 'utf8')
const createInstantiation = fs.readFileSync(`${queries}/createInstantiation.rq`, 'utf8')

// create connection to Stardog
const conn = new Connection({
  username: config.stardog.user,
  password: config.stardog.password,
  endpoint: config.stardog.endpoint
})

// update 'fixMultiDate'
query.execute(conn, config.stardog.database, fixMultiDate, 'application/sparql-results+json')
  .then(({ status, statusText }) => {
    console.log('Update query status for fixMultiDate: ', status, statusText)
  });

// update 'createInstantiation'
query.execute(conn, config.stardog.database, createInstantiation, 'application/sparql-results+json')
  .then(({ status, statusText }) => {
    console.log('Update query status for createInstantiation: ', status, statusText)
  });
