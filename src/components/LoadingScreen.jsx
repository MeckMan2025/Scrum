import { useState, useEffect } from 'react'

function LoadingScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  const handleTap = () => {
    if (isFading) return
    setIsFading(true)
    setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 500)
  }

  if (!isVisible) return null

  return (
    <div
      onClick={handleTap}
      onTouchStart={handleTap}
      className={`fixed inset-0 z-50 cursor-pointer transition-opacity duration-500 ${
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
