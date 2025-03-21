import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native"

interface CustomButtonProps {
  title: string
  onPress: () => void
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
  loading?: boolean
  primary?: boolean
  secondary?: boolean
  outline?: boolean
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  primary = true,
  secondary = false,
  outline = false,
}) => {
  let buttonStyle = styles.button
  let buttonTextStyle = styles.buttonText

  if (primary) {
    buttonStyle = { ...buttonStyle, ...styles.primaryButton }
    buttonTextStyle = { ...buttonTextStyle, ...styles.primaryButtonText }
  } else if (secondary) {
    buttonStyle = { ...buttonStyle, ...styles.secondaryButton }
    buttonTextStyle = { ...buttonTextStyle, ...styles.secondaryButtonText }
  } else if (outline) {
    buttonStyle = { ...buttonStyle, ...styles.outlineButton }
    buttonTextStyle = { ...buttonTextStyle, ...styles.outlineButtonText }
  }

  if (disabled) {
    buttonStyle = { ...buttonStyle, ...styles.disabledButton }
    buttonTextStyle = { ...buttonTextStyle, ...styles.disabledButtonText }
  }

  return (
    <TouchableOpacity style={{ ...buttonStyle, ...style }} onPress={onPress} disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={primary ? "#FFFFFF" : "#4285F4"} />
      ) : (
        <Text style={{ ...buttonTextStyle, ...textStyle }}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#4285F4",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#F1F5F9",
  },
  secondaryButtonText: {
    color: "#4285F4",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4285F4",
  },
  outlineButtonText: {
    color: "#4285F4",
  },
  disabledButton: {
    backgroundColor: "#E2E8F0",
    opacity: 0.7,
  },
  disabledButtonText: {
    color: "#94A3B8",
  },
})

export default CustomButton

