import 'dotenv/config';
import app from "./app";

// Validate critical environment variables
const requiredEnvVars = ['CSRF_SECRET', 'STRIPE_WEBHOOK_SECRET', 'DATABASE_URL'];
const missing = requiredEnvVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const PORT =  3003;
const HOST = 'http://localhost';

app.listen(PORT, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
});