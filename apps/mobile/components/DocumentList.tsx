import React from 'react'
import { FlatList, Text, TouchableOpacity } from 'react-native'

interface Document {
  id: string
  name: string
  created_at: string
}

interface DocumentListProps {
  docs: Document[]
  onSelect: (id: string) => void
}

const DocumentList: React.FC<DocumentListProps> = ({ docs, onSelect }) => (
  <FlatList
    data={docs}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => onSelect(item.id)} style={{ padding: 10, borderBottomWidth: 1 }}>
        <Text>{item.name}</Text>
        <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
      </TouchableOpacity>
    )}
    keyExtractor={item => item.id}
  />
)

export default DocumentList