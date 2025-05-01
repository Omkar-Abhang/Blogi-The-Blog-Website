import type { BlogPost } from '@/services/blog-api';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPostCardProps {
  post: BlogPost;
  showActions?: boolean; // To show edit/delete buttons
  onDelete?: (id: string) => void; // Callback for delete action
}

export default function BlogPostCard({ post, showActions = false, onDelete }: BlogPostCardProps) {
  const formattedCreatedAt = post.created_at ? format(new Date(post.created_at), 'PPp') : 'Unknown';
  const formattedUpdatedAt = post.updated_at ? format(new Date(post.updated_at), 'PPp') : 'Unknown';

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id.toString());
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
      {post.image && (
        <div className="relative w-full h-48">
          <Image
            src={post.image?.startsWith('http') ? post.image : 'https://picsum.photos/400/200'}
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />

        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold hover:text-primary transition-colors">
          <Link href={`/posts/${post.id}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
          <User className="w-4 h-4 mr-1" /> {post.author?.username || 'Anonymous'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0 pb-3">
        {/* Display a snippet of the content */}
        <p className="text-foreground line-clamp-3">{post.content}</p>
        <Link href={`/posts/${post.id.toString}`} className="text-primary hover:underline text-sm mt-2 inline-block">
          Read More
        </Link>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between items-center pt-2 border-t mt-auto">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Created: {formattedCreatedAt}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>Updated: {formattedUpdatedAt}</span>
          </div>
        </div>
        {showActions && onDelete && (
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/posts/${post.id.toString}`} title="Edit Post">
                <Edit className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Post">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
