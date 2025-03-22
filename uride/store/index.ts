import { create } from "zustand"
import { getAuthState, signIn, signOut, signUp, signInWithGoogle } from "../lib/auth"
import { supabase } from "../lib/supabase"
import type { LocationDetails } from "../lib/map"
import { clearAllCache } from "../lib/cache"

// User interface
interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
}

// Ride interface
interface Ride {
  id: string
  userId: string
  driverId?: string
  status: "pending" | "accepted" | "ongoing" | "completed" | "cancelled"
  pickup: LocationDetails
  destination: LocationDetails
  price: number
  distance: number
  duration: number
  createdAt: Date
  scheduledFor?: Date
  driver?: Driver
}

// Driver interface
interface Driver {
  id: string
  name: string
  rating: number
  car: {
    model: string
    color: string
    licensePlate: string
  }
  location: LocationDetails
  isAvailable: boolean
  avatar?: string
}

// Payment method interface
interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "cash"
  name: string
  details: string
  isDefault: boolean
}

// Message interface
interface Message {
  id: string
  text: string
  sender: "user" | "driver" | "system"
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "read" | "error"
}

// App state interface
interface AppState {
  // Auth state
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null

  // Ride state
  currentRide: Ride | null
  rides: Ride[]

  // Location state
  currentLocation: LocationDetails | null
  selectedPickup: LocationDetails | null
  selectedDestination: LocationDetails | null

  // Driver state
  nearbyDrivers: Driver[]
  selectedDriver: Driver | null

  // Payment state
  paymentMethods: PaymentMethod[]
  selectedPaymentMethod: string | null

  // Chat state
  messages: Message[]

  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>
  logout: () => Promise<void>
  loginWithGoogle: (accessToken: string) => Promise<boolean>

  // Profile actions
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>

  setCurrentLocation: (location: LocationDetails | null) => void
  setSelectedPickup: (location: LocationDetails | null) => void
  setSelectedDestination: (location: LocationDetails | null) => void

  setNearbyDrivers: (drivers: Driver[]) => void
  setSelectedDriver: (driver: Driver | null) => void

  setPaymentMethods: (methods: PaymentMethod[]) => void
  setSelectedPaymentMethod: (methodId: string | null) => void

  createRide: (ride: Partial<Ride>) => Promise<Ride | null>
  updateRide: (rideId: string, updates: Partial<Ride>) => Promise<Ride | null>
  cancelRide: (rideId: string) => Promise<boolean>
  fetchRides: () => Promise<Ride[]>

  // Chat actions
  sendMessage: (text: string) => Promise<boolean>
  getMessages: () => Promise<Message[]>
}

