'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BlogPost } from '@/services/blog-api';
import { getBlogPosts, searchBlogPosts, deleteBlogPost } from '@/services/blog-api';
import BlogPostCard from '@/components/BlogPostCard';
import PaginationControls from '@/components/PaginationControls';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'; // Import Card components
import { buttonVariants } from '@/components/ui/button'; // Import buttonVariants for AlertDialog action styling
import { Loader2 } from 'lucide-react'; // Import Loader2 for delete button

const POSTS_PER_PAGE = 6; // Number of posts per page

export default function Home() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth(); // Use auth hook
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Memoize fetch function to avoid unnecessary re-renders if used in dependency arrays
  const fetchPosts = useCallback(async (query: string = '', page: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      let postsData: BlogPost[];
      if (query) {
        postsData = await searchBlogPosts(query);
      } else {
        postsData = await getBlogPosts();
      }

      // Sort posts by creation date (most recent first) - Assuming API returns unsorted or differently sorted
      postsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAllPosts(postsData); // Store all fetched/searched posts
      setTotalPages(Math.ceil(postsData.length / POSTS_PER_PAGE));

      // Calculate posts for the current page
      const startIndex = (page - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      setDisplayedPosts(postsData.slice(startIndex, endIndex));
      setCurrentPage(page);

    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Failed to load blog posts. Please try again later.");
      setAllPosts([]);
      setDisplayedPosts([]);
      setTotalPages(1);
      setCurrentPage(1);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Could not fetch blog posts.",
       });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Add toast to dependencies


  useEffect(() => {
    // Reset page to 1 when search query changes
    const pageToFetch = searchQuery !== '' && currentPage !== 1 ? 1 : currentPage;
    if (searchQuery !== '' && currentPage !== 1) {
        setCurrentPage(1);
    }
    fetchPosts(searchQuery, pageToFetch);
  }, [fetchPosts, searchQuery, currentPage]); // Fetch when component mounts, query changes, or page changes


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Fetch is triggered by useEffect dependency change (searchQuery)
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
     // Fetch is triggered by useEffect dependency change (currentPage)
  };

  const openDeleteDialog = (id: string) => {
    setPostToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await deleteBlogPost(postToDelete);
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      });
      // Refetch posts after deletion, stay on current page if possible
      const newTotalPages = Math.ceil((allPosts.length - 1) / POSTS_PER_PAGE);
      const pageToGo = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      fetchPosts(searchQuery, pageToGo);
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete blog post. You might not have permission.",
      });
    } finally {
        setIsDeleteDialogOpen(false);
        setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Welcome to BlogiLite</h1>

      <div className="flex justify-center">
       <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
            <Card key={index} className="overflow-hidden shadow-lg bg-card"> {/* Added bg-card */}
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                   <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
                 <CardFooter className="border-t mt-auto pt-2">
                     <Skeleton className="h-4 w-1/4" />
                 </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <>
          {displayedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPosts.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  showActions={isAuthenticated} // Show actions only if logged in
                  onDelete={openDeleteDialog}
                 />
              ))}
            </div>
          ) : (
             <div className="text-center text-muted-foreground mt-10">
                No blog posts found{searchQuery ? ` matching "${searchQuery}"` : ''}.
             </div>
          )}

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
         </>
      )}

       {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPostToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
