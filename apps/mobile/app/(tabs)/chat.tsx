import React, { useState } from 'react'
import { View, TextInput, Button, FlatList } from 'react-native'
import ChatBubble from '../../components/ChatBubble'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    if (!input.trim()) return
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    // API call here
    setInput('')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <ChatBubble message={item} />}
        keyExtractor={(item, index) => index.toString()}
        style={{ flex: 1 }}
      />
      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, color: 'white' }}
          placeholder="Ask a question..."
          placeholderTextColor="#ccc"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  )
}

export default Chat