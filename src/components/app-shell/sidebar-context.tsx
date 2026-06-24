import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'

interface SidebarContextValue {
  isCollapsed: boolean
  isMobileOpen: boolean
  /** Collapsed sidebar is being peeked at via hover (shared by rail + sidebar). */
  isHovered: boolean
  setHovered: (v: boolean) => void
  toggleCollapsed: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const DEFAULT_STORAGE_KEY = 'smable_sidebar_collapsed'

export function SidebarProvider({
  children,
  storageKey = DEFAULT_STORAGE_KEY,
}: {
  children: React.ReactNode
  storageKey?: string
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Small delay on leave so moving the cursor across the rail<->sidebar seam
  // (separate mouseleave/mouseenter events) doesn't flicker the peek.
  const setHovered = useCallback((v: boolean) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    if (v) {
      setIsHovered(true)
    } else {
      hoverTimer.current = setTimeout(() => setIsHovered(false), 120)
    }
  }, [])

  // Load collapsed state from localStorage
  useEffect(() => {
    if (localStorage.getItem(storageKey) === 'true') {
      setIsCollapsed(true)
    }
  }, [storageKey])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(storageKey, String(next))
      return next
    })
  }, [storageKey])

  const toggleMobile = useCallback(() => setIsMobileOpen((prev) => !prev), [])
  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        isHovered,
        setHovered,
        toggleCollapsed,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
