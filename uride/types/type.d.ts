// User types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
}

// Auth types
export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

// Location types
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationDetails {
  coordinates: Coordinates
  address: string
  name?: string
}

// Ride types
export interface Ride {
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

// Driver types
export interface Driver {
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

// Payment types
export interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "cash"
  name: string
  details: string
  isDefault: boolean
}

