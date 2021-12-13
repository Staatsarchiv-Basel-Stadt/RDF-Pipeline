// this repo should live in the docker container
const gitRepo = '/opt/StABS-scope2RDF'

// all required imports
const fs = require('fs')
const propertiesReader = require('properties-reader')
const simpleGit = require('simple-git')(gitRepo)
const { Connection, virtualGraphs } = require('stardog')

// all the configuration
const config = {
  stardog: {
    user: process.env.SOURCE_ENDPOINT_USER || 'admin',
    password: process.env.SOURCE_ENDPOINT_PASSWORD || 'admin',
    endpoint: process.env.SOURCE_ENDPOINT_URL || 'http://localhost:5820'
  },
  git: {
    remote: process.env.git_remote || 'origin',
    branch: process.env.git_branch || 'development'
  }
}

// read virtual graph properties
const virtualGraphPropertiesReader = propertiesReader(`${process.cwd()}/credentials/scope-virtual.properties`)
const virtualGraphProperties = virtualGraphPropertiesReader.getAllProperties()

// try to read mapping file content
const mappingsData = fs.readFileSync(`${gitRepo}/src-gen/mapping-stabs.r2rml.ttl`, 'utf8')

// create connection to Stardog
const conn = new Connection({
  username: config.stardog.user,
  password: config.stardog.password,
  endpoint: config.stardog.endpoint
})

// update virtual graph using Stardog API
const gitUpdate = async () => {
  console.log('  - Removing scope-virtual virtual graph using Stardog API…')
  const removeAnswser = await virtualGraphs.remove(conn, 'scope-virtual')
  if (removeAnswser.statusText && removeAnswser.status) {
    console.log(`    => ${removeAnswser.statusText} (${removeAnswser.status})`)
    console.log(JSON.stringify(removeAnswser.body, null, 2))
  }

  console.log('  - Add scope-virtual virtual graph using Stardog API…')
  const addAnswer = await virtualGraphs.add(conn, 'scope-virtual', mappingsData, virtualGraphProperties)
  if (addAnswer.statusText && addAnswer.status) {
    console.log(`    => ${addAnswer.statusText} (${addAnswer.status})`)
    console.log(JSON.stringify(addAnswer.body, null, 2))
  }
}

const date = new Date()

// check if there are some changes in the Git repository containing the mappings
simpleGit.exec(() => console.log(`[${date}] Starting pull…`))
  .pull(config.git.remote, config.git.branch, async (_err, update) => {
    if (update && update.summary.changes) {
      console.log('  - Status: repository was updated')
      await gitUpdate()
    } else {
      console.log('  - Status: no change in repository')

      // uncomment the following line to force the update of the virtual mapping
      // await gitUpdate()
    }
  })
