import { Link } from 'react-router-dom'
import { Book, Upload, Home as HomeIcon } from 'lucide-react'

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-8" />
          <span className="text-xl font-bold">AI Model Marketplace</span>
        </Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300 flex items-center">
            <HomeIcon className="h-5 w-5 mr-1" /> Home
          </Link>
          <Link to="/upload" className="hover:text-gray-300 flex items-center">
            <Upload className="h-5 w-5 mr-1" /> Upload Model
          </Link>
          <Link to="/docs" className="hover:text-gray-300 flex items-center">
            <Book className="h-5 w-5 mr-1" /> Docs
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
