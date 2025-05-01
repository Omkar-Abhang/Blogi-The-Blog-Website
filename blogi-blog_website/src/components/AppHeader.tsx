'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, UserPlus, Home, Search, PlusCircle } from 'lucide-react';

export default function AppHeader() {
  const { isAuthenticated, logout, isLoading } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-accent transition-colors">
          BlogiLite
        </Link>
        <div className="flex items-center space-x-4">
           <Button variant="ghost" size="icon" asChild className="hover:bg-primary/80 hover:text-accent">
              <Link href="/" title="Home">
                <Home />
              </Link>
           </Button>
          {!isLoading && ( // Only render auth buttons when loading is complete
            <>
              {isAuthenticated ? (
                <>
                 <Button variant="ghost" size="icon" asChild className="hover:bg-primary/80 hover:text-accent">
                   <Link href="/posts/new" title="New Post">
                     <PlusCircle />
                   </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="hover:bg-primary/80 hover:text-accent">
                    <LogOut />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="icon" asChild className="hover:bg-primary/80 hover:text-accent">
                    <Link href="/login" title="Login">
                     <LogIn />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="hover:bg-primary/80 hover:text-accent">
                     <Link href="/register" title="Register">
                      <UserPlus />
                     </Link>
                  </Button>
                </>
              )}
            </>
          )}
           {isLoading && ( // Show placeholders while loading
              <div className="flex space-x-2">
                 <div className="w-8 h-8 bg-primary/50 rounded-full animate-pulse"></div>
                 <div className="w-8 h-8 bg-primary/50 rounded-full animate-pulse"></div>
              </div>
           )}
        </div>
      </nav>
    </header>
  );
}
