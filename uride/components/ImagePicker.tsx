"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Platform } from "react-native"
import * as ExpoImagePicker from "expo-image-picker"
import { useTheme } from "../context/ThemeContext"

interface ImagePickerProps {
  onImageSelected: (imageUri: string) => void
  defaultImage?: string
  size?: number
  label?: string
  loading?: boolean
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  defaultImage,
  size = 100,
  label = "Select Image",
  loading = false,
}) => {
  const { colors, isDarkMode } = useTheme()
  const [image, setImage] = useState<string | null>(defaultImage || null)
  const [error, setError] = useState<string | null>(null)

  const pickImage = async () => {
    setError(null)

    try {
      // Request permissions
      if (Platform.OS !== "web") {
        const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
          setError("Permission to access media library is required!")
          return
        }
      }

      // Launch image picker
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri
        setImage(selectedImage)
        onImageSelected(selectedImage)
      }
    } catch (err) {
      console.error("Error picking image:", err)
      setError("Failed to pick image. Please try again.")
    }
  }

  const takePhoto = async () => {
    setError(null)

    try {
      // Request permissions
      if (Platform.OS !== "web") {
        const { status } = await ExpoImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") {
          setError("Permission to access camera is required!")
          return
        }
      }

      // Launch camera
      const result = await ExpoImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri
        setImage(selectedImage)
        onImageSelected(selectedImage)
      }
    } catch (err) {
      console.error("Error taking photo:", err)
      setError("Failed to take photo. Please try again.")
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.imageContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isDarkMode ? colors.SURFACE : colors.BORDER,
            borderColor: colors.BORDER,
          },
        ]}
        onPress={pickImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.PRIMARY} />
        ) : image ? (
          <Image source={{ uri: image }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        ) : (
          <Text style={[styles.placeholder, { color: colors.TEXT_SECONDARY }]}>+</Text>
        )}
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.PRIMARY }]}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.SECONDARY }]}
          onPress={takePhoto}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {label && <Text style={[styles.label, { color: colors.TEXT }]}>{label}</Text>}

      {error && <Text style={[styles.error, { color: colors.ERROR }]}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
  placeholder: {
    fontSize: 40,
    fontWeight: "300",
  },
  label: {
    marginTop: 8,
    fontSize: 14,
  },
  error: {
    marginTop: 8,
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
})

export default ImagePicker

