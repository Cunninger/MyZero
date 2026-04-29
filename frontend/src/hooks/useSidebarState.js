import { useState, useCallback } from 'react'

const MIN_WIDTH = 200
const MAX_WIDTH = 420
const DEFAULT_WIDTH = 260
const COLLAPSED_WIDTH = 64

export function useSidebarState() {
  const [isOpen, setIsOpen] = useState(() =>
    localStorage.getItem('myzero_sidebar') !== 'collapsed'
  )
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('myzero_sidebar_width')
    return saved ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parseInt(saved, 10) || DEFAULT_WIDTH)) : DEFAULT_WIDTH
  })

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      localStorage.setItem('myzero_sidebar', prev ? 'collapsed' : 'expanded')
      return !prev
    })
  }, [])

  const startResize = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = width
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMouseMove = (e) => {
      const delta = e.clientX - startX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta))
      setWidth(newWidth)
    }

    const onMouseUp = () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setWidth(w => {
        localStorage.setItem('myzero_sidebar_width', String(w))
        return w
      })
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [width])

  const currentWidth = isOpen ? width : COLLAPSED_WIDTH

  return { isOpen, toggle, width: currentWidth, startResize }
}
