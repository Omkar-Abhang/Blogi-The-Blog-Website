'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { BlogPost } from '@/services/blog-api';
import { getBlogPost, deleteBlogPost } from '@/services/blog-api';
import { useAuth } from '@/hooks/useAuth';
import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Clock, User, ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react'; // Import Loader2
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getUserFromToken } from '@/lib/auth'; // Import function to get user info


export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth(); // Check if user is authenticated and auth loading state
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [canEditDelete, setCanEditDelete] = useState(false);

  const id = params?.id as string | undefined; // Get post ID from route params

  const fetchPost = useCallback(async () => {
    if (!id) {
      setError("Post ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const postData = await getBlogPost(id);
      if (postData) {
        setPost(postData);
      } else {
        setError("Blog post not found.");
      }
    } catch (err) {
      console.error("Failed to fetch post:", err);
      setError("Failed to load the blog post. Please try again later.");
      toast({
         variant: "destructive",
         title: "Error",
         description: "Could not fetch the blog post.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Effect to check authorization after post and auth state are loaded
  useEffect(() => {
      if (!authLoading && post) {
          const currentUser = getUserFromToken();
          setCanEditDelete(isAuthenticated && post.author.username === currentUser?.username);
      }
  }, [authLoading, post, isAuthenticated]);

  const handleDelete = async () => {
     if (!id || !post) return;

     setIsDeleting(true);
     try {
       await deleteBlogPost(id);
       toast({
         title: "Success",
         description: "Blog post deleted successfully.",
       });
       router.push('/'); // Redirect to homepage after deletion
       router.refresh(); // Force refresh to reflect deletion
     } catch (err) {
       console.error("Failed to delete post:", err);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Could not delete blog post. You might not have permission.",
       });
       setIsDeleting(false); // Only reset if delete fails
     }
     // No finally block for setIsDeleting, it stays true during redirect
   };


  if (isLoading || authLoading) { // Show skeleton while fetching post or checking auth
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-16 mb-4" /> {/* Back button placeholder */}
        <Skeleton className="h-64 w-full mb-4" /> {/* Image placeholder */}
        <Skeleton className="h-10 w-3/4 mb-2" /> {/* Title placeholder */}
        <Skeleton className="h-6 w-1/2 mb-4" /> {/* Meta info placeholder */}
        <Skeleton className="h-4 w-full" /> {/* Content lines placeholder */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
         <Skeleton className="h-10 w-1/4 mt-4 ml-auto" /> {/* Action buttons placeholder */}
      </div>
    );
  }

  if (error) {
    return (
        <div className="max-w-3xl mx-auto text-center pt-10">
            <Button variant="outline" onClick={() => router.back()} className="mb-4 mr-auto inline-flex items-center">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            </Alert>
      </div>
    );
  }

  if (!post) {
    // This case should ideally be covered by the error state, but added for safety
    return <div className="text-center text-muted-foreground mt-10">Blog post not found.</div>;
  }

  const formattedCreatedAt = format(new Date(post.created_at), 'PPP p'); // e.g., Jan 1, 2024 12:00 AM
  const formattedUpdatedAt = format(new Date(post.updated_at), 'PPP p');


  return (
    <div className="max-w-3xl mx-auto">
         <Button variant="outline" onClick={() => router.back()} className="mb-6 inline-flex items-center">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to posts
         </Button>

        <Card className="overflow-hidden shadow-lg">
            {post.image && (
            <div className="relative w-full h-64 sm:h-80 md:h-96">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                     sizes="(max-width: 768px) 100vw, 896px" // Adjust sizes as needed
                     priority // Prioritize loading the main image
                     onError={(e) => (e.currentTarget.src = 'https://picsum.photos/800/400')} // Fallback
                />
            </div>
            )}
            <CardHeader>
            <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2">
                 <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" /> {post.author.username || 'Anonymous'}
                 </div>
                 <div className="flex items-center">
                     <Calendar className="w-4 h-4 mr-1" /> Created: {formattedCreatedAt}
                 </div>
                 <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> Updated: {formattedUpdatedAt}
                 </div>
            </div>

            </CardHeader>
            <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none pt-4 whitespace-pre-wrap text-foreground">
              {/* Using whitespace-pre-wrap to respect newlines and wrap text */}
              {post.content}
            </CardContent>
             {canEditDelete && (
                 <CardFooter className="pt-6 border-t flex justify-end space-x-2">
                   <Button variant="outline" asChild>
                     <Link href={`/posts/${post.id}/edit`}>
                       <Edit className="mr-2 h-4 w-4" /> Edit
                     </Link>
                   </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this blog post.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className={buttonVariants({ variant: "destructive" })}>
                             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                             Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 </CardFooter>
             )}
        </Card>
    </div>
  );
}

// Add basic prose styles to globals.css if not already present via a plugin
/*
@layer base {
  .prose { @apply text-foreground; }
  .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 { @apply text-foreground font-semibold mb-4 mt-6; }
  .prose p { @apply text-foreground my-4 leading-relaxed; }
  .prose a { @apply text-primary hover:underline; }
  .prose blockquote { @apply border-l-4 border-primary pl-4 italic text-muted-foreground my-4; }
  .prose ul { @apply list-disc list-inside my-4 space-y-1; }
  .prose ol { @apply list-decimal list-inside my-4 space-y-1; }
  .prose code { @apply bg-muted text-muted-foreground rounded px-1 py-0.5 text-sm; }
  .prose pre { @apply bg-muted p-4 rounded-md overflow-x-auto my-4; }
  .prose pre code { @apply bg-transparent p-0; }
  .prose img { @apply rounded-md my-6; }
}
*/
