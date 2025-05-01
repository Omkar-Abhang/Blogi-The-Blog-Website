'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { BlogPost, CreateBlogPost, UpdateBlogPost } from '@/services/blog-api';
import { Loader2, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { cn } from "@/lib/utils"; // Import cn utility
import { format } from 'date-fns';


const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  content: z.string().min(1, 'Content is required'),
  image: z.instanceof(File).optional().nullable(), // Allow null or undefined for optional image
});

type PostFormValues = z.infer<typeof postSchema>;

interface BlogPostFormProps {
  onSubmit: (data: CreateBlogPost | UpdateBlogPost) => Promise<void>;
  initialData?: BlogPost | null; // For editing
  isLoading: boolean;
  submitButtonText?: string;
}

export default function BlogPostForm({
  onSubmit,
  initialData = null,
  isLoading,
  submitButtonText = initialData ? 'Update Post' : 'Create Post'
}: BlogPostFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image || null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      image: undefined, // Initialize as undefined
    },
  });

  // Reset form if initialData changes (e.g., navigating between edit pages)
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
        image: undefined, // Don't repopulate file input
      });
      setPreviewImage(initialData.image || null);
    } else {
      form.reset({ title: '', content: '', image: undefined });
      setPreviewImage(null);
    }
  }, [initialData, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file, { shouldValidate: true }); // Update RHF state and trigger validation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('image', undefined); // Set back to undefined if no file selected
      setPreviewImage(initialData?.image || null); // Revert to initial or null if no file selected
    }
  };

  const handleSubmit = async (data: PostFormValues) => {
    const submissionData: CreateBlogPost = {
      title: data.title,
      content: data.content,
      image: data.image instanceof File ? data.image : undefined,
    };
  
    await onSubmit(submissionData);
  };  
  
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };
  


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {initialData ? 'Edit Post' : 'Create New Post'}
            </CardTitle>
            <CardDescription className="text-center">
              {initialData ? 'Update the details of your post.' : 'Share your thoughts with the world.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Amazing Blog Post Title" {...field} aria-required="true" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your blog post content here..." {...field} rows={10} aria-required="true" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange: _onChange, value, ...rest } }) => ( // Exclude RHF's onChange
                <FormItem>
                  <FormLabel>Featured Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Label htmlFor="image-upload" className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer inline-flex items-center")}>
                        <Upload className="mr-2 h-4 w-4" />
                        {previewImage ? 'Change Image' : 'Upload Image'}
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/gif" // Be specific about accepted types
                        className="hidden"
                        onChange={handleImageChange} // Use our custom handler
                        {...rest} // Pass rest props like name, ref etc.
                      />
                      {previewImage && (
                        <div className="relative w-24 h-24 rounded border overflow-hidden shadow-sm">
                          <Image src={previewImage} alt="Preview" layout="fill" objectFit="cover" />
                          {/* Optional: Add a button to remove the image */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-80 hover:opacity-100"
                            onClick={() => {
                              form.setValue('image', null); // Signal removal maybe? Or just undefined
                              setPreviewImage(null);
                            }}
                            aria-label="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitButtonText}
            </Button>
            {initialData?.created_at && (
              <p className="text-sm text-gray-500 text-center">
                Created_at: {format(new Date(initialData.created_at), 'PPp')}
              </p>
            )}
            {initialData?.updated_at && (
              <p className="text-sm text-gray-500 text-center">
                Last updated: {format(new Date(initialData.updated_at), 'PPp')}
              </p>
            )}

          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
