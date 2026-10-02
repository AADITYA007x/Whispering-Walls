import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Entrance from './pages/Entrance.jsx'
import Wing from './pages/Wing.jsx'
import Room from './pages/Room.jsx'
import Painting from './pages/Painting.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Entrance />} />
            <Route path="/wing/:wingId" element={<Wing />} />
            <Route path="/wing/:wingId/room/:roomId" element={<Room />} />
            <Route path="/painting/:id" element={<Painting />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
