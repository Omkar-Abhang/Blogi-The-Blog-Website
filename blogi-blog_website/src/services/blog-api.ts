import { getAuthHeaders, getAuthToken } from '@/lib/auth';

/**
 * Represents a blog post.
 */

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    username: string;
  };
}

/**
 * Represents the data required to create a new blog post.
 * Allows image to be a File object or undefined.
 */
export interface CreateBlogPost {
  title: string;
  content: string;
  image?: File; // Image is optional
}

/**
 * Represents the data required to update an existing blog post.
 * All fields are optional, including the image.
 */
export interface UpdateBlogPost {
  title?: string;
  content?: string;
  image?: File; // Image is optional
}

// Use environment variable for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Default fallback

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      // Try to parse error details from the backend response
      errorData = await response.json();
    } catch (e) {
      // If parsing fails, use the status text
      errorData = { detail: response.statusText };
    }
    console.error("API Error:", response.status, errorData);
    // Throw an error object that includes status and potential details
    const error = new Error(errorData?.detail || `HTTP error! status: ${response.status}`) as any;
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  // Check if response has content before trying to parse JSON
   const contentType = response.headers.get("content-type");
   if (contentType && contentType.indexOf("application/json") !== -1) {
     return response.json() as Promise<T>;
   } else {
     // Handle responses with no content (like 204 No Content) or non-JSON responses
     return Promise.resolve(undefined as T);
   }
}


/**
 * Asynchronously retrieves all blog posts.
 * @returns A promise that resolves to an array of BlogPost objects.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
    // console.log(`Fetching posts from: ${API_BASE_URL}/posts/`); // Debugging removed
    const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // No auth needed for listing posts as per requirements (usually)
        },
    });
    return handleResponse<BlogPost[]>(response);
}

/**
 * Asynchronously retrieves a blog post by its ID.
 * @param id The ID of the blog post to retrieve.
 * @returns A promise that resolves to a BlogPost object or null if not found (handled by API returning 404).
 */
export async function getBlogPost(id: string): Promise<BlogPost | null> {
     // console.log(`Fetching post ${id} from: ${API_BASE_URL}/posts/${id}`); // Debugging removed
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    // Handle 404 specifically if needed, otherwise handleResponse throws
    if (response.status === 404) {
        return null;
    }
    return handleResponse<BlogPost>(response);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}


/**
 * Asynchronously creates a new blog post. Handles optional image upload.
 * @param blogPost The data for the new blog post, including an optional image File.
 * @returns A promise that resolves to the created BlogPost object.
 */
export async function createBlogPost(blogPost: CreateBlogPost): Promise<BlogPost> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  let imageBase64 = "";
  if (blogPost.image) {
    imageBase64 = await fileToBase64(blogPost.image);
  }

  const body = JSON.stringify({
    title: blogPost.title,
    content: blogPost.content,
    image: imageBase64, // This is what your backend expects
  });

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body,
  });

  return handleResponse<BlogPost>(response);
}


/**
 * Asynchronously updates an existing blog post. Handles optional image upload.
 * @param id The ID of the blog post to update.
 * @param updates The data to update on the blog post, including an optional image File.
 * @returns A promise that resolves to the updated BlogPost object.
 */
export async function updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost> {
  console.log(`Updating post ${id} at: ${API_BASE_URL}/posts/${id}`); // Debugging
  const formData = new FormData();
  // Only append fields that are provided in the updates object
  if (updates.title !== undefined) {
    formData.append('title', updates.title);
  }
  if (updates.content !== undefined) {
    formData.append('content', updates.content);
  }
   if (updates.image) {
    formData.append('image', updates.image);
  }

    const token = getAuthToken();
    if (!token) {
        throw new Error("Authentication token not found. Please log in.");
    }

  // Use PATCH for partial updates, assuming the API supports it for flexibility.
  // If the API requires PUT for updates (replacing the whole resource), change method to 'PUT'.
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'PUT', // Or 'PUT' if API requires full replacement
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData,
  });
  return handleResponse<BlogPost>(response);
}


/**
 * Asynchronously deletes a blog post by its ID.
 * @param id The ID of the blog post to delete.
 * @returns A promise that resolves to void.
 */
export async function deleteBlogPost(id: string): Promise<void> {
    // console.log(`Deleting post ${id} at: ${API_BASE_URL}/posts/${id}`); // Debugging removed
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(), // Auth required for deletion
    });
    // HandleResponse will throw for non-2xx status codes.
    // A successful DELETE might return 204 No Content, which handleResponse handles.
    await handleResponse<void>(response);
}

/**
 * Asynchronously searches blog posts by title or content.
 * @param query The search query.
 * @returns A promise that resolves to an array of matching BlogPost objects.
 */
export async function searchBlogPosts(query: string): Promise<BlogPost[]> {
     // console.log(`Searching posts with query "${query}" at: ${API_BASE_URL}/posts/search/`); // Debugging removed
    const response = await fetch(`${API_BASE_URL}/posts?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
             'Content-Type': 'application/json',
        },
    });
    return handleResponse<BlogPost[]>(response);
}
