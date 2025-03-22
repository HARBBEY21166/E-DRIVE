"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useRouter } from "expo-router"
import InputField from "../../components/InputField"
import CustomButton from "../../components/CustomButton"
import OAuth from "../../components/OAuth"
import { validateEmail } from "../../lib/utils"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import ErrorAlert from "../../components/ErrorAlert"
import type { UserType } from "../../types/type"

const SignUpScreen = () => {
  const router = useRouter()
  const { register, loginWithGoogle, isLoading, error } = useAuth()
  const { colors, isDarkMode } = useTheme()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setUserType] = useState<UserType>("rider")
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    }

    if (!name) {
      newErrors.name = "Name is required"
      isValid = false
    }

    if (!email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email"
      isValid = false
    }

    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      isValid = false
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSignUp = async () => {
    if (!validateForm()) return

    const success = await register(email, password, name, userType, phone)
    if (success) {
      if (userType === "rider") {
        router.replace("/(root)/(tabs)/home")
      } else {
        router.replace("/(driver)/onboarding")
      }
    } else if (error && error.includes("confirmation")) {
      Alert.alert("Email Verification Required", "Please check your email to verify your account before signing in.", [
        { text: "OK", onPress: () => router.push("/(auth)/sign-in") },
      ])
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const success = await loginWithGoogle(userType)
      if (success) {
        if (userType === "rider") {
          router.replace("/(root)/(tabs)/home")
        } else {
          router.replace("/(driver)/onboarding")
        }
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      Alert.alert("Error", "Failed to sign in with Google. Please try again.")
    }
  }

  const navigateToSignIn = () => {
    router.push("/(auth)/sign-in")
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/signup-car.png")}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.formContainer, { backgroundColor: colors.SURFACE }]}>
            <Text style={[styles.title, { color: colors.TEXT }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>Sign up to get started</Text>

            {error && !error.includes("confirmation") && <ErrorAlert message={error} onDismiss={() => {}} />}

            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              icon={require("../../assets/icons/person.png")}
              style={styles.input}
            />

            <InputField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
              icon={require("../../assets/icons/email.png")}
              style={styles.input}
            />

            <InputField
              label="Phone (Optional)"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
              icon={require("../../assets/icons/person.png")}
              style={styles.input}
            />

            <InputField
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
              icon={require("../../assets/icons/lock.png")}
              style={styles.input}
            />

            <InputField
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
              icon={require("../../assets/icons/lock.png")}
              style={styles.input}
            />

            <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>I want to:</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === "rider" && [styles.selectedUserType, { borderColor: colors.PRIMARY }],
                  { backgroundColor: isDarkMode ? colors.BACKGROUND : colors.SURFACE },
                ]}
                onPress={() => setUserType("rider")}
              >
                <Image
                  source={require("../../assets/icons/circle-user-solid.svg")}
                  style={[
                    styles.userTypeIcon,
                    { tintColor: userType === "rider" ? colors.PRIMARY : colors.TEXT_SECONDARY },
                  ]}
                />
                <Text style={[styles.userTypeText, { color: userType === "rider" ? colors.PRIMARY : colors.TEXT }]}>
                  Book Rides
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === "driver" && [styles.selectedUserType, { borderColor: colors.PRIMARY }],
                  { backgroundColor: isDarkMode ? colors.BACKGROUND : colors.SURFACE },
                ]}
                onPress={() => setUserType("driver")}
              >
                <Image
                  source={require("../../assets/icons/car.svg")}
                  style={[
                    styles.userTypeIcon,
                    { tintColor: userType === "driver" ? colors.PRIMARY : colors.TEXT_SECONDARY },
                  ]}
                />
                <Text style={[styles.userTypeText, { color: userType === "driver" ? colors.PRIMARY : colors.TEXT }]}>
                  Drive & Earn
                </Text>
              </TouchableOpacity>
            </View>

            <CustomButton
              title="Sign Up"
              onPress={handleSignUp}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            />

            <OAuth onGooglePress={handleGoogleSignIn} />

            <View style={styles.signinContainer}>
              <Text style={[styles.signinText, { color: colors.TEXT_SECONDARY }]}>Already have an account?</Text>
              <TouchableOpacity onPress={navigateToSignIn}>
                <Text style={[styles.signinLink, { color: colors.PRIMARY }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerImage: {
    width: 150,
    height: 100,
  },
  formContainer: {
    flex: 1,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 12,
  },
  userTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  userTypeButton: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  selectedUserType: {
    borderWidth: 2,
  },
  userTypeIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    marginTop: 8,
    height: 56,
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  signinText: {
    fontSize: 14,
  },
  signinLink: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
})

export default SignUpScreen

