"use client"

import { useState, useEffect } from "react"
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
} from "react-native"
import useStore from "../../../store"

interface Message {
  id: string
  text: string
  sender: "user" | "driver" | "system"
  timestamp: Date
}

const ChatScreen = () => {
  const { user, currentRide } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")

  useEffect(() => {
    // Load mock messages
    const mockMessages: Message[] = [
      {
        id: "1",
        text: "Your ride has been confirmed.",
        sender: "system",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        id: "2",
        text: "I am on my way to pick you up.",
        sender: "driver",
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      },
      {
        id: "3",
        text: "Great! I'll be waiting outside.",
        sender: "user",
        timestamp: new Date(Date.now() - 1700000), // 28 minutes ago
      },
      {
        id: "4",
        text: "I'm stuck in a bit of traffic. Will be there in about 5 minutes.",
        sender: "driver",
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      },
      {
        id: "5",
        text: "No problem, take your time.",
        sender: "user",
        timestamp: new Date(Date.now() - 800000), // 13 minutes ago
      },
    ]

    setMessages(mockMessages)
  }, [])

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prevMessages) => [...prevMessages, newMessage])
      setInputText("")

      // Simulate driver response after a delay
      setTimeout(() => {
        const driverResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Got it, thanks!",
          sender: "driver",
          timestamp: new Date(),
        }

        setMessages((prevMessages) => [...prevMessages, driverResponse])
      }, 2000)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user"
    const isSystem = item.sender === "system"

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      )
    }

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.otherMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Image source={require("../../../assets/icons/person.png")} style={styles.avatar} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.otherMessageBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.otherMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.otherMessageTime]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.disabledSendButton]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Image source={require("../../../assets/icons/arrow-up.png")} style={styles.sendIcon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
  },
  content: {
    flex: 1,
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
    backgroundColor: "#E2E8F0",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: "#4285F4",
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
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
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  otherMessageTime: {
    color: "#64748B",
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  systemMessageText: {
    fontSize: 14,
    color: "#64748B",
    backgroundColor: "rgba(226, 232, 240, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
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
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: "#CBD5E1",
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF",
  },
})

export default ChatScreen

