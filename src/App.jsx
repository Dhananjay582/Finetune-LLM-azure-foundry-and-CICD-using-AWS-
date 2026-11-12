import { useState, useEffect } from 'react'
import SetupScreen from './components/SetupScreen'
import ChatScreen from './components/ChatScreen'
import './App.css'

function App() {
  const [config, setConfig] = useState(null)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Load saved config from sessionStorage (not persisted across sessions for security)
    const saved = sessionStorage.getItem('azureConfig')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setConfig(parsed)
        setIsConfigured(true)
      } catch {}
    }
  }, [])

  const handleConfigure = (cfg) => {
    sessionStorage.setItem('azureConfig', JSON.stringify(cfg))
    setConfig(cfg)
    setIsConfigured(true)
  }

  const handleReset = () => {
    sessionStorage.removeItem('azureConfig')
    setConfig(null)
    setIsConfigured(false)
  }

  return (
    <div className="app-root">
      {/* Background gradient orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      {!isConfigured ? (
        <SetupScreen onConfigure={handleConfigure} />
      ) : (
        <ChatScreen config={config} onReset={handleReset} />
      )}
    </div>
  )
}

export default App
