const shell = require('shelljs')

if (shell.exec('ssh c-3po.netlabs.org "test -e zfs-stats.txt"').code !== 0) {
  shell.echo('Error: File does not exist')
  shell.exit(1)
}
