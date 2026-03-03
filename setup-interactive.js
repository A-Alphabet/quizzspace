#!/usr/bin/env node

/**
 * LiveQuiz MVP - Interactive Setup Script
 * 
 * This script guides you through the setup process step-by-step
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset);
}

async function main() {
  log('\n🚀 LiveQuiz MVP - Production Setup\n', 'bright');

  // Step 1: Database Setup
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('STEP 1: Database Setup (PostgreSQL)', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  log('Choose your database provider:\n', 'yellow');
  log('1. Supabase (https://supabase.com) - Recommended', 'green');
  log('2. Neon (https://neon.tech)', 'green');
  log('3. Already have a database connection string\n', 'green');

  const dbChoice = await question('Select option (1-3): ');

  let databaseUrl = '';

  if (dbChoice === '1' || dbChoice === '2') {
    log(`\nOpen ${dbChoice === '1' ? 'https://supabase.com' : 'https://neon.tech'} and:`, 'yellow');
    log(`${dbChoice === '1' ? '1. Sign up or log in' : '1. Sign up or log in'}`);
    log(`2. Create a new project`);
    log(`3. Get the PostgreSQL connection string`);
    log(`4. Come back here and paste it\n`);

    databaseUrl = await question('Paste your DATABASE_URL: ');
  } else {
    databaseUrl = await question('Enter your DATABASE_URL: ');
  }

  if (!databaseUrl || !databaseUrl.includes('postgresql://')) {
    log('\n❌ Invalid database URL. Exiting.', 'red');
    process.exit(1);
  }

  // Step 2: Pusher Setup
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('STEP 2: Pusher Real-Time Configuration', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  log('Open https://pusher.com and:', 'yellow');
  log('1. Sign up or log in');
  log('2. Create a new app');
  log('3. Copy: App ID, Key, Secret, and Cluster');
  log('4. Come back here and enter them\n');

  const appId = await question('Pusher App ID: ');
  const key = await question('Pusher Key: ');
  const secret = await question('Pusher Secret: ');
  const cluster = await question('Pusher Cluster (e.g., mt1, us2, eu, ap1): ');

  // Create .env.local
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('STEP 3: Creating .env.local', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  const envContent = `# Database
DATABASE_URL="${databaseUrl}"

# Pusher (Real-time)
PUSHER_APP_ID="${appId}"
NEXT_PUBLIC_PUSHER_KEY="${key}"
PUSHER_SECRET="${secret}"
NEXT_PUBLIC_PUSHER_CLUSTER="${cluster}"

# Optional: API URL for production
NEXT_PUBLIC_API_URL="http://localhost:3000"
`;

  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);
  log(`✅ Created .env.local`, 'green');

  // Step 4: Database Migrations
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('STEP 4: Database Initialization', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  log('Next, run these commands:', 'yellow');
  log('\n# Generate Prisma client', 'dim');
  log('npx prisma generate\n', 'bright');
  log('# Create database tables', 'dim');
  log('npx prisma migrate dev --name init\n', 'bright');

  const ready = await question('Have you run those commands? (y/n): ');

  if (ready.toLowerCase() !== 'y') {
    log('\n⚠️  Please run the commands above first, then run this script again.', 'yellow');
    process.exit(0);
  }

  // Step 5: Dev Server
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('STEP 5: Run Development Server', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  log('Start the development server:', 'yellow');
  log('\n$env:NEXT_DISABLE_SWC=1; npm run dev\n', 'bright');
  log('Then open: http://localhost:3000\n', 'green');

  // Step 6: Deploy to Vercel
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('STEP 6: Deploy to Vercel', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  log('To deploy to Vercel:', 'yellow');
  log('1. Go to https://vercel.com/new');
  log('2. Import your GitHub repo (A-Alphabet/quizzspace)');
  log('3. Add these environment variables:');
  log('   - DATABASE_URL: ' + databaseUrl.substring(0, 30) + '...', 'dim');
  log('   - PUSHER_APP_ID: ' + appId, 'dim');
  log('   - PUSHER_SECRET: ' + secret, 'dim');
  log('   - NEXT_PUBLIC_PUSHER_KEY: ' + key, 'dim');
  log('   - NEXT_PUBLIC_PUSHER_CLUSTER: ' + cluster, 'dim');
  log('4. Click Deploy\n', 'green');

  // Summary
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
  log('✅ Setup Complete!', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'green');

  log('Your .env.local has been created with:', 'green');
  log('✓ Database URL');
  log('✓ Pusher credentials');
  log('✓ API configuration\n');

  log('Next steps:', 'bright');
  log('1. npx prisma generate');
  log('2. npx prisma migrate dev --name init');
  log('3. $env:NEXT_DISABLE_SWC=1; npm run dev');
  log('4. Visit http://localhost:3000\n');

  log('For production deployment, see PRODUCTION_SETUP.md', 'yellow');

  rl.close();
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
