import { useState } from 'react'
import { Bot, Key, Globe, Cpu, Eye, EyeOff, Zap, Shield, ChevronRight } from 'lucide-react'
import './SetupScreen.css'

const DEFAULT_ENDPOINT = 'https://2340401106-8532-resource.cognitiveservices.azure.com/'
const DEFAULT_DEPLOYMENT = 'gpt-4o-2024-08-06-my_model'
const DEFAULT_API_VERSION = '2024-12-01-preview'

export default function SetupScreen({ onConfigure }) {
  const [form, setForm] = useState({
    endpoint: DEFAULT_ENDPOINT,
    deployment: DEFAULT_DEPLOYMENT,
    apiKey: '',
    apiVersion: DEFAULT_API_VERSION,
    systemPrompt: 'You are a helpful, friendly, and professional customer support assistant. Your goal is to assist customers with their questions, resolve issues efficiently, and provide accurate information. Always be empathetic, clear, and concise in your responses.',
    botName: 'SupportAI',
    temperature: 0.7,
  })
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.apiKey.trim()) {
      setError('API key is required')
      return
    }
    if (!form.endpoint.trim()) {
      setError('Endpoint is required')
      return
    }
    if (!form.deployment.trim()) {
      setError('Deployment name is required')
      return
    }
    setLoading(true)
    setError('')
    // Small UX delay for perceived validation
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    onConfigure(form)
  }

  return (
    <div className="setup-wrapper">
      <div className="setup-container">
        {/* Header */}
        <div className="setup-header">
          <div className="setup-logo">
            <div className="logo-ring">
              <Bot size={32} strokeWidth={1.5} />
            </div>
            <div className="logo-pulse" />
          </div>
          <h1 className="setup-title">Customer Support AI</h1>
          <p className="setup-subtitle">Configure your Azure OpenAI powered support bot</p>
        </div>

        {/* Feature pills */}
        <div className="feature-pills">
          <span className="pill"><Zap size={12} /> Streaming</span>
          <span className="pill"><Shield size={12} /> Secure</span>
          <span className="pill"><Cpu size={12} /> Fine-tuned GPT-4o</span>
        </div>

        {/* Form */}
        <form className="setup-form" onSubmit={handleSubmit}>
          {/* API Key */}
          <div className="form-group">
            <label className="form-label">
              <Key size={14} />
              Azure API Key <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                name="apiKey"
                value={form.apiKey}
                onChange={handleChange}
                placeholder="Enter your Azure OpenAI API key"
                className="form-input"
                autoComplete="off"
              />
              <button
                type="button"
                className="toggle-eye"
                onClick={() => setShowKey(v => !v)}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Two-col: Endpoint + Deployment */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Globe size={14} />
                Azure Endpoint <span className="required">*</span>
              </label>
              <input
                type="url"
                name="endpoint"
                value={form.endpoint}
                onChange={handleChange}
                placeholder="https://your-resource.cognitiveservices.azure.com/"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Cpu size={14} />
                Deployment Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="deployment"
                value={form.deployment}
                onChange={handleChange}
                placeholder="gpt-4o-2024-08-06-my_model"
                className="form-input"
              />
            </div>
          </div>

          {/* Two-col: API Version + Bot Name */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">API Version</label>
              <input
                type="text"
                name="apiVersion"
                value={form.apiVersion}
                onChange={handleChange}
                placeholder="2024-12-01-preview"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bot Name</label>
              <input
                type="text"
                name="botName"
                value={form.botName}
                onChange={handleChange}
                placeholder="SupportAI"
                className="form-input"
              />
            </div>
          </div>

          {/* System Prompt */}
          <div className="form-group">
            <label className="form-label">System Prompt</label>
            <textarea
              name="systemPrompt"
              value={form.systemPrompt}
              onChange={handleChange}
              placeholder="You are a helpful customer support assistant..."
              className="form-textarea"
              rows={4}
            />
            <p className="form-hint">This sets the personality and behavior of your support bot</p>
          </div>

          {/* Temperature */}
          <div className="form-group">
            <label className="form-label">
              Temperature: <strong>{parseFloat(form.temperature).toFixed(1)}</strong>
              <span className="temp-label">{form.temperature <= 0.3 ? '— Precise' : form.temperature <= 0.7 ? '— Balanced' : '— Creative'}</span>
            </label>
            <input
              type="range"
              name="temperature"
              min="0"
              max="1"
              step="0.1"
              value={form.temperature}
              onChange={handleChange}
              className="form-range"
            />
            <div className="range-labels">
              <span>Precise (0.0)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Connecting...
              </>
            ) : (
              <>
                Launch Support Bot
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="setup-note">
          🔒 Your API key is stored only in your browser session and never sent to any third party.
        </p>
      </div>
    </div>
  )
}
