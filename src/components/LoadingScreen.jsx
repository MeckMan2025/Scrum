import { useState, useEffect } from 'react'

function LoadingScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Start fade out after 2.5 seconds (leaving 0.5s for fade animation)
    const fadeTimer = setTimeout(() => {
      setIsFading(true)
    }, 2500)

    // Complete after 3 seconds
    const completeTimer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 3000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundImage: 'url("/Scrum/Background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}

export default LoadingScreen
