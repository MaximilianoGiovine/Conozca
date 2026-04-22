'use client'

import { useMemo, useState } from 'react'
import { OnboardingWizard } from './OnboardingWizard'

interface OnboardingProviderProps {
  userRole: 'user' | 'author' | 'admin' | 'superadmin'
  userId: string
}

const ONBOARDING_KEY = 'conozca_onboarding_completed'

export function OnboardingProvider({ userRole, userId }: OnboardingProviderProps) {
  const [dismissed, setDismissed] = useState(false)

  const showOnboarding = useMemo(() => {
    if (typeof window === 'undefined') return false
    const storageKey = `${ONBOARDING_KEY}_${userId}`
    const completed = localStorage.getItem(storageKey)
    return !completed && !dismissed
  }, [dismissed, userId])

  const handleComplete = () => {
    const storageKey = `${ONBOARDING_KEY}_${userId}`
    localStorage.setItem(storageKey, 'true')
    setDismissed(true)
  }

  if (!showOnboarding) return null

  return (
    <OnboardingWizard
      userRole={userRole}
      onComplete={handleComplete}
    />
  )
}
