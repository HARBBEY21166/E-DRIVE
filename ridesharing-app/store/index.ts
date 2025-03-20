import { create } from "zustand"
import { getAuthState, signIn, signOut, signUp, signInWithGoogle } from "../lib/auth"
import type { LocationDetails } from "../lib/map"

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

  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<boolean>

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
      })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, authError: null })

    try {
      const authState = await signInWithGoogle()

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
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newRide: Ride = {
      id: Math.random().toString(36).substring(2, 15),
      userId: get().user?.id || "",
      status: "pending",
      pickup: ride.pickup ||
        get().selectedPickup ||
        get().currentLocation || {
          coordinates: { latitude: 0, longitude: 0 },
          address: "Unknown location",
        },
      destination: ride.destination ||
        get().selectedDestination || {
          coordinates: { latitude: 0, longitude: 0 },
          address: "Unknown location",
        },
      price: ride.price || 0,
      distance: ride.distance || 0,
      duration: ride.duration || 0,
      createdAt: new Date(),
      scheduledFor: ride.scheduledFor,
    }

    set((state) => ({
      currentRide: newRide,
      rides: [newRide, ...state.rides],
    }))

    return newRide
  },

  updateRide: async (rideId, updates) => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let updatedRide: Ride | null = null

    set((state) => {
      const rideIndex = state.rides.findIndex((r) => r.id === rideId)

      if (rideIndex === -1) {
        return state
      }

      const updatedRides = [...state.rides]
      updatedRide = { ...updatedRides[rideIndex], ...updates }
      updatedRides[rideIndex] = updatedRide

      return {
        rides: updatedRides,
        currentRide: state.currentRide?.id === rideId ? updatedRide : state.currentRide,
      }
    })

    return updatedRide
  },

  cancelRide: async (rideId) => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let success = false

    set((state) => {
      const rideIndex = state.rides.findIndex((r) => r.id === rideId)

      if (rideIndex === -1) {
        return state
      }

      const updatedRides = [...state.rides]
      updatedRides[rideIndex] = { ...updatedRides[rideIndex], status: "cancelled" }

      success = true

      return {
        rides: updatedRides,
        currentRide: state.currentRide?.id === rideId ? null : state.currentRide,
      }
    })

    return success
  },

  fetchRides: async () => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock data
    const mockRides: Ride[] = [
      {
        id: "1",
        userId: get().user?.id || "",
        driverId: "driver1",
        status: "completed",
        pickup: {
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
          address: "123 Main St, San Francisco, CA",
        },
        destination: {
          coordinates: { latitude: 37.7749, longitude: -122.4294 },
          address: "456 Market St, San Francisco, CA",
        },
        price: 15.75,
        distance: 2.3,
        duration: 12,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        id: "2",
        userId: get().user?.id || "",
        driverId: "driver2",
        status: "completed",
        pickup: {
          coordinates: { latitude: 37.7749, longitude: -122.4194 },
          address: "789 Mission St, San Francisco, CA",
        },
        destination: {
          coordinates: { latitude: 37.7649, longitude: -122.4194 },
          address: "101 California St, San Francisco, CA",
        },
        price: 22.5,
        distance: 3.7,
        duration: 18,
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
      },
    ]

    set({ rides: mockRides })

    return mockRides
  },
}))

export default useStore

