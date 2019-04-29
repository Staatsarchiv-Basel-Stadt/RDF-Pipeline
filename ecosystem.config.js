module.exports = {
  apps: [{
    name: 'cron-git-update',
    script: 'shell/git-pull.js',
    cron_restart: '*/5 * * * *',
    watch: false,
    autorestart: false
  }
  ]
}
