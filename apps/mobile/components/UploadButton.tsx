import React from 'react'
import { Button } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'

interface UploadButtonProps {
  onUpload: () => void
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' })
    if (result.type === 'success') {
      const formData = new FormData()
      formData.append('file', {
        uri: result.uri,
        name: result.name,
        type: 'application/pdf'
      } as any)
      await fetch('https://your-api/api/upload', { method: 'POST', body: formData })
      onUpload()
    }
  }

  return <Button title="Upload PDF" onPress={pickDocument} />
}

export default UploadButton