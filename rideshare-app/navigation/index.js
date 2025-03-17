"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen"
import SignupScreen from "../screens/auth/SignupScreen"

// Rider Screens
import RiderHomeScreen from "../screens/rider/RiderHomeScreen"
import BookRideScreen from "../screens/rider/BookRideScreen"
import RideStatusScreen from "../screens/rider/RideStatusScreen"

// Driver Screens
import DriverHomeScreen from "../screens/driver/DriverHomeScreen"
import RideRequestsScreen from "../screens/driver/RideRequestsScreen"
import CurrentRideScreen from "../screens/driver/CurrentRideScreen"

const Stack = createStackNavigator()

const Navigation = () => {
  const [userToken, setUserToken] = useState(null)
  const [userType, setUserType] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken")
        const type = await AsyncStorage.getItem("userType")
        setUserToken(token)
        setUserType(type)
      } catch (e) {
        console.log("Failed to get user data", e)
      }
      setIsLoading(false)
    }

    bootstrapAsync()
  }, [])

  if (isLoading) {
    // Return a loading screen here
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : userType === "rider" ? (
          // Rider Stack
          <>
            <Stack.Screen name="RiderHome" component={RiderHomeScreen} />
            <Stack.Screen name="BookRide" component={BookRideScreen} />
            <Stack.Screen name="RideStatus" component={RideStatusScreen} />
          </>
        ) : (
          // Driver Stack
          <>
            <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
            <Stack.Screen name="RideRequests" component={RideRequestsScreen} />
            <Stack.Screen name="CurrentRide" component={CurrentRideScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigation

