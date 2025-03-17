"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SafeAreaView } from "react-native-safe-area-context"

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("rider") // 'rider' or 'driver'

  const handleLogin = async () => {
    // In a real app, you would validate credentials with your backend
    if (email && password) {
      try {
        // Mock login - replace with actual API call
        await AsyncStorage.setItem("userToken", "dummy-auth-token")
        await AsyncStorage.setItem("userType", userType)
        await AsyncStorage.setItem("userEmail", email)
      } catch (e) {
        Alert.alert("Error", "Failed to log in")
      }
    } else {
      Alert.alert("Error", "Please fill in all fields")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RideShare</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === "rider" && styles.activeUserType]}
            onPress={() => setUserType("rider")}
          >
            <Text style={userType === "rider" ? styles.activeText : styles.inactiveText}>Rider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === "driver" && styles.activeUserType]}
            onPress={() => setUserType("driver")}
          >
            <Text style={userType === "driver" ? styles.activeText : styles.inactiveText}>Driver</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.link}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  form: {
    width: "100%",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  userTypeContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeUserType: {
    backgroundColor: "#4a80f5",
    borderColor: "#4a80f5",
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inactiveText: {
    color: "#666",
  },
  button: {
    backgroundColor: "#4a80f5",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  link: {
    color: "#4a80f5",
    fontWeight: "bold",
  },
})

export default LoginScreen

