import { View, StyleSheet } from "react-native"
import Home from "./home"

const Page = () => {
  return (
    <View style={styles.container}>
      <Home />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default Page

