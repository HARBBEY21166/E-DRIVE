import { supabase, getUserProfile } from "./supabase"
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"

// Register for native Google authentication
WebBrowser.maybeCompleteAuthSession()

// Replace with your Google OAuth client IDs
const GOOGLE_CLIENT_ID_ANDROID = "YOUR_ANDROID_CLIENT_ID"
const GOOGLE_CLIENT_ID_IOS = "YOUR_IOS_CLIENT_ID"
const GOOGLE_CLIENT_ID_WEB = "387905480988-tmcg84vfo0n42aa6oj1pn6loj2h4lppn.apps.googleusercontent.com"

// User interface
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
}

// Auth state
export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

// Initial auth state
export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
}

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<AuthState> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        ...initialAuthState,
        error: error.message,
      }
    }

    // Get user profile data
    const profile = await getUserProfile(data.user.id)

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.name || data.user.email!.split("@")[0],
      phone: profile?.phone,
      avatar: profile?.avatar_url,
    }

    return {
      user,
      token: data.session.access_token,
      isLoading: false,
      error: null,
    }
  } catch (error: any) {
    return {
      ...initialAuthState,
      error: error.message || "An error occurred during sign in",
    }
  }
}

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string, name: string, phone?: string): Promise<AuthState> => {
  try {
    // Create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return {
        ...initialAuthState,
        error: error.message,
      }
    }

    if (!data.user) {
      return {
        ...initialAuthState,
        error: "Email confirmation required. Please check your inbox.",
      }
    }

    // Create user profile
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        name,
        phone,
        avatar_url: null,
        created_at: new Date(),
      },
    ])

    if (profileError) {
      console.error("Error creating profile:", profileError)
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      name,
      phone,
      avatar: null,
    }

    return {
      user,
      token: data.session?.access_token || null,
      isLoading: false,
      error: null,
    }
  } catch (error: any) {
    return {
      ...initialAuthState,
      error: error.message || "An error occurred during sign up",
    }
  }
}

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Error signing out:", error)
  }
}

/**
 * Get current auth state
 */
export const getAuthState = async (): Promise<AuthState> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return initialAuthState
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return initialAuthState
    }

    // Get user profile data
    const profile = await getUserProfile(user.id)

    const userData: User = {
      id: user.id,
      email: user.email!,
      name: profile?.name || user.email!.split("@")[0],
      phone: profile?.phone,
      avatar: profile?.avatar_url,
    }

    return {
      user: userData,
      token: session.access_token,
      isLoading: false,
      error: null,
    }
  } catch (error) {
    return initialAuthState
  }
}

/**
 * Hook for Google Sign In
 */
export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    webClientId: GOOGLE_CLIENT_ID_WEB,
    expoClientId: GOOGLE_CLIENT_ID_WEB,
  })

  return { request, response, promptAsync }
}

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (accessToken: string): Promise<AuthState> => {
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: accessToken,
    })

    if (error) {
      return {
        ...initialAuthState,
        error: error.message,
      }
    }

    // Check if profile exists, if not create it
    let profile = await getUserProfile(data.user.id)

    if (!profile) {
      // Create user profile
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          name: data.user.user_metadata.full_name || data.user.email!.split("@")[0],
          avatar_url: data.user.user_metadata.avatar_url,
          created_at: new Date(),
        },
      ])

      profile = await getUserProfile(data.user.id)
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.name || data.user.user_metadata.full_name || data.user.email!.split("@")[0],
      phone: profile?.phone,
      avatar: profile?.avatar_url || data.user.user_metadata.avatar_url,
    }

    return {
      user,
      token: data.session.access_token,
      isLoading: false,
      error: null,
    }
  } catch (error: any) {
    return {
      ...initialAuthState,
      error: error.message || "An error occurred during Google sign in",
    }
  }
}

