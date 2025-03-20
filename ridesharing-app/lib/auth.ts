import * as SecureStore from "expo-secure-store"

// Mock user data
interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
}

// Auth state
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
}

// Storage keys
const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<AuthState> => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock validation
    if (email !== "user@example.com" || password !== "password") {
      return {
        ...initialAuthState,
        error: "Invalid email or password",
      }
    }

    // Mock successful response
    const user: User = {
      id: "1",
      email: "user@example.com",
      name: "John Doe",
      phone: "+1234567890",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    }

    const token = "mock_token_" + Math.random().toString(36).substring(2)

    // Store in secure storage
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))

    return {
      user,
      token,
      isLoading: false,
      error: null,
    }
  } catch (error) {
    return {
      ...initialAuthState,
      error: "An error occurred during sign in",
    }
  }
}

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string, name: string, phone?: string): Promise<AuthState> => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful response
    const user: User = {
      id: "1",
      email,
      name,
      phone,
    }

    const token = "mock_token_" + Math.random().toString(36).substring(2)

    // Store in secure storage
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))

    return {
      user,
      token,
      isLoading: false,
      error: null,
    }
  } catch (error) {
    return {
      ...initialAuthState,
      error: "An error occurred during sign up",
    }
  }
}

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_KEY)
  } catch (error) {
    console.error("Error signing out:", error)
  }
}

/**
 * Get current auth state
 */
export const getAuthState = async (): Promise<AuthState> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    const userString = await SecureStore.getItemAsync(USER_KEY)

    if (!token || !userString) {
      return initialAuthState
    }

    const user = JSON.parse(userString) as User

    return {
      user,
      token,
      isLoading: false,
      error: null,
    }
  } catch (error) {
    return initialAuthState
  }
}

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthState> => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful response
    const user: User = {
      id: "2",
      email: "google@example.com",
      name: "Google User",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    }

    const token = "mock_google_token_" + Math.random().toString(36).substring(2)

    // Store in secure storage
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))

    return {
      user,
      token,
      isLoading: false,
      error: null,
    }
  } catch (error) {
    return {
      ...initialAuthState,
      error: "An error occurred during Google sign in",
    }
  }
}

