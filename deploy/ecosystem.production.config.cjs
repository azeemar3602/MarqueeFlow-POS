// PM2 — MarqueeFlow POS production only (port 8085)
// Copy to: /var/www/marqueeflow-pos-backend/ecosystem.config.cjs
// Start:   pm2 start ecosystem.config.cjs && pm2 save

module.exports = {
  apps: [{
    name: 'marqueeflow-pos-backend',
    script: './dist/index.js',
    cwd: '/var/www/marqueeflow-pos-backend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8085,
      DB_HOST: '127.0.0.1',
      DB_USER: 'mf_pos_user',
      DB_PASSWORD: 'CHANGE_ME',
      DB_NAME: 'marqueeflow_pos_db',
      JWT_SECRET: 'CHANGE_ME_64_CHAR_RANDOM',
      UPLOAD_DIR: '/var/www/marqueeflow-pos-uploads',
      APP_URL: 'https://pos.marqueeflow.com',
      ADMIN_EMAIL: 'support@marqueeflow.com',
      MAIL_HOST: 'smtp.hostinger.com',
      MAIL_PORT: '465',
      MAIL_USER: 'support@marqueeflow.com',
      MAIL_PASS: 'CHANGE_ME',
    },
  }],
}
