"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from "react-native"

interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "cash"
  name: string
  details: string
  icon: any
}

interface PaymentProps {
  selectedMethod?: string
  onSelectMethod: (methodId: string) => void
  onAddPaymentMethod: () => void
  paymentMethods: PaymentMethod[]
}

const Payment: React.FC<PaymentProps> = ({ selectedMethod, onSelectMethod, onAddPaymentMethod, paymentMethods }) => {
  const [promoCode, setPromoCode] = useState("")
  const [isPromoApplied, setIsPromoApplied] = useState(false)

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      // Mock promo code application
      setIsPromoApplied(true)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Payment Method</Text>

      <View style={styles.paymentMethodsContainer}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.paymentMethodItem, selectedMethod === method.id && styles.selectedPaymentMethod]}
            onPress={() => onSelectMethod(method.id)}
          >
            <Image source={method.icon} style={styles.paymentIcon} />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentName}>{method.name}</Text>
              <Text style={styles.paymentInfo}>{method.details}</Text>
            </View>
            {selectedMethod === method.id && (
              <View style={styles.checkmarkContainer}>
                <Image source={require("../assets/icons/check.png")} style={styles.checkmark} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addPaymentButton} onPress={onAddPaymentMethod}>
          <View style={styles.addIconContainer}>
            <Text style={styles.plusIcon}>+</Text>
          </View>
          <Text style={styles.addPaymentText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.promoContainer}>
        <Text style={styles.promoTitle}>Promo Code</Text>
        <View style={styles.promoInputContainer}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter promo code"
            value={promoCode}
            onChangeText={setPromoCode}
            editable={!isPromoApplied}
          />
          <TouchableOpacity
            style={[
              styles.promoButton,
              isPromoApplied && styles.promoAppliedButton,
              !promoCode.trim() && styles.promoButtonDisabled,
            ]}
            onPress={handleApplyPromo}
            disabled={!promoCode.trim() || isPromoApplied}
          >
            <Text style={styles.promoButtonText}>{isPromoApplied ? "Applied" : "Apply"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    marginBottom: 16,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: "#4285F4",
    borderWidth: 2,
  },
  paymentIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  paymentInfo: {
    fontSize: 14,
    color: "#64748B",
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    width: 14,
    height: 14,
    tintColor: "#FFFFFF",
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  plusIcon: {
    fontSize: 20,
    fontWeight: "600",
    color: "#64748B",
  },
  addPaymentText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
  },
  promoContainer: {
    marginTop: 8,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    marginBottom: 8,
  },
  promoInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  promoInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  promoButton: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: "#4285F4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  promoButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  promoAppliedButton: {
    backgroundColor: "#10B981",
  },
  promoButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default Payment

