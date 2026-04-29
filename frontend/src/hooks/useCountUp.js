import { useState, useEffect, useRef } from 'react'

export function useCountUp(end, duration = 1200, startOnMount = true) {
  const [count, setCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (!startOnMount) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setCount(end)
      setIsComplete(true)
      return
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)

      // easeOutQuart easing
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(eased * end))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setCount(end)
        setIsComplete(true)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [end, duration, startOnMount])

  return { count, isComplete }
}
