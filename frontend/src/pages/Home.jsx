import { useState, useEffect } from 'react'
import  ModelList  from '../components/ModelList.jsx'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'
import { toast } from 'react-toastify'

function Home() {
  const [models, setModels] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchModels()
  }, [pagination.page, filters])

  const fetchModels = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }
      const response = await api.get('/models', { params })
      setModels(response.data.models)
      setPagination(response.data.pagination)
    } catch{
      toast.error('Failed to fetch models')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
    setPagination({ ...pagination, page: 1 })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Model Dashboard</h1>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="uploading">Uploading</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="updated">Updated</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Model List */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <ModelList models={models} />
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          disabled={pagination.page === 1}
          className="flex items-center px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
        >
          <ChevronLeft className="h-5 w-5" /> Previous
        </button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          disabled={pagination.page === pagination.totalPages}
          className="flex items-center px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
        >
          Next <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default Home
