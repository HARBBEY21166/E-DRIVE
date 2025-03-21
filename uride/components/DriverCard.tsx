import type React from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native"

interface DriverCardProps {
  driver: {
    id: string
    name: string
    rating: number
    car: string
    price: number
    eta: string
    avatar?: string
  }
  onSelect: (driverId: string) => void
  isSelected?: boolean
}

const DriverCard: React.FC<DriverCardProps> = ({ driver, onSelect, isSelected = false }) => {
  const { id, name, rating, car, price, eta, avatar } = driver

  return (
    <TouchableOpacity style={[styles.container, isSelected && styles.selectedContainer]} onPress={() => onSelect(id)}>
      <View style={styles.avatarContainer}>
        <Image source={avatar ? { uri: avatar } : require("../assets/icons/person.png")} style={styles.avatar} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRatingContainer}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Image source={require("../assets/icons/star.png")} style={styles.starIcon} />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.carInfo}>{car}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Image source={require("../assets/icons/dollar.png")} style={styles.dollarIcon} />
            <Text style={styles.price}>${price.toFixed(2)}</Text>
          </View>

          <View style={styles.etaContainer}>
            <Text style={styles.eta}>{eta}</Text>
          </View>
        </View>
      </View>

      {isSelected && <View style={styles.selectedIndicator} />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedContainer: {
    borderColor: "#4285F4",
    borderWidth: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1F5F9",
  },
  infoContainer: {
    flex: 1,
  },
  nameRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  carInfo: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dollarIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4285F4",
  },
  etaContainer: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eta: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4285F4",
  },
})

export default DriverCard

