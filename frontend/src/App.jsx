import { Routes, Route } from 'react-router-dom'
import  Navbar  from './components/Navbar'
import   UploadModel  from './pages/UploadModel'
import Home from './pages/Home'
import   ModelDetails  from './pages/ModelDetails'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadModel />} />
          <Route path="/model/:id" element={<ModelDetails />} />
          <Route path="/docs" element={<div className="text-center text-gray-600">Documentation Page (Placeholder)</div>} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default App