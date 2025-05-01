'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton'; // Use Skeleton for loading state

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [isAuthenticated, isLoading, router]);

  // While loading authentication status, show a loading indicator
  if (isLoading) {
    return (
        <div className="space-y-4 pt-10">
            <Skeleton className="h-10 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-40 w-full" />
             <Skeleton className="h-10 w-1/4 mx-auto" />
        </div>
    );
  }

  // If authenticated, render the children components
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback: Return null or a minimal component while redirecting happens
  // This prevents rendering children briefly before redirection completes
  return null;
}
