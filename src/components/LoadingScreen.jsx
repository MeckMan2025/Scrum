import { useState, useEffect, useRef } from 'react'
import { useUser } from '../contexts/UserContext'
import { supabase } from '../supabase'

function LoadingScreen({ onComplete, onMusicStart }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [error, setError] = useState('')
  const { username, login } = useUser()
  const [nameInput, setNameInput] = useState(username || '')
  const tappedRef = useRef(false)
  const audioRef = useRef(null)
  const channelRef = useRef(null)
  const [onlineUsers, setOnlineUsers] = useState({})

  // Subscribe to presence channel to check who's online
  useEffect(() => {
    const channel = supabase.channel('online-presence-check', {
      config: { presence: { key: '_login_checker' } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineUsers(state)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleTap = (e) => {
    e.preventDefault()
    if (tappedRef.current || isFading) return
    tappedRef.current = true

    // Start music
    const songs = ['/Scrum/intro.mp3', '/Scrum/radical-robotics.mp3']
    const audio = new Audio(songs[Math.floor(Math.random() * songs.length)])
    audio.volume = 1
    audio.play().catch(() => {})
    onMusicStart(audio)
    audioRef.current = audio

    // Always show login form
    setShowLogin(true)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return

    // Count how many times this name is already online
    const count = Object.entries(onlineUsers)
      .filter(([key]) => key !== '_login_checker')
      .filter(([key]) => key.toLowerCase() === name.toLowerCase())
      .reduce((sum, [, presences]) => sum + presences.length, 0)

    if (count >= 2) {
      setError(`"${name}" is already in use by 2 people. Try a different name.`)
      return
    }

    setError('')
    login(name)
    setIsFading(true)
    setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 500)
  }

  if (!isVisible) return null

  return (
    <div
      onClick={!showLogin ? handleTap : undefined}
      onTouchEnd={!showLogin ? handleTap : undefined}
      className={`fixed inset-0 z-50 transition-opacity duration-500 flex items-center justify-center ${
        !showLogin ? 'cursor-pointer' : ''
      } ${isFading ? 'opacity-0' : 'opacity-100'}`}
      style={{
        backgroundImage: 'url("/Scrum/Background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {!isFading && !showLogin && (
        <div className="absolute bottom-16">
          <p className="text-sm font-semibold animate-pulse bg-pastel-pink/80 text-gray-700 px-4 py-2 rounded-full shadow-md">Tap to start</p>
        </div>
      )}

      {showLogin && !isFading && (
        <form onSubmit={handleLogin} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-80 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pastel-blue-dark via-pastel-pink-dark to-pastel-orange-dark bg-clip-text text-transparent">
              Who is online?
            </h1>
            <p className="text-sm text-gray-500 mt-1">Enter your name to continue</p>
          </div>
          <div>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); setError('') }}
              placeholder="Your name"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pastel-blue focus:border-transparent text-center text-lg"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            {error && (
              <p className="text-sm text-red-500 text-center mt-2">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-pastel-pink hover:bg-pastel-pink-dark rounded-xl font-semibold text-gray-700 transition-colors text-lg"
          >
            Join
          </button>
        </form>
      )}
    </div>
  )
}

export default LoadingScreen
