import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"

interface RideCardProps {
  ride: {
    id: string
    status: "upcoming" | "ongoing" | "completed" | "cancelled"
    pickup: string
    destination: string
    date: string
    time: string
    price: number
    driverName?: string
    driverRating?: number
  }
  onPress: (rideId: string) => void
}

const RideCard: React.FC<RideCardProps> = ({ ride, onPress }) => {
  const { id, status, pickup, destination, date, time, price, driverName, driverRating } = ride

  const getStatusColor = () => {
    switch (status) {
      case "upcoming":
        return "#3B82F6"
      case "ongoing":
        return "#10B981"
      case "completed":
        return "#6366F1"
      case "cancelled":
        return "#EF4444"
      default:
        return "#64748B"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "upcoming":
        return "Upcoming"
      case "ongoing":
        return "Ongoing"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(id)}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        <Text style={styles.dateTime}>
          {date} • {time}
        </Text>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <View style={styles.dotContainer}>
            <View style={[styles.dot, styles.pickupDot]} />
            <View style={styles.dotLine} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {pickup}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.dotContainer}>
            <View style={[styles.dot, styles.destinationDot]} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {destination}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>${price.toFixed(2)}</Text>

        {driverName && driverRating && (
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driverName}</Text>
            <View style={styles.ratingContainer}>
              <Image source={require("../assets/icons/star.png")} style={styles.starIcon} />
              <Text style={styles.rating}>{driverRating.toFixed(1)}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  dateTime: {
    fontSize: 14,
    color: "#64748B",
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dotContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pickupDot: {
    backgroundColor: "#3B82F6",
  },
  destinationDot: {
    backgroundColor: "#EF4444",
  },
  dotLine: {
    position: "absolute",
    top: 12,
    width: 2,
    height: 24,
    backgroundColor: "#CBD5E1",
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4285F4",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverName: {
    fontSize: 14,
    color: "#1E293B",
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    width: 14,
    height: 14,
    marginRight: 2,
  },
  rating: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
})

export default RideCard

