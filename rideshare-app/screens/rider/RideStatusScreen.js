"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Phone, MessageSquare, Star } from "lucide-react-native"
import Map from "../../components/common/Map"

const RideStatusScreen = ({ navigation, route }) => {
  const { pickup, dropoff, ride } = route.params
  const [status, setStatus] = useState("searching") // searching, matched, arriving, inProgress, completed
  const [driver, setDriver] = useState(null)
  const [eta, setEta] = useState(null)

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

  // Simulate ride flow
  useEffect(() => {
    // Simulate finding a driver
    const searchTimer = setTimeout(() => {
      setStatus("matched")
      setDriver({
        name: "John Doe",
        rating: 4.8,
        car: "Toyota Camry",
        licensePlate: "ABC123",
        photo: "/placeholder.svg?height=100&width=100",
      })
      setEta(5)
    }, 3000)

    return () => clearTimeout(searchTimer)
  }, [])

  useEffect(() => {
    if (status === "matched") {
      // Simulate driver arriving
      const arrivingTimer = setTimeout(() => {
        setStatus("arriving")
        setEta(1)
      }, 5000)

      return () => clearTimeout(arrivingTimer)
    }

    if (status === "arriving") {
      // Simulate ride in progress
      const inProgressTimer = setTimeout(() => {
        setStatus("inProgress")
        setEta(10)
      }, 5000)

      return () => clearTimeout(inProgressTimer)
    }

    if (status === "inProgress") {
      // Simulate ride completed
      const completedTimer = setTimeout(() => {
        setStatus("completed")
      }, 5000)

      return () => clearTimeout(completedTimer)
    }
  }, [status])

  const renderStatusContent = () => {
    switch (status) {
      case "searching":
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Finding your driver...</Text>
            <Text style={styles.statusDescription}>This may take a few moments</Text>
          </View>
        )
      case "matched":
      case "arriving":
      case "inProgress":
        return (
          <View style={styles.driverContainer}>
            <View style={styles.driverInfo}>
              <Image source={{ uri: driver.photo }} style={styles.driverPhoto} />
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{driver.rating}</Text>
                </View>
                <Text style={styles.carInfo}>
                  {driver.car} • {driver.licensePlate}
                </Text>
              </View>
            </View>

            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>
                {status === "matched"
                  ? "Driver arriving in:"
                  : status === "arriving"
                    ? "Driver is nearby:"
                    : "Estimated arrival:"}
              </Text>
              <Text style={styles.etaTime}>{eta} min</Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={20} color="#4a80f5" />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MessageSquare size={20} color="#4a80f5" />
                <Text style={styles.actionText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      case "completed":
        return (
          <View style={styles.completedContainer}>
            <Text style={styles.completedTitle}>Ride Completed</Text>
            <Text style={styles.completedDescription}>How was your trip with {driver.name}?</Text>

            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star}>
                  <Star size={32} color="#FFD700" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("RiderHome")}>
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <Map markers={markers} />
      </View>

      <View style={styles.contentContainer}>
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

        {renderStatusContent()}

        {status !== "completed" && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate("RiderHome")}>
            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    height: "50%",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  routeInfo: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 16,
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
  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  statusDescription: {
    fontSize: 14,
    color: "#666",
  },
  driverContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
  },
  driverInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  driverDetails: {
    justifyContent: "center",
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  carInfo: {
    fontSize: 14,
    color: "#666",
  },
  etaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  etaLabel: {
    fontSize: 14,
    color: "#666",
  },
  etaTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    padding: 10,
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: "#4a80f5",
  },
  completedContainer: {
    alignItems: "center",
    padding: 20,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  completedDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  ratingStars: {
    flexDirection: "row",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4a80f5",
    width: "100%",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: "auto",
    padding: 12,
    borderWidth: 1,
    borderColor: "#f54a4a",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#f54a4a",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default RideStatusScreen

