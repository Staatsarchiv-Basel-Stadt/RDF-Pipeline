// this repo should live in the docker container
const gitRepo = '/Users/ktk/tmp/automation-test-repo'

const simpleGit = require('simple-git')(gitRepo)
// const simpleGit = require('simple-git')('/Users/ktk/workspace/zazuko/StABS-scope2RDF')

// configuration
const mapping = 'src-gen/stabs-mapping.r2rml.ttl'
const stardogHome = 'opt/stardog'

const shell = require('shelljs')

simpleGit.exec(() => console.log('Starting pull...'))
  .pull((_err, update) => {
    if (update && update.summary.changes) {
//      require('child_process').exec('echo bla')
      console.log('there was a change')
    } else {
      shell.exec(`ssh stardog-bs 'mkdir -p ${stardogHome}'`)

      if (shell.exec(`scp ${gitRepo}/${mapping} stardog-bs:${stardogHome}`).code !== 0) {
        shell.echo('Error: Copying R2RML mapping failed')
        shell.exit(1)
      }
      console.log('No change in repository')
    }
  })
  .exec(() => console.log('pull done.'))
