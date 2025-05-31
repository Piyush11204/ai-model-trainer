import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from '../components/FileUpload'
import { api } from '../lib/api'
import { toast } from 'react-toastify'

function UploadModel() {
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !description) {
      toast.error('Please provide a file and description')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('dataset', file)
    formData.append('description', description)

    try {
      const response = await api.post('/models', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Model uploaded successfully')
      navigate(`/model/${response.data.modelId}`)
    } catch {
      toast.error('Failed to upload model')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload New Model</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="4"
              placeholder="Describe your model"
            />
          </div>
          <FileUpload onFileSelect={setFile} selectedFile={file} />
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Model'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UploadModel
