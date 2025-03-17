"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ArrowLeft, Car, Clock, DollarSign } from "lucide-react-native"
import Map from "../../components/common/Map"

const rideOptions = [
  {
    id: "economy",
    name: "Economy",
    price: "10-12",
    time: "5 min",
    description: "Affordable rides for everyday use",
  },
  {
    id: "comfort",
    name: "Comfort",
    price: "15-18",
    time: "7 min",
    description: "More space, newer cars",
  },
  {
    id: "premium",
    name: "Premium",
    price: "25-30",
    time: "10 min",
    description: "Top-tier cars with extra amenities",
  },
]

const BookRideScreen = ({ navigation, route }) => {
  const { pickup, dropoff } = route.params
  const [selectedRide, setSelectedRide] = useState(rideOptions[0].id)

  // Mock markers for the map
  const markers = [
    {
      coordinate: { latitude: 37.78825, longitude: -122.4324 },
      title: "Pickup",
      description: pickup,
      type: "pickup",
    },
    {
      coordinate: { latitude: 37.7749, longitude: -122.4194 },
      title: "Dropoff",
      description: dropoff,
      type: "dropoff",
    },
  ]

  const handleConfirmRide = () => {
    const selectedRideDetails = rideOptions.find((option) => option.id === selectedRide)
    navigation.navigate("RideStatus", {
      pickup,
      dropoff,
      ride: selectedRideDetails,
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Ride</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapContainer}>
        <Map markers={markers} />
      </View>

      <View style={styles.rideOptionsContainer}>
        <Text style={styles.sectionTitle}>Select Ride Type</Text>

        <ScrollView style={styles.optionsScrollView}>
          {rideOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.rideOption, selectedRide === option.id && styles.selectedRideOption]}
              onPress={() => setSelectedRide(option.id)}
            >
              <View style={styles.rideOptionLeft}>
                <Car size={24} color="#333" />
                <View style={styles.rideOptionInfo}>
                  <Text style={styles.rideOptionName}>{option.name}</Text>
                  <Text style={styles.rideOptionDescription}>{option.description}</Text>
                </View>
              </View>

              <View style={styles.rideOptionRight}>
                <View style={styles.rideOptionDetail}>
                  <DollarSign size={16} color="#666" />
                  <Text style={styles.rideOptionDetailText}>${option.price}</Text>
                </View>
                <View style={styles.rideOptionDetail}>
                  <Clock size={16} color="#666" />
                  <Text style={styles.rideOptionDetailText}>{option.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.routeInfo}>
          <View style={styles.routeInfoItem}>
            <Text style={styles.routeInfoLabel}>From:</Text>
            <Text style={styles.routeInfoValue}>{pickup}</Text>
          </View>
          <View style={styles.routeInfoItem}>
            <Text style={styles.routeInfoLabel}>To:</Text>
            <Text style={styles.routeInfoValue}>{dropoff}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleConfirmRide}>
          <Text style={styles.buttonText}>Confirm Ride</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  mapContainer: {
    height: "40%",
  },
  rideOptionsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  optionsScrollView: {
    maxHeight: 220,
  },
  rideOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedRideOption: {
    borderColor: "#4a80f5",
    backgroundColor: "rgba(74, 128, 245, 0.05)",
  },
  rideOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rideOptionInfo: {
    marginLeft: 12,
  },
  rideOptionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  rideOptionDescription: {
    fontSize: 14,
    color: "#666",
  },
  rideOptionRight: {
    alignItems: "flex-end",
  },
  rideOptionDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rideOptionDetailText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  routeInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  routeInfoItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  routeInfoLabel: {
    width: 50,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  routeInfoValue: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  button: {
    backgroundColor: "#4a80f5",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default BookRideScreen

