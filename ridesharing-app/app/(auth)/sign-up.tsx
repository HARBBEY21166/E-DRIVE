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

const SignUpScreen = () => {
  const router = useRouter()
  const { register, loginWithGoogle, isLoading, authError } = useStore()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
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

    const success = await register(email, password, name, phone)
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

  const navigateToSignIn = () => {
    router.push("/(auth)/sign-in")
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            {authError && <Text style={styles.errorText}>{authError}</Text>}

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

            <CustomButton
              title="Sign Up"
              onPress={handleSignUp}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            />

            <OAuth onGooglePress={handleGoogleSignIn} />

            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Already have an account?</Text>
              <TouchableOpacity onPress={navigateToSignIn}>
                <Text style={styles.signinLink}>Sign In</Text>
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
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  signinText: {
    fontSize: 14,
    color: "#64748B",
  },
  signinLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4285F4",
    marginLeft: 4,
  },
})

export default SignUpScreen

