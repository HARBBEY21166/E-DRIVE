"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, Alert, Switch } from "react-native"
import { useRouter } from "expo-router"
import CustomButton from "../../../components/CustomButton"
import ImagePicker from "../../../components/ImagePicker"
import useStore from "../../../store"
import { useTheme } from "../../../context/ThemeContext"
import ErrorAlert from "../../../components/ErrorAlert"

const ProfileScreen = () => {
  const router = useRouter()
  const { user, logout, updateUserProfile } = useStore()
  const { colors, isDarkMode, toggleTheme } = useTheme()

  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await logout()
      router.replace("/(auth)/welcome")
    } catch (err) {
      setError("Failed to logout. Please try again.")
      console.error("Logout error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: handleLogout,
          style: "destructive",
        },
      ],
      { cancelable: true },
    )
  }

  const handleImageSelected = async (imageUri: string) => {
    setIsUploading(true)
    setError(null)

    try {
      // In a real app, you would upload the image to a server here
      // For this example, we'll just update the user profile directly
      await updateUserProfile({ avatar: imageUri })
    } catch (err) {
      setError("Failed to update profile image. Please try again.")
      console.error("Image upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <View style={[styles.header, { backgroundColor: colors.SURFACE, borderBottomColor: colors.BORDER }]}>
        <Text style={[styles.title, { color: colors.TEXT }]}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {error && <ErrorAlert message={error} onRetry={() => setError(null)} onDismiss={() => setError(null)} />}

        <View style={[styles.profileSection, { backgroundColor: colors.SURFACE }]}>
          <ImagePicker
            onImageSelected={handleImageSelected}
            defaultImage={user?.avatar}
            size={100}
            label="Tap to change profile picture"
            loading={isUploading}
          />

          <Text style={[styles.userName, { color: colors.TEXT }]}>{user?.name || "User"}</Text>
          <Text style={[styles.userEmail, { color: colors.TEXT_SECONDARY }]}>{user?.email || "user@example.com"}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.SURFACE }]}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Account</Text>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.menuItemText, { color: colors.TEXT }]}>Personal Information</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: `rotate(-90deg)`, tintColor: colors.TEXT_SECONDARY }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.menuItemText, { color: colors.TEXT }]}>Payment Methods</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: `rotate(-90deg)`, tintColor: colors.TEXT_SECONDARY }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.menuItemText, { color: colors.TEXT }]}>Notifications</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: `rotate(-90deg)`, tintColor: colors.TEXT_SECONDARY }]}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.SURFACE }]}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Preferences</Text>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.menuItemText, { color: colors.TEXT }]}>Language</Text>
            <View style={styles.menuItemValue}>
              <Text style={[styles.menuItemValueText, { color: colors.TEXT_SECONDARY }]}>English</Text>
              <Image
                source={require("../../../assets/icons/arrow-down.png")}
                style={[styles.menuItemIcon, { transform: `rotate(-90deg)`, tintColor: colors.TEXT_SECONDARY }]}
              />
            </View>
          </TouchableOpacity>
          <View style={[styles.menuItem, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.menuItemText, { color: colors.TEXT }]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.BORDER, true: colors.PRIMARY }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.SURFACE }]}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Support</Text>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.menuItemText, { color: colors.TEXT }]}>Help Center</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: `rotate(-90deg)`, tintColor: colors.TEXT_SECONDARY }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.menuItemText, { color: colors.TEXT }]}>Report a Problem</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: `rotate(-90deg)`, tintColor: colors.TEXT_SECONDARY }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.menuItemText, { color: colors.TEXT }]}>Terms of Service</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: `rotate(-90deg)`, tintColor: colors.TEXT_SECONDARY }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.menuItemText, { color: colors.TEXT }]}>Privacy Policy</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: `rotate(-90deg)`, tintColor: colors.TEXT_SECONDARY }]}
            />
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Logout"
          onPress={confirmLogout}
          style={[styles.logoutButton, { borderColor: colors.ERROR }]}
          textStyle={[styles.logoutButtonText, { color: colors.ERROR }]}
          primary={false}
          outline={true}
          loading={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    padding: 24,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemIcon: {
    width: 16,
    height: 16,
  },
  menuItemValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemValueText: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  logoutButtonText: {
    fontWeight: "600",
  },
})

export default ProfileScreen

