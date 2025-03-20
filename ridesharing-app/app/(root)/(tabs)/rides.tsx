"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import RideCard from "../../../components/RideCard"
import useStore from "../../../store"
import type { Ride } from "../../../types/type"

const RidesScreen = () => {
  const router = useRouter()
  const { fetchRides } = useStore()
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming")

  useEffect(() => {
    loadRides()
  }, [])

  const loadRides = async () => {
    setIsLoading(true)
    const fetchedRides = await fetchRides()
    setRides(fetchedRides)
    setIsLoading(false)
  }

  const handleRidePress = (rideId: string) => {
    // Navigate to ride details
    console.log("Ride pressed:", rideId)
  }

  const filteredRides = rides.filter((ride) => {
    if (activeTab === "upcoming") {
      return ["pending", "accepted", "ongoing"].includes(ride.status)
    } else {
      return ["completed", "cancelled"].includes(ride.status)
    }
  })

  const renderRideItem = ({ item }: { item: Ride }) => {
    return (
      <RideCard
        ride={{
          id: item.id,
          status: item.status as any,
          pickup: item.pickup.address,
          destination: item.destination.address,
          date: new Date(item.createdAt).toLocaleDateString(),
          time: new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          price: item.price,
          driverName: "John Driver", // Mock data
          driverRating: 4.8, // Mock data
        }}
        onPress={handleRidePress}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Rides</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={[styles.tabText, activeTab === "completed" && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{isLoading ? "Loading rides..." : `No ${activeTab} rides found`}</Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={loadRides}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4285F4",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
  },
  activeTabText: {
    color: "#4285F4",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
  },
})

export default RidesScreen

