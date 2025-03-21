"use client"

import type React from "react"
import type { ReactNode } from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Image, Text, ScrollView } from "react-native"
import { useRouter } from "expo-router"

interface RideLayoutProps {
  children: ReactNode
  title: string
  showBackButton?: boolean
  showMap?: boolean
  mapComponent?: ReactNode
  bottomComponent?: ReactNode
}

// Change from static StyleSheet.create to a function
const createStyles = (showMap: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    backButton: {
      padding: 8,
    },
    backIcon: {
      width: 20,
      height: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: "#1E293B",
    },
    placeholder: {
      width: 36,
    },
    mapContainer: {
      height: "40%",
    },
    contentContainer: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      borderTopLeftRadius: showMap ? 20 : 0,
      borderTopRightRadius: showMap ? 20 : 0,
      marginTop: showMap ? -20 : 0,
    },
    fullHeightContent: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    bottomContainer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: "#E2E8F0",
      backgroundColor: "#FFFFFF",
    },
  })

const RideLayout: React.FC<RideLayoutProps> = ({
  children,
  title,
  showBackButton = true,
  showMap = false,
  mapComponent,
  bottomComponent,
}) => {
  const router = useRouter()
  // Create styles with the current showMap value
  const styles = createStyles(showMap)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Image source={require("../assets/icons/back-arrow.png")} style={styles.backIcon} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      {showMap && mapComponent && <View style={styles.mapContainer}>{mapComponent}</View>}

      <View style={[styles.contentContainer, !showMap && styles.fullHeightContent]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {children}
        </ScrollView>

        {bottomComponent && <View style={styles.bottomContainer}>{bottomComponent}</View>}
      </View>
    </SafeAreaView>
  )
}

export default RideLayout;