// Create store
export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  currentRide: null,
  rides: [],

  currentLocation: null,
  selectedPickup: null,
  selectedDestination: null,

  nearbyDrivers: [],
  selectedDriver: null,

  paymentMethods: [],
  selectedPaymentMethod: null,

  messages: [],

  // Actions
  initialize: async () => {
    try {
      const authState = await getAuthState()

      set({
        user: authState.user,
        token: authState.token,
        isAuthenticated: !!authState.token,
        isLoading: false,
        authError: null,
      })
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authError: "Failed to initialize app",
      })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, authError: null })

    try {
      const authState = await signIn(email, password)

      set({
        user: authState.user,
        token: authState.token,
        isAuthenticated: !!authState.token,
        isLoading: false,
        authError: authState.error,
      })

      return !!authState.token
    } catch (error) {
      set({
        isLoading: false,
        authError: "An error occurred during login",
      })

      return false
    }
  },

  register: async (email, password, name, phone) => {
    set({ isLoading: true, authError: null })

    try {
      const authState = await signUp(email, password, name, phone)

      set({
        user: authState.user,
        token: authState.token,
        isAuthenticated: !!authState.token,
        isLoading: false,
        authError: authState.error,
      })

      return !!authState.token
    } catch (error) {
      set({
        isLoading: false,
        authError: "An error occurred during registration",
      })

      return false
    }
  },

  logout: async () => {
    set({ isLoading: true })

    try {
      await signOut()
      await clearAllCache()

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
        currentRide: null,
        rides: [],
        selectedPickup: null,
        selectedDestination: null,
        selectedDriver: null,
        selectedPaymentMethod: null,
        messages: [],
      })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  loginWithGoogle: async (accessToken) => {
    set({ isLoading: true, authError: null })

    try {
      const authState = await signInWithGoogle(accessToken)

      set({
        user: authState.user,
        token: authState.token,
        isAuthenticated: !!authState.token,
        isLoading: false,
        authError: authState.error,
      })

      return !!authState.token
    } catch (error) {
      set({
        isLoading: false,
        authError: "An error occurred during Google login",
      })

      return false
    }
  },

  updateUserProfile: async (updates) => {
    try {
      const userId = get().user?.id

      if (!userId) {
        throw new Error("User not authenticated")
      }

      // Update profile in Supabase
      const { error } = await supabase.from("profiles").update(updates).eq("id", userId)

      if (error) {
        console.error("Error updating profile:", error)
        return false
      }

      // Update local state
      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      }))

      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  },

  setCurrentLocation: (location) => {
    set({ currentLocation: location })
  },

  setSelectedPickup: (location) => {
    set({ selectedPickup: location })
  },

  setSelectedDestination: (location) => {
    set({ selectedDestination: location })
  },

  setNearbyDrivers: (drivers) => {
    set({ nearbyDrivers: drivers })
  },

  setSelectedDriver: (driver) => {
    set({ selectedDriver: driver })
  },

  setPaymentMethods: (methods) => {
    set({ paymentMethods: methods })
  },

  setSelectedPaymentMethod: (methodId) => {
    set({ selectedPaymentMethod: methodId })
  },

  createRide: async (ride) => {
    try {
      // Get the current user
      const userId = get().user?.id

      if (!userId) {
        throw new Error("User not authenticated")
      }

      // Create the ride in Supabase
      const { data, error } = await supabase
        .from("rides")
        .insert([
          {
            user_id: userId,
            status: "pending",
            pickup_address: ride.pickup?.address,
            pickup_lat: ride.pickup?.coordinates.latitude,
            pickup_lng: ride.pickup?.coordinates.longitude,
            destination_address: ride.destination?.address,
            destination_lat: ride.destination?.coordinates.latitude,
            destination_lng: ride.destination?.coordinates.longitude,
            price: ride.price || 0,
            distance: ride.distance || 0,
            duration: ride.duration || 0,
            created_at: new Date().toISOString(),
            scheduled_for: ride.scheduledFor?.toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating ride:", error)
        return null
      }

      // Convert the Supabase data to our Ride format
      const newRide: Ride = {
        id: data.id,
        userId: data.user_id,
        driverId: data.driver_id,
        status: data.status,
        pickup: {
          coordinates: {
            latitude: data.pickup_lat,
            longitude: data.pickup_lng,
          },
          address: data.pickup_address,
        },
        destination: {
          coordinates: {
            latitude: data.destination_lat,
            longitude: data.destination_lng,
          },
          address: data.destination_address,
        },
        price: data.price,
        distance: data.distance,
        duration: data.duration,
        createdAt: new Date(data.created_at),
        scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
      }

      set((state) => ({
        currentRide: newRide,
        rides: [newRide, ...state.rides],
      }))

      return newRide
    } catch (error) {
      console.error("Error in createRide:", error)
      return null
    }
  },

  updateRide: async (rideId, updates) => {
    try {
      // Prepare the updates for Supabase format
      const supabaseUpdates: any = {}

      if (updates.status) supabaseUpdates.status = updates.status
      if (updates.driverId) supabaseUpdates.driver_id = updates.driverId

      if (updates.pickup) {
        supabaseUpdates.pickup_address = updates.pickup.address
        supabaseUpdates.pickup_lat = updates.pickup.coordinates.latitude
        supabaseUpdates.pickup_lng = updates.pickup.coordinates.longitude
      }

      if (updates.destination) {
        supabaseUpdates.destination_address = updates.destination.address
        supabaseUpdates.destination_lat = updates.destination.coordinates.latitude
        supabaseUpdates.destination_lng = updates.destination.coordinates.longitude
      }

      if (updates.price !== undefined) supabaseUpdates.price = updates.price
      if (updates.distance !== undefined) supabaseUpdates.distance = updates.distance
      if (updates.duration !== undefined) supabaseUpdates.duration = updates.duration
      if (updates.scheduledFor) supabaseUpdates.scheduled_for = updates.scheduledFor.toISOString()

      // Update in Supabase
      const { data, error } = await supabase.from("rides").update(supabaseUpdates).eq("id", rideId).select().single()

      if (error) {
        console.error("Error updating ride:", error)
        return null
      }

      // Convert the Supabase data to our Ride format
      const updatedRide: Ride = {
        id: data.id,
        userId: data.user_id,
        driverId: data.driver_id,
        status: data.status,
        pickup: {
          coordinates: {
            latitude: data.pickup_lat,
            longitude: data.pickup_lng,
          },
          address: data.pickup_address,
        },
        destination: {
          coordinates: {
            latitude: data.destination_lat,
            longitude: data.destination_lng,
          },
          address: data.destination_address,
        },
        price: data.price,
        distance: data.distance,
        duration: data.duration,
        createdAt: new Date(data.created_at),
        scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
      }

      // Update in local state
      set((state) => {
        const rideIndex = state.rides.findIndex((r) => r.id === rideId)

        if (rideIndex === -1) {
          return state
        }

        const updatedRides = [...state.rides]
        updatedRides[rideIndex] = updatedRide

        return {
          rides: updatedRides,
          currentRide: state.currentRide?.id === rideId ? updatedRide : state.currentRide,
        }
      })

      return updatedRide
    } catch (error) {
      console.error("Error in updateRide:", error)
      return null
    }
  },

  cancelRide: async (rideId) => {
    try {
      // Update the ride status to cancelled in Supabase
      const { error } = await supabase.from("rides").update({ status: "cancelled" }).eq("id", rideId)

      if (error) {
        console.error("Error cancelling ride:", error)
        return false
      }

      // Update in local state
      set((state) => {
        const rideIndex = state.rides.findIndex((r) => r.id === rideId)

        if (rideIndex === -1) {
          return state
        }

        const updatedRides = [...state.rides]
        updatedRides[rideIndex] = { ...updatedRides[rideIndex], status: "cancelled" }

        return {
          rides: updatedRides,
          currentRide: state.currentRide?.id === rideId ? null : state.currentRide,
        }
      })

      return true
    } catch (error) {
      console.error("Error in cancelRide:", error)
      return false
    }
  },

  fetchRides: async () => {
    try {
      const userId = get().user?.id

      if (!userId) {
        return []
      }

      // Fetch rides from Supabase
      const { data, error } = await supabase
        .from("rides")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching rides:", error)
        return []
      }

      // Convert the Supabase data to our Ride format
      const rides: Ride[] = data.map((ride) => ({
        id: ride.id,
        userId: ride.user_id,
        driverId: ride.driver_id,
        status: ride.status,
        pickup: {
          coordinates: {
            latitude: ride.pickup_lat,
            longitude: ride.pickup_lng,
          },
          address: ride.pickup_address,
        },
        destination: {
          coordinates: {
            latitude: ride.destination_lat,
            longitude: ride.destination_lng,
          },
          address: ride.destination_address,
        },
        price: ride.price,
        distance: ride.distance,
        duration: ride.duration,
        createdAt: new Date(ride.created_at),
        scheduledFor: ride.scheduled_for ? new Date(ride.scheduled_for) : undefined,
      }))

      set({ rides })

      return rides
    } catch (error) {
      console.error("Error in fetchRides:", error)
      return []
    }
  },

  // Chat methods
  sendMessage: async (text) => {
    try {
      const userId = get().user?.id
      const currentRide = get().currentRide

      if (!userId || !currentRide) {
        throw new Error("User not authenticated or no active ride")
      }

      // In a real app, you would send the message to your API
      // For this example, we'll just simulate a successful send

      // Add message to local state
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: "user",
        timestamp: new Date(),
        status: "sent",
      }

      set((state) => ({
        messages: [...state.messages, newMessage],
      }))

      return true
    } catch (error) {
      console.error("Error sending message:", error)
      return false
    }
  },

  getMessages: async () => {
    try {
      const userId = get().user?.id
      const currentRide = get().currentRide

      if (!userId) {
        return []
      }

      // In a real app, you would fetch messages from your API
      // For this example, we'll return mock messages

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockMessages: Message[] = [
        {
          id: "1",
          text: "Your ride has been confirmed.",
          sender: "system",
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          status: "delivered",
        },
        {
          id: "2",
          text: "I am on my way to pick you up.",
          sender: "driver",
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          status: "delivered",
        },
        {
          id: "3",
          text: "Great! I'll be waiting outside.",
          sender: "user",
          timestamp: new Date(Date.now() - 1700000), // 28 minutes ago
          status: "read",
        },
        {
          id: "4",
          text: "I'm stuck in a bit of traffic. Will be there in about 5 minutes.",
          sender: "driver",
          timestamp: new Date(Date.now() - 900000), // 15 minutes ago
          status: "delivered",
        },
        {
          id: "5",
          text: "No problem, take your time.",
          sender: "user",
          timestamp: new Date(Date.now() - 800000), // 13 minutes ago
          status: "read",
        },
      ]

      set({ messages: mockMessages })

      return mockMessages
    } catch (error) {
      console.error("Error fetching messages:", error)
      return []
    }
  },
}))

export default useStore

