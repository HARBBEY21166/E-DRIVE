// User types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  userType: UserType
  isVerified: boolean
  createdAt: Date
  // Driver-specific fields
  driverDetails?: DriverDetails
  // Rider-specific fields
  paymentMethods?: PaymentMethod[]
  savedLocations?: SavedLocation[]
}

export type UserType = "rider" | "driver"

// Driver details
export interface DriverDetails {
  licenseNumber: string
  licenseExpiry: Date
  vehicleDetails: VehicleDetails
  isActive: boolean
  isApproved: boolean
  currentLocation?: Coordinates
  rating: number
  totalRides: number
  earnings: {
    total: number
    today: number
    week: number
    month: number
  }
  documents: {
    license?: string
    insurance?: string
    registration?: string
    profilePhoto?: string
  }
}

// Vehicle details
export interface VehicleDetails {
  make: string
  model: string
  year: number
  color: string
  licensePlate: string
  vehicleType: VehicleType
  seats: number
}

export type VehicleType = "standard" | "xl" | "premium"

// Saved location
export interface SavedLocation {
  id: string
  name: string
  address: string
  coordinates: Coordinates
  type: "home" | "work" | "favorite" | "other"
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
  status: RideStatus
  pickup: LocationDetails
  destination: LocationDetails
  price: number
  distance: number
  duration: number
  createdAt: Date
  scheduledFor?: Date
  completedAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  paymentMethod?: string
  paymentStatus?: PaymentStatus
  rating?: number
  feedback?: string
  driver?: Driver
  rider?: User
  route?: Coordinates[]
}

export type RideStatus =
  | "pending" // Initial state when rider requests a ride
  | "searching" // Looking for drivers
  | "accepted" // Driver accepted the ride
  | "arrived" // Driver arrived at pickup location
  | "in_progress" // Ride is in progress
  | "completed" // Ride completed
  | "cancelled" // Ride cancelled
  | "expired" // No drivers accepted the ride

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"

// Driver types
export interface Driver {
  id: string
  name: string
  rating: number
  car: {
    model: string
    color: string
    licensePlate: string
    vehicleType: VehicleType
  }
  location: LocationDetails
  isAvailable: boolean
  avatar?: string
  phone?: string
}

// Payment types
export interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "cash"
  name: string
  details: string
  isDefault: boolean
}

// Message types
export interface Message {
  id: string
  rideId: string
  text: string
  sender: "rider" | "driver" | "system"
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "read" | "error"
}

// Notification types
export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: NotificationType
  data?: any
  isRead: boolean
  createdAt: Date
}

export type NotificationType =
  | "ride_request"
  | "ride_accepted"
  | "driver_arrived"
  | "ride_started"
  | "ride_completed"
  | "ride_cancelled"
  | "payment"
  | "promo"
  | "system"

