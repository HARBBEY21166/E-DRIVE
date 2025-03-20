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
} from "react-native"
import { useRouter } from "expo-router"
import InputField from "../../components/InputField"
import CustomButton from "../../components/CustomButton"
import OAuth from "../../components/OAuth"
import useStore from "../../store"
import { validateEmail } from "../../lib/utils"

const SignInScreen = () => {
  const router = useRouter()
  const { login, loginWithGoogle, isLoading, authError } = useStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
      router.replace("/(root)/(tabs)/home")
    }
  }

  const handleGoogleSignIn = async () => {
    const success = await loginWithGoogle()
    if (success) {
      router.replace("/(root)/(tabs)/home")
    }
  }

  const navigateToSignUp = () => {
    router.push("/(auth)/sign-up")
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/signup-car.png")}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            {authError && <Text style={styles.errorText}>{authError}</Text>}

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

            <CustomButton
              title="Sign In"
              onPress={handleSignIn}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            />

            <OAuth onGooglePress={handleGoogleSignIn} />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={navigateToSignUp}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
    backgroundColor: "#FFFFFF",
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
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 24,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 16,
    fontSize: 14,
  },
  input: {
    marginBottom: 16,
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
    color: "#64748B",
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4285F4",
    marginLeft: 4,
  },
})

export default SignInScreen

