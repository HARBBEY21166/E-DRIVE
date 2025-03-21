"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import { debounce } from "../lib/utils"
import { searchPlaces } from "../lib/map"
import type { Coordinates } from "../lib/map"

interface Place {
  id: string
  name: string
  address: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

interface LocationSearchInputProps {
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  onPlaceSelect: (place: Place) => void
  label?: string
  nearLocation?: Coordinates
  focusOnJohannesburg?: boolean
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  placeholder,
  value,
  onChangeText,
  onPlaceSelect,
  label,
  nearLocation,
  focusOnJohannesburg = true,
}) => {
  const [predictions, setPredictions] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Function to fetch place predictions using Nominatim
  const fetchPredictions = async (text: string) => {
    if (!text) {
      setPredictions([])
      return
    }

    setIsLoading(true)

    try {
      // Use the searchPlaces function from map.ts
      const results = await searchPlaces(text, nearLocation)
      setPredictions(results)
    } catch (error) {
      console.error("Error fetching predictions:", error)

      // Fallback to mock data if API fails
      const mockPredictions = [
        {
          id: "1",
          name: text + " Street",
          address: "Johannesburg, South Africa",
          coordinates: { latitude: -26.205, longitude: 28.049722 },
        },
        {
          id: "2",
          name: text + " Avenue",
          address: "Sandton, Johannesburg, South Africa",
          coordinates: { latitude: -26.107567, longitude: 28.056702 },
        },
        {
          id: "3",
          name: text + " Road",
          address: "Soweto, Johannesburg, South Africa",
          coordinates: { latitude: -26.2227, longitude: 27.8898 },
        },
      ]

      setPredictions(mockPredictions)
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedFetchPredictions = debounce(fetchPredictions, 300)

  useEffect(() => {
    debouncedFetchPredictions(value)
  }, [value])

  const handlePlaceSelect = (place: Place) => {
    onPlaceSelect(place)
    onChangeText(place.name)
    setPredictions([])
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, isFocused && styles.focusedInput]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow item selection
            setTimeout(() => setIsFocused(false), 200)
          }}
        />
        {isLoading && <ActivityIndicator size="small" color="#4285F4" />}
      </View>

      {isFocused && predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.predictionItem} onPress={() => handlePlaceSelect(item)}>
                <Text style={styles.predictionName}>{item.name}</Text>
                <Text style={styles.predictionAddress}>{item.address}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#1E293B",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  focusedInput: {
    borderColor: "#4285F4",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  predictionsContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  predictionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  predictionName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  predictionAddress: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
})

export default LocationSearchInput

