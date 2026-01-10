// import 'dotenv/config';
// import app from "./app";
// import { BackupService } from './modules/backup/backup.service';
// import { env } from './config/env';
// console.log('✅ Environment variables validated');

// // Validate critical environment variables
// const requiredEnvVars = ['CSRF_SECRET', 'STRIPE_WEBHOOK_SECRET', 'DATABASE_URL'];
// const missing = requiredEnvVars.filter(key => !process.env[key]);
// if (missing.length > 0) {
//   throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
// }

// const PORT =  3003;
// const HOST = 'http://localhost';

// app.listen(PORT, async () => {
//   console.log(`Server is running on ${HOST}:${PORT}`);
  
//   // Initialize backup scheduler
//   console.log('🔄 Initializing backup scheduler...');
//   await BackupService.scheduleBackup();
// });


import 'dotenv/config';
import app from "./app";
import { BackupService } from './modules/backup/backup.service';
import { env } from './config/env'; // Validates on import - will throw if any env var is invalid
console.log('✅ Environment variables validated');

// Use validated env object (type-safe!)
const PORT = env.PORT;
const HOST = env.NODE_ENV === 'production' 
  ? 'https://ywkocw0408owow804c44ow4g.dijango.com' 
  : 'http://localhost';

app.listen(PORT, async () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
  
  // Initialize backup scheduler
  console.log('🔄 Initializing backup scheduler...');
  await BackupService.scheduleBackup();
});