'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering the theme provider on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
    >
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}
