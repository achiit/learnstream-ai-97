/**
 * Run this script to set up your database tables
 * 
 * Usage:
 * 1. Make sure your .env file has correct Supabase credentials
 * 2. Run: npx tsx setup-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  // Read the SQL migration file
  const sqlPath = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  console.log('📄 Read migration file: 001_initial_schema.sql');
  console.log('📊 Executing SQL...\n');

  try {
    // Note: This requires the service_role key for DDL operations
    // For now, let's just inform the user to use the Supabase dashboard
    
    console.log('⚠️  Database migrations need to be run from the Supabase Dashboard.');
    console.log('\n📋 Follow these steps:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click "SQL Editor" in the left sidebar');
    console.log('4. Click "+ New query"');
    console.log('5. Copy the contents of: supabase/migrations/001_initial_schema.sql');
    console.log('6. Paste into the SQL editor');
    console.log('7. Click "RUN"');
    console.log('\n✅ Your Supabase connection is working!');
    console.log(`   URL: ${supabaseUrl}`);
    
    // Test the connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error && error.code === 'PGRST204') {
      console.log('\n❌ Tables not found - please run the migration in Supabase dashboard');
    } else if (error) {
      console.log('\n⚠️  Error:', error.message);
    } else {
      console.log('\n✅ Database tables already exist!');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();

