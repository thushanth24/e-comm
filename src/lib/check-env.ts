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

// Only run the check in development or when explicitly called
if (process.env.NODE_ENV === 'development') {
  try {
    checkEnvVars();
  } catch (error) {
    console.warn('Environment check failed:', error);
  }
}
