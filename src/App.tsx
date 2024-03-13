import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import MainPage from './pages/MainPage'
import Editable from './components/Editable'

function App() {
  return (
    <Router>
      <Routes>
        <Route index path="/" element={<MainPage />} />
        <Route index path="/editable" element={<Editable />} />
      </Routes>
    </Router>
  )
}

export default App
