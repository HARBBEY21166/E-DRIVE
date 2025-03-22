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

const SignInScreen = () => {
  const router = useRouter()
  const { login, loginWithGoogle, isLoading, error, userType } = useAuth()
  const { colors, isDarkMode } = useTheme()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedUserType, setSelectedUserType] = useState<UserType>("rider")
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  const validateForm = () => {
    let isValid = true
    const newErrors = { email: "", password: "" }

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
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSignIn = async () => {
    if (!validateForm()) return

    const success = await login(email, password)
    if (success) {
      if (userType === "rider") {
        router.replace("/(root)/(tabs)/home")
      } else {
        router.replace("/(driver)/(tabs)/home")
      }
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const success = await loginWithGoogle(selectedUserType)
      if (success) {
        if (userType === "rider") {
          router.replace("/(root)/(tabs)/home")
        } else {
          router.replace("/(driver)/(tabs)/home")
        }
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      Alert.alert("Error", "Failed to sign in with Google. Please try again.")
    }
  }

  const navigateToSignUp = () => {
    router.push("/(auth)/sign-up")
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
            <Text style={[styles.title, { color: colors.TEXT }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>Sign in to your account</Text>

            {error && <ErrorAlert message={error} onDismiss={() => {}} />}

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
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
              icon={require("../../assets/icons/lock.png")}
              style={styles.input}
            />

            <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Sign in as:</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  selectedUserType === "rider" && [styles.selectedUserType, { borderColor: colors.PRIMARY }],
                  { backgroundColor: isDarkMode ? colors.BACKGROUND : colors.SURFACE },
                ]}
                onPress={() => setSelectedUserType("rider")}
              >
                <Image
                  source={require("../../assets/icons/circle-user-solid.svg")}
                  style={[
                    styles.userTypeIcon,
                    { tintColor: selectedUserType === "rider" ? colors.PRIMARY : colors.TEXT_SECONDARY },
                  ]}
                />
                <Text
                  style={[styles.userTypeText, { color: selectedUserType === "rider" ? colors.PRIMARY : colors.TEXT }]}
                >
                  Rider
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  selectedUserType === "driver" && [styles.selectedUserType, { borderColor: colors.PRIMARY }],
                  { backgroundColor: isDarkMode ? colors.BACKGROUND : colors.SURFACE },
                ]}
                onPress={() => setSelectedUserType("driver")}
              >
                <Image
                  source={require("../../assets/icons/car.svg")}
                  style={[
                    styles.userTypeIcon,
                    { tintColor: selectedUserType === "driver" ? colors.PRIMARY : colors.TEXT_SECONDARY },
                  ]}
                />
                <Text
                  style={[styles.userTypeText, { color: selectedUserType === "driver" ? colors.PRIMARY : colors.TEXT }]}
                >
                  Driver
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={[styles.forgotPasswordText, { color: colors.PRIMARY }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Sign In"
              onPress={handleSignIn}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            />

            <OAuth onGooglePress={handleGoogleSignIn} />

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.TEXT_SECONDARY }]}>Don't have an account?</Text>
              <TouchableOpacity onPress={navigateToSignUp}>
                <Text style={[styles.signupLink, { color: colors.PRIMARY }]}>Sign Up</Text>
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerImage: {
    width: 200,
    height: 150,
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
    marginBottom: 16,
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    marginTop: 8,
    height: 56,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
})

export default SignInScreen

