import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env.local' });

async function testConnection() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log('Testing Supabase connection...');
  
  // Test connection by listing tables
  console.log('Listing tables...');
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_table_names');

  if (tablesError) {
    console.error('Error listing tables:', tablesError);
    return;
  }

  console.log('Available tables:', tables);

  // Check if category table exists
  console.log('\nChecking category table...');
  const { data: categoryColumns, error: columnError } = await supabase
    .rpc('get_columns', { table_name: 'category' });

  if (columnError) {
    console.error('Error getting category table columns:', columnError);
  } else {
    console.log('Category table columns:', categoryColumns);
  }

  // Try to fetch some data
  console.log('\nFetching categories...');
  const { data: categories, error: fetchError } = await supabase
    .from('category')
    .select('*');

  if (fetchError) {
    console.error('Error fetching categories:', fetchError);
  } else {
    console.log('Categories in database:', categories);
  }
}

testConnection().catch(console.error);
