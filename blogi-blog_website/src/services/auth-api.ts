import { getAuthHeaders, getAuthToken } from '@/lib/auth'; // Use auth helpers

/**
 * Represents user credentials for authentication.
 */
export interface UserCredentials {
  username: string;
  password: string;
}

/**
 * Represents user registration data.
 */
export interface UserRegistrationData extends UserCredentials {
  email: string;
}

/**
 * Represents the authentication response from the API (e.g., FastAPI OAuth2).
 */
export interface AuthResponse {
  access_token: string;
  token_type: string; // Usually 'bearer'
}

// Use environment variable for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Default fallback

async function handleAuthResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      // Try to parse error details from the backend response
      errorData = await response.json();
    } catch (e) {
      // If parsing fails, use the status text
      errorData = { detail: response.statusText };
    }
    console.error("Auth API Error:", response.status, errorData);
    // Throw an error object that includes status and potential details
    const error = new Error(errorData?.detail || `HTTP error! status: ${response.status}`) as any;
    error.status = response.status;
    error.response = response; // Attach response for more context
    error.data = errorData;
    throw error;
  }
  // Ensure response has content before parsing JSON (for potential 204 cases, though unlikely for auth)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
     return response.json() as Promise<T>;
   } else {
     // Handle cases like 204 No Content or non-JSON success responses if they occur
     return Promise.resolve(undefined as T);
   }
}


/**
 * Asynchronously registers a new user.
 * @param registrationData The registration data for the new user.
 * @returns A promise that resolves to an AuthResponse object containing the JWT token.
 */
export async function registerUser(registrationData: UserRegistrationData): Promise<AuthResponse> {
   // console.log(`Registering user at: ${API_BASE_URL}/auth/register`); // Debugging removed
    // API expects JSON for registration based on common practice (adjust if needed)
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData), // Send as JSON
    });
    return handleAuthResponse<AuthResponse>(response);
}

/**
 * Asynchronously logs in an existing user.
 * @param credentials The user's credentials.
 * @returns A promise that resolves to an AuthResponse object containing the JWT token.
 */
export async function loginUser(credentials: UserCredentials): Promise<AuthResponse> {
    console.log(`Logging in user at: ${API_BASE_URL}/login`); // Debugging removed
    // FastAPI OAuth2PasswordRequestForm expects form data for the token endpoint
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
  });
  
  const text = await response.text();
  console.log("Raw login response:", text);
  return handleAuthResponse<AuthResponse>(new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
  }));
  
}

/**
 * Asynchronously logs out the current user (backend call).
 * @returns A promise that resolves to void on success.
 */
export async function logoutUser(): Promise<void> {
  // console.log(`Calling backend logout endpoint: ${API_BASE_URL}/auth/logout`); // Debugging removed
   try {
     const response = await fetch(`${API_BASE_URL}/logout`, {
       method: 'POST', // Or GET depending on your API design
       headers: getAuthHeaders(), // Send token to invalidate
     });
     // Check if logout was successful or if token was already invalid (e.g., 401)
     if (response.ok || response.status === 401) {
        // console.log("Backend logout successful or token already invalid."); // Debugging removed
        return Promise.resolve();
     } else {
        // Handle other errors
        await handleAuthResponse<void>(response); // This will throw for non-ok statuses other than 401 handled above
     }
   } catch (error) {
     console.warn("Backend logout call failed:", error);
     // Decide if frontend should still proceed with logout even if backend fails
     // For robustness, we might still want to clear the token locally.
     // The `useAuth` hook handles local token removal separately.
     throw error; // Re-throw to allow calling code to potentially handle it
   }
}
