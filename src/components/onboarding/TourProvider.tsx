'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AppTourWizard } from './AppTourWizard'

interface TourContextType {
  startTour: () => void
  hasSeenTour: boolean
}

const TourContext = createContext<TourContextType | null>(null)

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within TourProvider')
  }
  return context
}

const TOUR_STORAGE_KEY = 'conozca_tour_completed'

export function TourProvider({ children }: { children: ReactNode }) {
  const [showTour, setShowTour] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setShowTour(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [hasSeenTour])

  const startTour = () => {
    setShowTour(true)
  }

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setHasSeenTour(true)
    setShowTour(false)
  }

  const handleSkip = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setHasSeenTour(true)
    setShowTour(false)
  }

  return (
    <TourContext.Provider value={{ startTour, hasSeenTour }}>
      {children}
      {showTour && (
        <AppTourWizard onComplete={handleComplete} onSkip={handleSkip} />
      )}
    </TourContext.Provider>
  )
}
