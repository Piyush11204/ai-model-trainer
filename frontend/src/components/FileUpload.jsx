import { useDropzone } from 'react-dropzone'
import { Upload, File } from 'lucide-react'

export function FileUpload({ onFileSelect, selectedFile }) {
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles[0]?.type === 'text/csv') {
      onFileSelect(acceptedFiles[0])
    } else {
      alert('Please upload a CSV file')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } })

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Dataset (CSV)</label>
      <div
        {...getRootProps()}
        className={`mt-1 border-2 border-dashed rounded-md p-6 text-center ${
          isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-2">
            <File className="h-6 w-6 text-gray-600" />
            <span>{selectedFile.name}</span>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your CSV file here, or click to select
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
