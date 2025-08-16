const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function updateStoragePolicies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Enable RLS on storage.objects
    const { data: enableRls, error: rlsError } = await supabase.rpc('enable_rls_on_storage_objects');
    if (rlsError) console.log('RLS already enabled or error:', rlsError);
    
    // Apply storage policies
    const { data, error } = await supabase.rpc('apply_storage_policies');
    
    if (error) {
      console.error('Error applying storage policies:', error);
    } else {
      console.log('Successfully updated storage policies:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

updateStoragePolicies();
