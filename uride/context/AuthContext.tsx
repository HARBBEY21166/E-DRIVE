"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { supabase } from "../lib/supabase"
import type { User, UserType } from "../types/type"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"

// Register for native Google authentication
WebBrowser.maybeCompleteAuthSession()

// Auth context interface
interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  userType: UserType | null

  // Auth methods
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, userType: UserType, phone?: string) => Promise<boolean>
  loginWithGoogle: (userType: UserType) => Promise<boolean>
  logout: () => Promise<void>

  // Profile methods
  updateProfile: (updates: Partial<User>) => Promise<boolean>

  // Driver methods
  updateDriverDetails: (updates: any) => Promise<boolean>
  toggleDriverMode: (isActive: boolean) => Promise<boolean>

  // User type methods
  switchUserType: (newType: UserType) => Promise<boolean>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType | null>(null)

  // Google Sign-In setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "387905480988-c6obtge7ju9j2b6fv3t6t1255g4o89ou.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    webClientId: "387905480988-tmcg84vfo0n42aa6oj1pn6loj2h4lppn.apps.googleusercontent.com",
    expoClientId: "YOUR_WEB_CLIENT_ID",
  })

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)

      try {
        // Check for existing session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // Get user data
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser()

          if (authUser) {
            try {
              // Get user profile from database
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", authUser.id)
                .single()

              if (profileError) {
                console.error("Error fetching profile:", profileError)
                setUser(null)
                setUserType(null)
              } else {
                // Create user object
                const userData: User = {
                  id: authUser.id,
                  email: authUser.email!,
                  name: profile?.name || authUser.email!.split("@")[0],
                  phone: profile?.phone,
                  avatar: profile?.avatar_url,
                  userType: profile?.user_type || "rider",
                  isVerified: authUser.email_confirmed_at != null,
                  createdAt: new Date(profile?.created_at || Date.now()),
                  driverDetails: profile?.driver_details,
                }

                setUser(userData)
                setUserType(userData.userType)

                // Store last used user type
                await AsyncStorage.setItem("lastUserType", userData.userType)
              }
            } catch (profileErr) {
              console.error("Profile fetch error:", profileErr)
              // Create a basic user object to prevent crashes
              const basicUserData: User = {
                id: authUser.id,
                email: authUser.email!,
                name: authUser.email!.split("@")[0],
                userType: "rider",
                isVerified: authUser.email_confirmed_at != null,
                createdAt: new Date(),
              }
              setUser(basicUserData)
              setUserType("rider")
            }
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err)
        setError("Failed to initialize authentication")
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Refresh user data
        initAuth()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserType(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === "success" && response.authentication) {
      handleGoogleAuthResponse(response.authentication.accessToken)
    }
  }, [response])

  // Login with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return false
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        setError("Failed to fetch user profile")
        return false
      }

      // Create user object
      const userData: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profile.name || data.user.email!.split("@")[0],
        phone: profile.phone,
        avatar: profile.avatar_url,
        userType: profile.user_type || "rider",
        isVerified: data.user.email_confirmed_at != null,
        createdAt: new Date(profile.created_at),
        driverDetails: profile.driver_details,
      }

      setUser(userData)
      setUserType(userData.userType)

      // Store last used user type
      await AsyncStorage.setItem("lastUserType", userData.userType)

      return true
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred during login")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Register new user
  const register = async (
    email: string,
    password: string,
    name: string,
    userType: UserType,
    phone?: string,
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Create user in auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return false
      }

      if (!data.user) {
        setError("Failed to create user")
        return false
      }

      // Create user profile
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          name,
          phone,
          user_type: userType,
          avatar_url: null,
          created_at: new Date().toISOString(),
          driver_details:
            userType === "driver"
              ? {
                  isActive: false,
                  isApproved: false,
                  rating: 0,
                  totalRides: 0,
                  earnings: {
                    total: 0,
                    today: 0,
                    week: 0,
                    month: 0,
                  },
                }
              : null,
        },
      ])

      if (profileError) {
        console.error("Error creating profile:", profileError)
        setError("Failed to create user profile")
        return false
      }

      // If session exists, user is automatically signed in
      if (data.session) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email!,
          name,
          phone,
          avatar: null,
          userType,
          isVerified: data.user.email_confirmed_at != null,
          createdAt: new Date(),
          driverDetails:
            userType === "driver"
              ? {
                  licenseNumber: "",
                  licenseExpiry: new Date(),
                  vehicleDetails: {
                    make: "",
                    model: "",
                    year: new Date().getFullYear(),
                    color: "",
                    licensePlate: "",
                    vehicleType: "standard",
                    seats: 4,
                  },
                  isActive: false,
                  isApproved: false,
                  rating: 0,
                  totalRides: 0,
                  earnings: {
                    total: 0,
                    today: 0,
                    week: 0,
                    month: 0,
                  },
                  documents: {},
                }
              : undefined,
        }

        setUser(userData)
        setUserType(userType)

        // Store last used user type
        await AsyncStorage.setItem("lastUserType", userType)
      }

      return true
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred during registration")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Login with Google
  const loginWithGoogle = async (userType: UserType): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Store user type preference for after auth
      await AsyncStorage.setItem("pendingUserType", userType)

      // Trigger Google Sign-In
      await promptAsync()

      // The result will be handled in the useEffect for response
      return true
    } catch (err) {
      console.error("Google login error:", err)
      setError("Failed to sign in with Google")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google auth response
  const handleGoogleAuthResponse = async (accessToken: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Sign in with Google token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: accessToken,
      })

      if (error) {
        setError(error.message)
        return false
      }

      // Get pending user type
      const pendingUserType = ((await AsyncStorage.getItem("pendingUserType")) as UserType) || "rider"

      // Check if profile exists
      const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

      if (!existingProfile) {
        // Create new profile
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            name: data.user.user_metadata.full_name || data.user.email!.split("@")[0],
            user_type: pendingUserType,
            avatar_url: data.user.user_metadata.avatar_url,
            created_at: new Date().toISOString(),
            driver_details:
              pendingUserType === "driver"
                ? {
                    isActive: false,
                    isApproved: false,
                    rating: 0,
                    totalRides: 0,
                    earnings: {
                      total: 0,
                      today: 0,
                      week: 0,
                      month: 0,
                    },
                  }
                : null,
          },
        ])

        if (profileError) {
          console.error("Error creating profile:", profileError)
          setError("Failed to create user profile")
          return false
        }
      }

      // Get updated profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        setError("Failed to fetch user profile")
        return false
      }

      // Create user object
      const userData: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profile.name || data.user.user_metadata.full_name || data.user.email!.split("@")[0],
        phone: profile.phone,
        avatar: profile.avatar_url || data.user.user_metadata.avatar_url,
        userType: profile.user_type || pendingUserType,
        isVerified: data.user.email_confirmed_at != null,
        createdAt: new Date(profile.created_at),
        driverDetails: profile.driver_details,
      }

      setUser(userData)
      setUserType(userData.userType)

      // Store last used user type
      await AsyncStorage.setItem("lastUserType", userData.userType)

      // Clean up pending user type
      await AsyncStorage.removeItem("pendingUserType")

      return true
    } catch (err) {
      console.error("Google auth response error:", err)
      setError("Failed to process Google sign-in")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true)

    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserType(null)
    } catch (err) {
      console.error("Logout error:", err)
      setError("Failed to sign out")
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)
    setError(null)

    try {
      // Prepare updates for Supabase
      const profileUpdates: any = {}

      if (updates.name) profileUpdates.name = updates.name
      if (updates.phone) profileUpdates.phone = updates.phone
      if (updates.avatar) profileUpdates.avatar_url = updates.avatar

      // Update profile in database
      const { error } = await supabase.from("profiles").update(profileUpdates).eq("id", user.id)

      if (error) {
        setError("Failed to update profile")
        return false
      }

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...updates } : null))

      return true
    } catch (err) {
      console.error("Profile update error:", err)
      setError("An unexpected error occurred while updating profile")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update driver details
  const updateDriverDetails = async (updates: any): Promise<boolean> => {
    if (!user || user.userType !== "driver") return false

    setIsLoading(true)
    setError(null)

    try {
      // Get current driver details
      const currentDetails = user.driverDetails || {
        licenseNumber: "",
        licenseExpiry: new Date(),
        vehicleDetails: {
          make: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          licensePlate: "",
          vehicleType: "standard",
          seats: 4,
        },
        isActive: false,
        isApproved: false,
        rating: 0,
        totalRides: 0,
        earnings: {
          total: 0,
          today: 0,
          week: 0,
          month: 0,
        },
        documents: {},
      }

      // Merge updates with current details
      const updatedDetails = {
        ...currentDetails,
        ...updates,
        vehicleDetails: updates.vehicleDetails
          ? { ...currentDetails.vehicleDetails, ...updates.vehicleDetails }
          : currentDetails.vehicleDetails,
        documents: updates.documents ? { ...currentDetails.documents, ...updates.documents } : currentDetails.documents,
      }

      // Update in database
      const { error } = await supabase.from("profiles").update({ driver_details: updatedDetails }).eq("id", user.id)

      if (error) {
        setError("Failed to update driver details")
        return false
      }

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              driverDetails: updatedDetails,
            }
          : null,
      )

      return true
    } catch (err) {
      console.error("Driver details update error:", err)
      setError("An unexpected error occurred while updating driver details")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle driver active status
  const toggleDriverMode = async (isActive: boolean): Promise<boolean> => {
    if (!user || user.userType !== "driver") return false

    setIsLoading(true)
    setError(null)

    try {
      // Get current driver details
      const currentDetails = user.driverDetails || {
        licenseNumber: "",
        licenseExpiry: new Date(),
        vehicleDetails: {
          make: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          licensePlate: "",
          vehicleType: "standard",
          seats: 4,
        },
        isActive: false,
        isApproved: false,
        rating: 0,
        totalRides: 0,
        earnings: {
          total: 0,
          today: 0,
          week: 0,
          month: 0,
        },
        documents: {},
      }

      // Update active status
      const updatedDetails = {
        ...currentDetails,
        isActive,
      }

      // Update in database
      const { error } = await supabase.from("profiles").update({ driver_details: updatedDetails }).eq("id", user.id)

      if (error) {
        setError("Failed to update driver status")
        return false
      }

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              driverDetails: updatedDetails,
            }
          : null,
      )

      return true
    } catch (err) {
      console.error("Driver status update error:", err)
      setError("An unexpected error occurred while updating driver status")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Switch between rider and driver mode
  const switchUserType = async (newType: UserType): Promise<boolean> => {
    if (!user) return false

    // If user is already this type, just return true
    if (user.userType === newType) {
      setUserType(newType)
      return true
    }

    setIsLoading(true)
    setError(null)

    try {
      // If switching to driver for the first time, initialize driver details
      let driverDetails = user.driverDetails

      if (newType === "driver" && !driverDetails) {
        driverDetails = {
          licenseNumber: "",
          licenseExpiry: new Date(),
          vehicleDetails: {
            make: "",
            model: "",
            year: new Date().getFullYear(),
            color: "",
            licensePlate: "",
            vehicleType: "standard",
            seats: 4,
          },
          isActive: false,
          isApproved: false,
          rating: 0,
          totalRides: 0,
          earnings: {
            total: 0,
            today: 0,
            week: 0,
            month: 0,
          },
          documents: {},
        }
      }

      // Update in database
      const { error } = await supabase
        .from("profiles")
        .update({
          user_type: newType,
          driver_details: driverDetails,
        })
        .eq("id", user.id)

      if (error) {
        setError("Failed to switch user type")
        return false
      }

      // Update local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              userType: newType,
              driverDetails,
            }
          : null,
      )

      setUserType(newType)

      // Store last used user type
      await AsyncStorage.setItem("lastUserType", newType)

      return true
    } catch (err) {
      console.error("User type switch error:", err)
      setError("An unexpected error occurred while switching user type")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    userType,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    updateDriverDetails,
    toggleDriverMode,
    switchUserType,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

