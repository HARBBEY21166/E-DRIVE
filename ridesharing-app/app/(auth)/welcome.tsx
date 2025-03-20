"use client"
import { View, Text, Image, StyleSheet, SafeAreaView, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import CustomButton from "../../components/CustomButton"
import { APP_NAME } from "../../constants"

const { width } = Dimensions.get("window")

const WelcomeScreen = () => {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/(auth)/sign-in")
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={require("../../assets/images/get-started.png")} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to {APP_NAME}</Text>
          <Text style={styles.subtitle}>The easiest way to get a ride or become a driver and earn money</Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton title="Get Started" onPress={handleGetStarted} style={styles.button} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 24,
  },
  button: {
    width: "100%",
    height: 56,
  },
})

export default WelcomeScreen

