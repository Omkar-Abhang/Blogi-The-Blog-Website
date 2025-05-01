'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlogPostForm from '@/components/BlogPostForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getBlogPost, updateBlogPost, type UpdateBlogPost, type BlogPost } from '@/services/blog-api';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { getUserFromToken } from '@/lib/auth'; // Import getUserFromToken


export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth(); // Get auth state and loading status
  const [initialData, setInitialData] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetching initial data
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // Track authorization status


  const id = params?.id as string | undefined;

  const fetchPostAndCheckAuth = useCallback(async () => {
    if (!id) {
      setError("Post ID is missing.");
      setIsLoading(false);
      setIsAuthorized(false);
      return;
    }
    // Ensure auth state is loaded before proceeding
    if (authLoading) {
        return; // Wait for auth check to complete
    }

    setIsLoading(true);
    setError(null);
    setIsAuthorized(null); // Reset authorization state

    try {
      const postData = await getBlogPost(id);
      if (postData) {
        setInitialData(postData);
        // Perform authorization check *after* fetching post and ensuring user is authenticated
        if (isAuthenticated) {
            const currentUser = getUserFromToken();
            if (currentUser?.username === postData.author) {
                setIsAuthorized(true);
            } else {
                setError("You are not authorized to edit this post.");
                toast({ variant: "destructive", title: "Unauthorized", description: "You cannot edit this post." });
                setIsAuthorized(false);
                // Redirect immediately if unauthorized
                // router.replace(`/posts/${id}`); // Optionally redirect
            }
        } else {
            // Should be caught by ProtectedRoute, but as a fallback:
            setError("You must be logged in to edit posts.");
            setIsAuthorized(false);
             toast({ variant: "destructive", title: "Authentication Required", description: "Please log in." });
             // router.replace('/login?redirect=' + encodeURIComponent(window.location.pathname));
        }

      } else {
        setError("Blog post not found.");
        toast({ variant: "destructive", title: "Not Found", description: "The post you are trying to edit does not exist." });
        setIsAuthorized(false);
        // router.replace('/'); // Redirect home if post not found
      }
    } catch (err) {
      console.error("Failed to fetch post or check auth:", err);
      setError("Failed to load the blog post for editing.");
      toast({ variant: "destructive", title: "Error", description: "Could not load the post data." });
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  }, [id, router, toast, isAuthenticated, authLoading]); // Add isAuthenticated and authLoading dependencies

  useEffect(() => {
    fetchPostAndCheckAuth();
  }, [fetchPostAndCheckAuth]); // Rerun when auth state changes


  const handleUpdatePost = async (data: UpdateBlogPost) => {
    if (!id || !isAuthorized) return; // Ensure user is authorized before submitting
    setIsSubmitting(true);
    try {
      await updateBlogPost(id, data);
      toast({
        title: "Post Updated",
        description: "Your blog post has been updated successfully.",
      });
      router.push(`/posts/${id}`); // Redirect to the updated post view
       router.refresh(); // Trigger a server-side refresh potentially
    } catch (error: any) {
      console.error('Failed to update post:', error);
       let errorDesc = "Could not update the blog post. Please try again.";
        if (error?.status === 403) {
            errorDesc = "You do not have permission to update this post.";
        } else if (error?.data?.detail) {
            errorDesc = error.data.detail;
        }
      toast({
         variant: "destructive",
         title: "Update Failed",
         description: errorDesc,
       });
    } finally {
      setIsSubmitting(false);
    }
  };

   // Show loading skeleton while fetching post or auth state, or checking authorization
   if (isLoading || authLoading || isAuthorized === null) {
    return (
      <ProtectedRoute>
         <div className="space-y-4 max-w-2xl mx-auto pt-10">
             <Skeleton className="h-10 w-1/2 mb-4" /> {/* Title placeholder */}
             <Skeleton className="h-6 w-3/4 mb-6" /> {/* Description placeholder */}
             <Skeleton className="h-10 w-full" /> {/* Input placeholder */}
             <Skeleton className="h-40 w-full" /> {/* Textarea placeholder */}
             <Skeleton className="h-16 w-full" /> {/* Image upload placeholder */}
             <Skeleton className="h-10 w-1/4 ml-auto" /> {/* Button placeholder */}
         </div>
      </ProtectedRoute>
    );
  }

  // Show error message if fetching failed or user is not authorized
   if (error || !isAuthorized) {
    return (
        <ProtectedRoute>
            <div className="max-w-3xl mx-auto pt-10">
                 <Button variant="outline" onClick={() => router.back()} className="mb-4 inline-flex items-center mr-auto">
                     <ArrowLeft className="mr-2 h-4 w-4" /> Back
                 </Button>
                <Alert variant="destructive" className="text-center">
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>{error || "You are not authorized to edit this post."}</AlertDescription>
                </Alert>
            </div>
       </ProtectedRoute>
    );
  }


  // Render the form only if data is loaded and user is authorized
  return (
    <ProtectedRoute>
       {initialData && isAuthorized ? ( // Double check authorization here
        <BlogPostForm
            onSubmit={handleUpdatePost}
            initialData={initialData}
            isLoading={isSubmitting}
            submitButtonText="Update Post"
        />
       ) : (
          // This state should ideally not be reached if logic above is correct,
          // but provides a fallback just in case.
           <div className="text-center text-muted-foreground mt-10">Loading editor...</div>
       )}
    </ProtectedRoute>
  );
}
