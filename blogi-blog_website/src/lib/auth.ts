import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is installed

// Define the expected structure from the login/register API calls BEFORE saving
interface ApiAuthResponse {
  access_token: string; // API returns access_token
  token_type: string;
}

// Define the structure for the decoded JWT payload (adjust based on your token)
interface DecodedToken {
    sub: string; // Subject (usually username or user ID)
    exp: number; // Expiration time (Unix timestamp)
    // Add other claims if present and needed, e.g., email, roles
}

const TOKEN_KEY = 'blogilite_token';

/**
 * Saves the authentication token (access_token) to localStorage.
 * @param authResponse - The response object containing the access_token.
 */
export function saveAuthToken(authResponse: ApiAuthResponse): void {
  if (typeof window !== 'undefined' && authResponse.access_token) {
    localStorage.setItem(TOKEN_KEY, authResponse.access_token);
    // console.log("Token saved to localStorage."); // Debugging removed
  } else {
    // console.warn("No access_token found in authResponse or localStorage not available."); // Debugging removed
  }
}

/**
 * Retrieves the authentication token from localStorage.
 * @returns The token string or null if not found.
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    // console.log("Token retrieved from localStorage:", token ? 'Exists' : 'Not Found'); // Debugging removed
    return token;
  }
  return null;
}

/**
 * Removes the authentication token from localStorage.
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
     // console.log("Token removed from localStorage."); // Debugging removed
  }
}

/**
 * Checks if a user is currently authenticated based on token presence and validity.
 * @returns True if a valid, non-expired token exists, false otherwise.
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) {
    // console.log("Is Authenticated check: No token found", false); // Debugging removed
    return false;
  }
  try {
    const decoded: DecodedToken = jwtDecode(token);
    // Check if token is expired
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
        // console.warn("Token expired."); // Keep warning for expired token
        removeAuthToken(); // Clean up expired token
        // console.log("Is Authenticated check: Token expired", false); // Debugging removed
        return false;
    }
    // console.log("Is Authenticated check: Valid token found", true); // Debugging removed
    return true;
  } catch (error) {
    console.error("Failed to decode token during auth check:", error);
    removeAuthToken(); // Clean up invalid token
    // console.log("Is Authenticated check: Invalid token", false); // Debugging removed
    return false;
  }
}

/**
 * Returns headers object with Authorization bearer token if authenticated.
 * @returns Headers object or an empty object.
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    // Default Content-Type removed, let fetch or specific calls set it
  };
  if (token && isAuthenticated()) { // Ensure token is valid before sending
    headers['Authorization'] = `Bearer ${token}`;
  }
  // console.log("Generated Auth Headers:", headers); // Debugging removed
  return headers;
}


/**
 * Decodes the JWT token to get user information (username).
 * Returns null if token is missing, invalid, or expired.
*/
export function getUserFromToken(): { username: string } | null {
  const token = getAuthToken();
  if (!token) return null;
  try {
    // Decode the token
    const decoded: DecodedToken = jwtDecode(token);

    // Check token expiration
    if (decoded.exp * 1000 < Date.now()) {
      console.warn("Token expired."); // Keep warning
      removeAuthToken(); // Clear expired token
      return null;
    }
    // Assuming the username is stored in the 'sub' (subject) claim
    return { username: decoded.sub };
  } catch (error) {
    console.error("Failed to decode token:", error);
    removeAuthToken(); // Clear invalid token
    return null;
  }
}
