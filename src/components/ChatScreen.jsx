import { useState, useRef, useEffect, useCallback } from 'react'
import { AzureOpenAI } from 'openai'
import {
  Bot, User, Send, Settings, Trash2, Download,
  RefreshCw, ChevronDown, Sparkles, MessageSquare,
  Clock, CheckCheck, AlertCircle, Zap
} from 'lucide-react'
import './ChatScreen.css'

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function TypingDots() {
  return (
    <div className="typing-dots">
      <span style={{ animationDelay: '0ms' }} />
      <span style={{ animationDelay: '150ms' }} />
      <span style={{ animationDelay: '300ms' }} />
    </div>
  )
}

function MessageBubble({ msg, botName }) {
  const isUser = msg.role === 'user'
  const isStreaming = msg.streaming

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}
      style={{ animation: `${isUser ? 'slideInRight' : 'slideInLeft'} 0.3s ease` }}>
      {!isUser && (
        <div className="avatar bot-avatar">
          <Bot size={16} strokeWidth={1.5} />
        </div>
      )}
      <div className="bubble-col">
        <div className="bubble-meta">
          {!isUser && <span className="sender-name">{botName}</span>}
          {isUser && <span className="sender-name">You</span>}
          <span className="bubble-time">{formatTime(msg.timestamp)}</span>
          {isUser && <CheckCheck size={12} className="read-tick" />}
        </div>
        <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
          {msg.content ? (
            <div className="bubble-text">{msg.content}</div>
          ) : isStreaming ? (
            <TypingDots />
          ) : null}
          {isStreaming && msg.content && (
            <span className="cursor-blink">▌</span>
          )}
        </div>
        {msg.error && (
          <div className="bubble-error">
            <AlertCircle size={12} /> {msg.error}
          </div>
        )}
      </div>
      {isUser && (
        <div className="avatar user-avatar">
          <User size={16} strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}

function WelcomeCard({ botName, onSuggestion }) {
  const suggestions = [
    'How can I track my order?',
    'What is your return policy?',
    'I need help with my account',
    'How do I contact a human agent?',
  ]
  return (
    <div className="welcome-card">
      <div className="welcome-icon">
        <Sparkles size={28} />
      </div>
      <h2 className="welcome-title">Hello! I'm {botName} 👋</h2>
      <p className="welcome-sub">Your AI-powered customer support assistant. I'm here to help you with any questions or issues you may have.</p>
      <div className="suggestion-grid">
        {suggestions.map(s => (
          <button key={s} className="suggestion-btn" onClick={() => onSuggestion(s)}>
            <MessageSquare size={14} />
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChatScreen({ config, onReset }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('connected')

  const messagesEndRef = useRef(null)
  const chatBodyRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => {
    scrollToBottom(false)
  }, [messages, scrollToBottom])

  useEffect(() => {
    const el = chatBodyRef.current
    if (!el) return
    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100)
    }
    el.addEventListener('scroll', handler)
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const buildClient = () => new AzureOpenAI({
    apiVersion: config.apiVersion,
    endpoint: config.endpoint,
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true,
  })

  const sendMessage = useCallback(async (text) => {
    const userText = text.trim()
    if (!userText || isStreaming) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    }

    const assistantMsgId = Date.now() + 1
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      streaming: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
    setCharCount(0)
    setIsStreaming(true)
    setConnectionStatus('streaming')

    // Build history for API (exclude streaming placeholders)
    const history = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    const systemMsg = { role: 'system', content: config.systemPrompt }

    try {
      const client = buildClient()
      const stream = await client.chat.completions.create({
        model: config.deployment,
        messages: [systemMsg, ...history],
        max_tokens: 2048,
        temperature: parseFloat(config.temperature),
        top_p: 1.0,
        stream: true,
      })

      let accumulated = ''

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || ''
        if (delta) {
          accumulated += delta
          setMessages(prev => prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, content: accumulated }
              : m
          ))
        }
      }

      // Finalize
      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId
          ? { ...m, streaming: false, content: accumulated }
          : m
      ))
      setConnectionStatus('connected')

    } catch (err) {
      console.error(err)
      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId
          ? {
              ...m,
              streaming: false,
              content: 'Sorry, I encountered an error. Please check your API key and try again.',
              error: err.message,
            }
          : m
      ))
      setConnectionStatus('error')
      setTimeout(() => setConnectionStatus('connected'), 3000)
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }, [messages, isStreaming, config])

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    setCharCount(e.target.value.length)
  }

  const clearChat = () => {
    if (isStreaming) return
    setMessages([])
  }

  const exportChat = () => {
    const content = messages
      .map(m => `[${formatTime(m.timestamp)}] ${m.role === 'user' ? 'You' : config.botName}: ${m.content}`)
      .join('\n\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${new Date().toISOString().slice(0,10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusColors = {
    connected: '#10b981',
    streaming: '#6366f1',
    error: '#ef4444',
  }

  const statusLabels = {
    connected: 'Online',
    streaming: 'Responding...',
    error: 'Error',
  }

  return (
    <div className="chat-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Bot size={20} strokeWidth={1.5} />
          </div>
          <div className="sidebar-brand">
            <span className="brand-name">{config.botName}</span>
            <span className="brand-sub">Customer Support</span>
          </div>
        </div>

        <div className="sidebar-status">
          <span
            className="status-dot"
            style={{ background: statusColors[connectionStatus] }}
          />
          <span className="status-text">{statusLabels[connectionStatus]}</span>
        </div>

        <div className="sidebar-stats">
          <div className="stat-item">
            <MessageSquare size={14} />
            <span>{messages.length} messages</span>
          </div>
          <div className="stat-item">
            <Clock size={14} />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="stat-item">
            <Zap size={14} />
            <span>GPT-4o Fine-tuned</span>
          </div>
        </div>

        <div className="sidebar-actions">
          <button className="sidebar-btn" onClick={clearChat} disabled={isStreaming || messages.length === 0}>
            <Trash2 size={15} />
            Clear Chat
          </button>
          <button className="sidebar-btn" onClick={exportChat} disabled={messages.length === 0}>
            <Download size={15} />
            Export Chat
          </button>
          <button className="sidebar-btn danger" onClick={onReset}>
            <Settings size={15} />
            Reconfigure
          </button>
        </div>

        <div className="sidebar-footer">
          <p>Powered by Azure OpenAI</p>
          <p>GPT-4o Fine-tuned Model</p>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="chat-main">
        {/* Top bar */}
        <header className="chat-header">
          <div className="chat-header-info">
            <div className="header-avatar">
              <Bot size={18} strokeWidth={1.5} />
              <span className="header-status-dot" style={{ background: statusColors[connectionStatus] }} />
            </div>
            <div>
              <h2 className="header-title">{config.botName}</h2>
              <p className="header-sub">{statusLabels[connectionStatus]}</p>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="hdr-btn" onClick={clearChat} disabled={isStreaming || messages.length === 0} title="Clear chat">
              <RefreshCw size={16} />
            </button>
            <button className="hdr-btn" onClick={exportChat} disabled={messages.length === 0} title="Export">
              <Download size={16} />
            </button>
            <button className="hdr-btn danger-btn" onClick={onReset} title="Settings">
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="chat-body" ref={chatBodyRef}>
          {messages.length === 0 ? (
            <WelcomeCard botName={config.botName} onSuggestion={sendMessage} />
          ) : (
            <div className="messages-list">
              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} botName={config.botName} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {showScrollBtn && (
            <button className="scroll-to-bottom" onClick={() => scrollToBottom()}>
              <ChevronDown size={18} />
            </button>
          )}
        </div>

        {/* Input area */}
        <div className="chat-footer">
          <form className="input-form" onSubmit={handleSubmit}>
            <div className="input-box">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                disabled={isStreaming}
                rows={1}
                maxLength={2000}
              />
              <div className="input-footer-row">
                <span className="char-count">{charCount}/2000</span>
                <button
                  type="submit"
                  className={`send-btn ${isStreaming ? 'streaming' : ''} ${input.trim() ? 'active' : ''}`}
                  disabled={isStreaming || !input.trim()}
                >
                  {isStreaming ? (
                    <div className="send-spinner" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </form>
          <p className="footer-note">
            AI responses may contain errors. Verify critical information.
          </p>
        </div>
      </main>
    </div>
  )
}
