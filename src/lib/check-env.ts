// Check if required environment variables are set
export function checkEnvVars() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`- ${varName}`);
    });
    throw new Error('Missing required environment variables');
  }

  console.log('All required environment variables are set');
  return true;
}

// Run the check when this module is imported
checkEnvVars();
