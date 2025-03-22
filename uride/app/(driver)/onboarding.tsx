"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert } from "react-native"
import { useRouter } from "expo-router"
import InputField from "../../components/InputField"
import CustomButton from "../../components/CustomButton"
import ImagePicker from "../../components/ImagePicker"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import ErrorAlert from "../../components/ErrorAlert"

const DriverOnboardingScreen = () => {
  const router = useRouter()
  const { user, updateDriverDetails, isLoading, error } = useAuth()
  const { colors, isDarkMode } = useTheme()

  const [step, setStep] = useState(1)
  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseExpiry, setLicenseExpiry] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleYear, setVehicleYear] = useState("")
  const [vehicleColor, setVehicleColor] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [vehicleType, setVehicleType] = useState("standard")
  const [seats, setSeats] = useState("4")

  const [licensePhoto, setLicensePhoto] = useState("")
  const [insurancePhoto, setInsurancePhoto] = useState("")
  const [registrationPhoto, setRegistrationPhoto] = useState("")
  const [profilePhoto, setProfilePhoto] = useState(user?.avatar || "")

  const [errors, setErrors] = useState({
    licenseNumber: "",
    licenseExpiry: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    licensePlate: "",
  })

  const validateStep1 = () => {
    let isValid = true
    const newErrors = {
      licenseNumber: "",
      licenseExpiry: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleColor: "",
      licensePlate: "",
    }

    if (!licenseNumber) {
      newErrors.licenseNumber = "License number is required"
      isValid = false
    }

    if (!licenseExpiry) {
      newErrors.licenseExpiry = "License expiry date is required"
      isValid = false
    } else {
      // Simple date validation
      const expiryDate = new Date(licenseExpiry)
      const today = new Date()
      if (isNaN(expiryDate.getTime()) || expiryDate < today) {
        newErrors.licenseExpiry = "Please enter a valid future date"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const validateStep2 = () => {
    let isValid = true
    const newErrors = {
      licenseNumber: "",
      licenseExpiry: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleColor: "",
      licensePlate: "",
    }

    if (!vehicleMake) {
      newErrors.vehicleMake = "Vehicle make is required"
      isValid = false
    }

    if (!vehicleModel) {
      newErrors.vehicleModel = "Vehicle model is required"
      isValid = false
    }

    if (!vehicleYear) {
      newErrors.vehicleYear = "Vehicle year is required"
      isValid = false
    } else {
      const year = Number.parseInt(vehicleYear)
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 2000 || year > currentYear + 1) {
        newErrors.vehicleYear = `Please enter a valid year between 2000 and ${currentYear + 1}`
        isValid = false
      }
    }

    if (!vehicleColor) {
      newErrors.vehicleColor = "Vehicle color is required"
      isValid = false
    }

    if (!licensePlate) {
      newErrors.licensePlate = "License plate is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const validateStep3 = () => {
    if (!licensePhoto || !insurancePhoto || !registrationPhoto || !profilePhoto) {
      Alert.alert("Missing Documents", "Please upload all required documents to continue.")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return

    try {
      const driverDetails = {
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        vehicleDetails: {
          make: vehicleMake,
          model: vehicleModel,
          year: Number.parseInt(vehicleYear),
          color: vehicleColor,
          licensePlate,
          vehicleType,
          seats: Number.parseInt(seats),
        },
        isActive: false,
        isApproved: false,
        documents: {
          license: licensePhoto,
          insurance: insurancePhoto,
          registration: registrationPhoto,
        },
      }

      // Update profile photo separately
      if (profilePhoto && profilePhoto !== user?.avatar) {
        await updateDriverDetails({
          ...driverDetails,
          documents: {
            ...driverDetails.documents,
            profilePhoto,
          },
        })
      } else {
        await updateDriverDetails(driverDetails)
      }

      Alert.alert(
        "Application Submitted",
        "Your driver application has been submitted for review. We'll notify you once it's approved.",
        [{ text: "OK", onPress: () => router.replace("/(driver)/(tabs)/home") }],
      )
    } catch (err) {
      console.error("Error submitting driver application:", err)
      Alert.alert("Error", "Failed to submit driver application. Please try again.")
    }
  }

  const renderStep1 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.TEXT }]}>Driver License Information</Text>

      <InputField
        label="License Number"
        placeholder="Enter your license number"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
        error={errors.licenseNumber}
        style={styles.input}
      />

      <InputField
        label="License Expiry Date"
        placeholder="YYYY-MM-DD"
        value={licenseExpiry}
        onChangeText={setLicenseExpiry}
        error={errors.licenseExpiry}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <CustomButton title="Next" onPress={handleNext} style={styles.button} />
      </View>
    </View>
  )

  const renderStep2 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.TEXT }]}>Vehicle Information</Text>

      <InputField
        label="Vehicle Make"
        placeholder="e.g., Toyota"
        value={vehicleMake}
        onChangeText={setVehicleMake}
        error={errors.vehicleMake}
        style={styles.input}
      />

      <InputField
        label="Vehicle Model"
        placeholder="e.g., Camry"
        value={vehicleModel}
        onChangeText={setVehicleModel}
        error={errors.vehicleModel}
        style={styles.input}
      />

      <InputField
        label="Vehicle Year"
        placeholder="e.g., 2020"
        value={vehicleYear}
        onChangeText={setVehicleYear}
        keyboardType="numeric"
        error={errors.vehicleYear}
        style={styles.input}
      />

      <InputField
        label="Vehicle Color"
        placeholder="e.g., Black"
        value={vehicleColor}
        onChangeText={setVehicleColor}
        error={errors.vehicleColor}
        style={styles.input}
      />

      <InputField
        label="License Plate"
        placeholder="Enter license plate number"
        value={licensePlate}
        onChangeText={setLicensePlate}
        error={errors.licensePlate}
        style={styles.input}
      />

      <Text style={[styles.label, { color: colors.TEXT }]}>Vehicle Type</Text>
      <View style={styles.vehicleTypeContainer}>
        <TouchableOpacity
          style={[
            styles.vehicleTypeButton,
            vehicleType === "standard" && [styles.selectedVehicleType, { borderColor: colors.PRIMARY }],
            { backgroundColor: isDarkMode ? colors.BACKGROUND : colors.SURFACE },
          ]}
          onPress={() => setVehicleType("standard")}
        >
          <Image
            source={require("../../assets/icons/car.svg")}
            style={[
              styles.vehicleTypeIcon,
              { tintColor: vehicleType === "standard" ? colors.PRIMARY : colors.TEXT_SECONDARY },
            ]}
          />
          <Text style={[styles.vehicleTypeText, { color: vehicleType === "standard" ? colors.PRIMARY : colors.TEXT }]}>
            Standard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.vehicleTypeButton,
            vehicleType === "xl" && [styles.selectedVehicleType, { borderColor: colors.PRIMARY }],
            { backgroundColor: isDarkMode ? colors.BACKGROUND : colors.SURFACE },
          ]}
          onPress={() => setVehicleType("xl")}
        >
          <Image
            source={require("../../assets/icons/car.svg")}
            style={[
              styles.vehicleTypeIcon,
              { tintColor: vehicleType === "xl" ? colors.PRIMARY : colors.TEXT_SECONDARY },
            ]}
          />
          <Text style={[styles.vehicleTypeText, { color: vehicleType === "xl" ? colors.PRIMARY : colors.TEXT }]}>
            XL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.vehicleTypeButton,
            vehicleType === "premium" && [styles.selectedVehicleType, { borderColor: colors.PRIMARY }],
            { backgroundColor: isDarkMode ? colors.BACKGROUND : colors.SURFACE },
          ]}
          onPress={() => setVehicleType("premium")}
        >
          <Image
            source={require("../../assets/icons/car.svg")}
            style={[
              styles.vehicleTypeIcon,
              { tintColor: vehicleType === "premium" ? colors.PRIMARY : colors.TEXT_SECONDARY },
            ]}
          />
          <Text style={[styles.vehicleTypeText, { color: vehicleType === "premium" ? colors.PRIMARY : colors.TEXT }]}>
            Premium
          </Text>
        </TouchableOpacity>
      </View>

      <InputField
        label="Number of Seats"
        placeholder="e.g., 4"
        value={seats}
        onChangeText={setSeats}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Back"
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: colors.BORDER }]}
          textStyle={{ color: colors.TEXT }}
          primary={false}
        />
        <CustomButton title="Next" onPress={handleNext} style={styles.button} />
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: colors.TEXT }]}>Upload Documents</Text>
      <Text style={[styles.stepDescription, { color: colors.TEXT_SECONDARY }]}>
        Please upload clear photos of the following documents. All documents must be valid and not expired.
      </Text>

      <View style={styles.documentSection}>
        <Text style={[styles.documentTitle, { color: colors.TEXT }]}>Driver's License</Text>
        <ImagePicker onImageSelected={setLicensePhoto} defaultImage={licensePhoto} label="Upload Driver's License" />
      </View>

      <View style={styles.documentSection}>
        <Text style={[styles.documentTitle, { color: colors.TEXT }]}>Insurance Certificate</Text>
        <ImagePicker
          onImageSelected={setInsurancePhoto}
          defaultImage={insurancePhoto}
          label="Upload Insurance Certificate"
        />
      </View>

      <View style={styles.documentSection}>
        <Text style={[styles.documentTitle, { color: colors.TEXT }]}>Vehicle Registration</Text>
        <ImagePicker
          onImageSelected={setRegistrationPhoto}
          defaultImage={registrationPhoto}
          label="Upload Vehicle Registration"
        />
      </View>

      <View style={styles.documentSection}>
        <Text style={[styles.documentTitle, { color: colors.TEXT }]}>Profile Photo</Text>
        <ImagePicker onImageSelected={setProfilePhoto} defaultImage={profilePhoto} label="Upload Profile Photo" />
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Back"
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: colors.BORDER }]}
          textStyle={{ color: colors.TEXT }}
          primary={false}
        />
        <CustomButton
          title="Submit Application"
          onPress={handleSubmit}
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        />
      </View>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.TEXT }]}>Driver Onboarding</Text>
          <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
            Complete your profile to start driving
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, { backgroundColor: colors.PRIMARY }]}>
            <Text style={styles.progressStepText}>1</Text>
          </View>
          <View style={[styles.progressLine, { backgroundColor: step >= 2 ? colors.PRIMARY : colors.BORDER }]} />
          <View style={[styles.progressStep, { backgroundColor: step >= 2 ? colors.PRIMARY : colors.BORDER }]}>
            <Text style={styles.progressStepText}>2</Text>
          </View>
          <View style={[styles.progressLine, { backgroundColor: step >= 3 ? colors.PRIMARY : colors.BORDER }]} />
          <View style={[styles.progressStep, { backgroundColor: step >= 3 ? colors.PRIMARY : colors.BORDER }]}>
            <Text style={styles.progressStepText}>3</Text>
          </View>
        </View>

        {error && <ErrorAlert message={error} onDismiss={() => {}} />}

        <View style={[styles.formContainer, { backgroundColor: colors.SURFACE }]}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  formContainer: {
    padding: 16,
    borderRadius: 12,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  vehicleTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  vehicleTypeButton: {
    width: "30%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  selectedVehicleType: {
    borderWidth: 2,
  },
  vehicleTypeIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  vehicleTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  documentSection: {
    marginBottom: 24,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginLeft: 8,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
})

export default DriverOnboardingScreen

