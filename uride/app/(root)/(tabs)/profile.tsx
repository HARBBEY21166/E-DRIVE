"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useRouter } from "expo-router"
import CustomButton from "../../../components/CustomButton"
import useStore from "../../../store"

const ProfileScreen = () => {
  const router = useRouter()
  const { user, logout } = useStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    await logout()
    setIsLoading(false)
    router.replace("/(auth)/welcome")
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={user?.avatar ? { uri: user.avatar } : require("../../../assets/icons/person.png")}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Text style={styles.editImageText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Personal Information</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: [{ rotate: "-90deg" }] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Payment Methods</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: [{ rotate: "-90deg" }] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notifications</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: [{ rotate: "-90deg" }] }]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Language</Text>
            <View style={styles.menuItemValue}>
              <Text style={styles.menuItemValueText}>English</Text>
              <Image
                source={require("../../../assets/icons/arrow-down.png")}
                style={[styles.menuItemIcon, { transform: [{ rotate: "-90deg" }] }]}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Dark Mode</Text>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleOff} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Help Center</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: [{ rotate: "-90deg" }] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Report a Problem</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: [{ rotate: "-90deg" }] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Terms of Service</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: [{ rotate: "-90deg" }] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Privacy Policy</Text>
            <Image
              source={require("../../../assets/icons/arrow-down.png")}
              style={[styles.menuItemIcon, { transform: [{ rotate: "-90deg" }] }]}
            />
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Logout"
          onPress={confirmLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
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
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4285F4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editImageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748B",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  menuItemText: {
    fontSize: 16,
    color: "#1E293B",
  },
  menuItemIcon: {
    width: 16,
    height: 16,
    tintColor: "#64748B",
  },
  menuItemValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemValueText: {
    fontSize: 14,
    color: "#64748B",
    marginRight: 8,
  },
  toggleContainer: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleOff: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  logoutButtonText: {
    color: "#EF4444",
  },
})

export default ProfileScreen

