import { Link } from 'react-router-dom'
import { FileText, Download } from 'lucide-react'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  uploading: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  updated: 'bg-purple-100 text-purple-800',
}

function ModelList({ models }) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {models.map((model) => (
            <tr key={model._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link to={`/model/${model._id}`} className="text-indigo-600 hover:text-indigo-900">
                  {model._id.slice(0, 8)}...
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{model.description.slice(0, 50)}...</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[model.status]}`}>
                  {model.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(model.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                {model.modelUrl && (
                  <a href={model.modelUrl} className="text-indigo-600 hover:text-indigo-900">
                    <Download className="h-5 w-5" />
                  </a>
                )}
                {model.docUrl && (
                  <a href={model.docUrl} className="text-indigo-600 hover:text-indigo-900">
                    <FileText className="h-5 w-5" />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ModelList
