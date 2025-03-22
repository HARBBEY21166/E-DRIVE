"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import useStore from "../../../store"
import { useTheme } from "../../../context/ThemeContext"
import ErrorAlert from "../../../components/ErrorAlert"

interface Message {
  id: string
  text: string
  sender: "user" | "driver" | "system"
  timestamp: Date
  status: "sending" | "sent" | "delivered" | "read" | "error"
  isTyping?: boolean
}

const ChatScreen = () => {
  const { user, currentRide, sendMessage, getMessages } = useStore()
  const { colors, isDarkMode } = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDriverTyping, setIsDriverTyping] = useState(false)

  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    loadMessages()

    // Set up polling for new messages (in a real app, use WebSockets)
    const interval = setInterval(() => {
      checkForNewMessages()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const loadMessages = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, fetch messages from your API
      const fetchedMessages = await getMessages()
      setMessages(fetchedMessages)
    } catch (err) {
      console.error("Error loading messages:", err)
      setError("Failed to load messages. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const checkForNewMessages = async () => {
    try {
      // In a real app, check for new messages from your API
      // For this example, we'll simulate a new message occasionally
      if (Math.random() > 0.7 && messages.length > 0) {
        simulateDriverTyping()
      }
    } catch (err) {
      console.error("Error checking for new messages:", err)
    }
  }

  const simulateDriverTyping = () => {
    setIsDriverTyping(true)

    // After a delay, add a new message
    setTimeout(() => {
      setIsDriverTyping(false)

      const driverResponses = [
        "I'm on my way!",
        "I'll be there in about 5 minutes.",
        "Just passing through traffic now.",
        "Can you confirm your exact location?",
        "I've arrived at the pickup point.",
        "I'm in a blue Toyota Corolla.",
        "Please look out for my car.",
      ]

      const randomResponse = driverResponses[Math.floor(Math.random() * driverResponses.length)]

      const newMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: "driver",
        timestamp: new Date(),
        status: "sent",
      }

      setMessages((prev) => [...prev, newMessage])
    }, 3000)
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    }

    setMessages((prevMessages) => [...prevMessages, newMessage])
    setInputText("")

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)

    try {
      // In a real app, send the message to your API
      await sendMessage(newMessage.text)

      // Update message status
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)),
      )

      // Simulate driver typing and response after a delay
      setTimeout(() => {
        simulateDriverTyping()
      }, 1000)
    } catch (err) {
      console.error("Error sending message:", err)

      // Update message status to error
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "error" } : msg)),
      )
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessageStatus = (status: string) => {
    switch (status) {
      case "sending":
        return <ActivityIndicator size="small" color={colors.TEXT_SECONDARY} style={styles.statusIcon} />
      case "sent":
        return (
          <Image
            source={require("../../../assets/icons/check.png")}
            style={[styles.statusIcon, { tintColor: colors.TEXT_SECONDARY }]}
          />
        )
      case "delivered":
        return (
          <Image
            source={require("../../../assets/icons/check-double.svg")}
            style={[styles.statusIcon, { tintColor: colors.TEXT_SECONDARY }]}
          />
        )
      case "read":
        return (
          <Image
            source={require("../../../assets/icons/check-double.svg")}
            style={[styles.statusIcon, { tintColor: colors.PRIMARY }]}
          />
        )
      case "error":
        return (
          <Image
            source={require("../../../assets/icons/circle-exclamation-solid.svg")}
            style={[styles.statusIcon, { tintColor: colors.ERROR }]}
          />
        )
      default:
        return null
    }
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user"
    const isSystem = item.sender === "system"

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text
            style={[
              styles.systemMessageText,
              {
                color: colors.TEXT_SECONDARY,
                backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
              },
            ]}
          >
            {item.text}
          </Text>
          <Text style={[styles.messageTime, { color: colors.TEXT_SECONDARY }]}>{formatTime(item.timestamp)}</Text>
        </View>
      )
    }

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.otherMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Image
              source={
                currentRide?.driver?.avatar
                  ? { uri: currentRide.driver.avatar }
                  : require("../../../assets/icons/person.png")
              }
              style={[styles.avatar, { backgroundColor: isDarkMode ? colors.SURFACE : colors.BORDER }]}
            />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userMessageBubble, { backgroundColor: colors.PRIMARY }]
              : [
                  styles.otherMessageBubble,
                  { backgroundColor: isDarkMode ? colors.SURFACE : "#FFFFFF", borderColor: colors.BORDER },
                ],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : [styles.otherMessageText, { color: colors.TEXT }],
            ]}
          >
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isUser ? styles.userMessageTime : [styles.otherMessageTime, { color: colors.TEXT_SECONDARY }],
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>
            {isUser && renderMessageStatus(item.status)}
          </View>
        </View>
      </View>
    )
  }

  const renderTypingIndicator = () => {
    if (!isDriverTyping) return null

    return (
      <View style={[styles.messageContainer, styles.otherMessageContainer]}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              currentRide?.driver?.avatar
                ? { uri: currentRide.driver.avatar }
                : require("../../../assets/icons/person.png")
            }
            style={[styles.avatar, { backgroundColor: isDarkMode ? colors.SURFACE : colors.BORDER }]}
          />
        </View>
        <View
          style={[
            styles.messageBubble,
            styles.typingBubble,
            { backgroundColor: isDarkMode ? colors.SURFACE : "#FFFFFF", borderColor: colors.BORDER },
          ]}
        >
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, { backgroundColor: colors.TEXT_SECONDARY }]} />
            <View style={[styles.typingDot, { backgroundColor: colors.TEXT_SECONDARY }]} />
            <View style={[styles.typingDot, { backgroundColor: colors.TEXT_SECONDARY }]} />
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <View style={[styles.header, { backgroundColor: colors.SURFACE, borderBottomColor: colors.BORDER }]}>
        <Text style={[styles.title, { color: colors.TEXT }]}>Chat</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {error && <ErrorAlert message={error} onRetry={loadMessages} onDismiss={() => setError(null)} />}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.PRIMARY} />
            <Text style={[styles.loadingText, { color: colors.TEXT }]}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
            ListFooterComponent={renderTypingIndicator}
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: colors.SURFACE, borderTopColor: colors.BORDER }]}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDarkMode ? colors.BACKGROUND : colors.BORDER, color: colors.TEXT },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.TEXT_SECONDARY}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() ? { backgroundColor: colors.BORDER } : { backgroundColor: colors.PRIMARY },
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Image
              source={require("../../../assets/icons/arrow-up.png")}
              style={[styles.sendIcon, { tintColor: "#FFFFFF" }]}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  otherMessageText: {
    color: "#1E293B",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  userMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
    marginRight: 4,
  },
  otherMessageTime: {
    color: "#64748B",
  },
  statusIcon: {
    width: 14,
    height: 14,
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  systemMessageText: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendIcon: {
    width: 20,
    height: 20,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    opacity: 0.7,
  },
})

export default ChatScreen

