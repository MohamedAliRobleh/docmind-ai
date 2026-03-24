import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import DocumentList from '../../components/DocumentList'

const Documents = () => {
  const [docs, setDocs] = useState([])

  useEffect(() => {
    fetch('https://your-api/api/documents').then(res => res.json()).then(setDocs)
  }, [])

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#0a0a0f' }}>
      <DocumentList docs={docs} onSelect={(id) => console.log('Selected:', id)} />
    </View>
  )
}

export default Documents