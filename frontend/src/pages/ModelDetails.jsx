import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Download, Edit, Trash, RefreshCw } from 'lucide-react'
import { api } from '../lib/api'
import { toast } from 'react-toastify'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  uploading: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  updated: 'bg-purple-100 text-purple-800',
}

function ModelDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [model, setModel] = useState(null)
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchModel()
  }, [id])

  const fetchModel = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/models/${id}`)
      setModel(response.data)
      setDescription(response.data.description)
    } catch (error) {
      toast.error('Failed to fetch model')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await api.put(`/models/${id}`, { description, retrain: false })
      toast.success('Model updated successfully')
      setEditing(false)
      fetchModel()
    } catch (error) {
      toast.error('Failed to update model')
    } finally {
      setUpdating(false)
    }
  }

  const handleRetrain = async () => {
    setUpdating(true)
    try {
      await api.put(`/models/${id}`, { description, retrain: true })
      toast.success('Model retraining initiated')
      fetchModel()
    } catch (error) {
      toast.error('Failed to initiate retraining')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this model?')) return
    try {
      await api.delete(`/models/${id}`)
      toast.success('Model deleted successfully')
      navigate('/')
    } catch (error) {
      toast.error('Failed to delete model')
    }
  }

  if (loading) return <div className="text-center">Loading...</div>
  if (!model) return <div className="text-center">Model not found</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Model Details</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">ID</h2>
            <p className="mt-1 text-gray-600">{model._id}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Status</h2>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[model.status]}`}>
              {model.status}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Created At</h2>
            <p className="mt-1 text-gray-600">{new Date(model.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Updated At</h2>
            <p className="mt-1 text-gray-600">{new Date(model.updatedAt).toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <h2 className="text-lg font-medium text-gray-900">Description</h2>
            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="4"
                />
                <div className="space-x-2">
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-gray-300 text-gray-800 py-1 px-3 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-gray-600">{model.description}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            <Edit className="h-5 w-5 mr-2" /> Edit
          </button>
          <button
            onClick={handleRetrain}
            disabled={updating}
            className="flex items-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw className="h-5 w-5 mr-2" /> Retrain
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            <Trash className="h-5 w-5 mr-2" /> Delete
          </button>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Files</h2>
          <div className="space-y-2">
            {model.modelUrl && (
              <a
                href={model.modelUrl}
                className="flex items-center text-indigo-600 hover:text-indigo-900"
              >
                <Download className="h-5 w-5 mr-2" /> Download Model (.pkl)
              </a>
            )}
            {model.docUrl && (
              <a
                href={model.docUrl}
                className="flex items-center text-indigo-600 hover:text-indigo-900"
              >
                <FileText className="h-5 w-5 mr-2" /> Download Documentation (PDF)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelDetails
