import { Tabs } from "expo-router"
import { Image, StyleSheet } from "react-native"

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4285F4",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Image source={require("../../../assets/icons/home.png")} style={[styles.tabIcon, { tintColor: color }]} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "My Rides",
          tabBarIcon: ({ color, size }) => (
            <Image source={require("../../../assets/icons/list.png")} style={[styles.tabIcon, { tintColor: color }]} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Image source={require("../../../assets/icons/chat.png")} style={[styles.tabIcon, { tintColor: color }]} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../../assets/icons/profile.png")}
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
})

export default TabsLayout

