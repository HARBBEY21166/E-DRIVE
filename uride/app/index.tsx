import { Redirect } from "expo-router"
import { useAppStateManager } from "../lib/app-state-manager"

export default function Index() {
  // Initialize app state manager to handle background/foreground transitions
  useAppStateManager()

  return <Redirect href="/(auth)/welcome" />
}

