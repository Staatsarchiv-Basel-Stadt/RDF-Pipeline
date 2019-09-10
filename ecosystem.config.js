module.exports = {
  apps: [{
    name: 'cron-git-update',
    script: 'shell/git-pull.js',
    cron_restart: '*/5 * * * *',
    watch: false,
    autorestart: false
  },
  {
    name: 'cron-oracle-materialize',
    script: 'shell/oracle-materialize.js',
    cron_restart: '0 5 * * MON',
    watch: false,
    autorestart: false
  },
  {
    name: 'cron-post-lindas',
    script: 'node_modules/.bin/barnard59 --format text/turtle pipelines/staatsarchiv.ttl',
    cron_restart: '0 6 * * MON',
    watch: false,
    autorestart: false
  }
  ]
}
