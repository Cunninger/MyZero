import { useState, useCallback } from 'react'

export function useSidebarState() {
  const [isOpen, setIsOpen] = useState(() =>
    localStorage.getItem('myzero_sidebar') !== 'collapsed'
  )

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      localStorage.setItem('myzero_sidebar', prev ? 'collapsed' : 'expanded')
      return !prev
    })
  }, [])

  return { isOpen, toggle }
}
