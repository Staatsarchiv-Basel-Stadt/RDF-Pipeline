const Client = require('ssh2').Client
const shell = require('shelljs')


'test -e /tmp/bla'


var conn = new Client()
conn.on('ready', function () {
  console.log('Client :: ready')
  conn.exec('uptime', function (err, stream) {
    if (err) throw err
    stream.on('close', function (code, signal) {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal)
      conn.end()
    }).on('data', function (data) {
      console.log('STDOUT: ' + data)
    }).stderr.on('data', function (data) {
      console.log('STDERR: ' + data)
    })
  })
}).connect({
  host: 'c-3po.netlabs.org',
  port: 22,
  username: 'ktk',
  passphrase: 'sugus',
  privateKey: require('fs').readFileSync('/Users/ktk/.ssh/id_rsa')
})
