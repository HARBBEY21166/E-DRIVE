"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Car, DollarSign, Clock } from "lucide-react-native"
import Map from "../../components/common/Map"
import AsyncStorage from "@react-native-async-storage/async-storage"

const DriverHomeScreen = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(false)
  const [earnings, setEarnings] = useState(0)
  const [rides, setRides] = useState(0)
  const [hours, setHours] = useState(0)

  useEffect(() => {
    // Load driver stats
    const loadStats = async () => {
      try {
        const storedEarnings = await AsyncStorage.getItem("driverEarnings")
        const storedRides = await AsyncStorage.getItem("driverRides")
        const storedHours = await AsyncStorage.getItem("driverHours")

        if (storedEarnings) setEarnings(Number.parseFloat(storedEarnings))
        if (storedRides) setRides(Number.parseInt(storedRides))
        if (storedHours) setHours(Number.parseFloat(storedHours))
      } catch (e) {
        console.log("Failed to load driver stats", e)
      }
    }

    loadStats()
  }, [])

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline)

    // If going online, check for ride requests
    if (!isOnline) {
      // Simulate receiving a ride request after a delay
      setTimeout(() => {
        navigation.navigate("RideRequests")
      }, 5000)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Dashboard</Text>
        <View style={styles.onlineToggle}>
          <Text style={styles.onlineText}>{isOnline ? "Online" : "Offline"}</Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isOnline ? "#4a80f5" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <DollarSign size={24} color="#4a80f5" />
          <Text style={styles.statValue}>${earnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>

        <View style={styles.statCard}>
          <Car size={24} color="#4a80f5" />
          <Text style={styles.statValue}>{rides}</Text>
          <Text style={styles.statLabel}>Rides</Text>
        </View>

        <View style={styles.statCard}>
          <Clock size={24} color="#4a80f5" />
          <Text style={styles.statValue}>{hours.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>Online</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <Map />

        {isOnline && (
          <View style={styles.statusOverlay}>
            <Text style={styles.statusText}>You're online</Text>
            <Text style={styles.statusSubtext}>Waiting for ride requests...</Text>
          </View>
        )}

        {!isOnline && (
          <View style={styles.offlineOverlay}>
            <Text style={styles.offlineText}>You're offline</Text>
            <Text style={styles.offlineSubtext}>Go online to receive ride requests</Text>
            <TouchableOpacity style={styles.goOnlineButton} onPress={toggleOnlineStatus}>
              <Text style={styles.goOnlineButtonText}>Go Online</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate("RideHistory")}>
          <Text style={styles.historyButtonText}>View Ride History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  onlineToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineText: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  statusOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(74, 128, 245, 0.9)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  statusSubtext: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
  },
  offlineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  offlineText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  offlineSubtext: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 20,
    textAlign: "center",
  },
  goOnlineButton: {
    backgroundColor: "#4a80f5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  goOnlineButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  historyButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4a80f5",
    borderRadius: 8,
  },
  historyButtonText: {
    color: "#4a80f5",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default DriverHomeScreen

