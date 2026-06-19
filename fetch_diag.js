const https = require('https');

https.get('https://alterra-node.onrender.com/api/settings/test-email-status', res => {
  let body = '';
  res.on('data', chunk => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
}).on('error', err => {
  console.error('Request failed:', err);
});
