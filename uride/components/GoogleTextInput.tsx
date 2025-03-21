"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import { debounce } from "../lib/utils"
import { getCoordinatesFromAddress } from "../lib/map"

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
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  placeholder,
  value,
  onChangeText,
  onPlaceSelect,
  label,
}) => {
  const [predictions, setPredictions] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Function to fetch place predictions using Nominatim (OpenStreetMap)
  const fetchPredictions = async (text: string) => {
    if (!text) {
      setPredictions([])
      return
    }

    setIsLoading(true)

    try {
      // Use Nominatim API for geocoding
      const encodedText = encodeURIComponent(text)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedText}&limit=5`, {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "RidesharingApp/1.0",
        },
      })

      const data = await response.json()

      const results: Place[] = data.map((item: any, index: number) => ({
        id: item.place_id.toString(),
        name: item.display_name.split(",")[0],
        address: item.display_name,
        coordinates: {
          latitude: Number.parseFloat(item.lat),
          longitude: Number.parseFloat(item.lon),
        },
      }))

      setPredictions(results)
    } catch (error) {
      console.error("Error fetching predictions:", error)

      // Fallback to mock data if API fails
      const mockPredictions = [
        { id: "1", name: text + " Street", address: "New York, NY, USA" },
        { id: "2", name: text + " Avenue", address: "Los Angeles, CA, USA" },
        { id: "3", name: text + " Boulevard", address: "Chicago, IL, USA" },
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

  const handlePlaceSelect = async (place: Place) => {
    // If coordinates are not already available, get them
    if (!place.coordinates) {
      const coordinates = await getCoordinatesFromAddress(place.address)
      if (coordinates) {
        place.coordinates = coordinates
      }
    }

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

