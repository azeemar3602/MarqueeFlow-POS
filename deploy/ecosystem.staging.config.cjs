// PM2 — MarqueeFlow POS staging only (port 8088)

module.exports = {
  apps: [{
    name: 'marqueeflow-pos-backend-staging',
    script: './dist/index.js',
    cwd: '/var/www/marqueeflow-pos-backend-staging',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'staging',
      PORT: 8088,
      DB_HOST: '127.0.0.1',
      DB_USER: 'mf_pos_user',
      DB_PASSWORD: 'CHANGE_ME',
      DB_NAME: 'marqueeflow_pos_db_staging',
      JWT_SECRET: 'CHANGE_ME_DIFFERENT_FROM_PROD',
      UPLOAD_DIR: '/var/www/marqueeflow-pos-staging-uploads',
      APP_URL: 'https://staging.pos.marqueeflow.com',
      ADMIN_EMAIL: 'support@marqueeflow.com',
      MAIL_HOST: 'smtp.hostinger.com',
      MAIL_PORT: '465',
      MAIL_USER: 'support@marqueeflow.com',
      MAIL_PASS: 'CHANGE_ME',
    },
  }],
}
