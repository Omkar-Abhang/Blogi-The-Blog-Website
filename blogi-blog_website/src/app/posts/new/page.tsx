'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogPostForm from '@/components/BlogPostForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createBlogPost, type CreateBlogPost } from '@/services/blog-api';
import { useToast } from "@/hooks/use-toast";

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePost = async (data: CreateBlogPost) => {
    setIsLoading(true);
    try {
      const newPost = await createBlogPost(data);
      toast({
        title: "Post Created",
        description: "Your new blog post has been published successfully.",
      });
      router.push(`/posts/${newPost.id}`); // Redirect to the newly created post
    } catch (error) {
      console.error('Failed to create post:', error);
       toast({
         variant: "destructive",
         title: "Creation Failed",
         description: "Could not create the blog post. Please try again.",
       });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <BlogPostForm onSubmit={handleCreatePost} isLoading={isLoading} />
    </ProtectedRoute>
  );
}
