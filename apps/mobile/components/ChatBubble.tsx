import React from 'react'
import { View, Text } from 'react-native'

interface ChatBubbleProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => (
  <View style={{
    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
    backgroundColor: message.role === 'user' ? '#007AFF' : '#E5E5EA',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    maxWidth: '70%'
  }}>
    <Text style={{ color: message.role === 'user' ? 'white' : 'black' }}>{message.content}</Text>
  </View>
)

export default ChatBubble