require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 ServiceFlow Backend Server running on http://localhost:${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
});
