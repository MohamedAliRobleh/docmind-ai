import React, { useState } from 'react'
import { View, Text } from 'react-native'
import UploadButton from '../../components/UploadButton'

const Home = () => {
  const [uploaded, setUploaded] = useState(false)

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#0a0a0f' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>DocuMind AI</Text>
      <UploadButton onUpload={() => setUploaded(true)} />
      {uploaded && <Text style={{ color: 'white', marginTop: 20 }}>Document uploaded successfully!</Text>}
    </View>
  )
}

export default Home