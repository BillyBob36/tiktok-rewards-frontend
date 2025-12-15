'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      router.push('/?error=' + encodeURIComponent(error));
      return;
    }

    if (code) {
      // Redirect to home page with the code
      router.push('/?code=' + encodeURIComponent(code));
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-tiktok-cyan" />
        <p className="text-white/70">Connexion en cours...</p>
      </div>
    </div>
  );
}
