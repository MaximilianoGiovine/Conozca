'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Step {
  title: string
  description: string
  icon: React.ReactNode
  action?: {
    label: string
    href: string
  }
}

const authorSteps: Step[] = [
  {
    title: 'Bienvenido a Conozca',
    description: 'Tu plataforma editorial digital. Aquí podrás publicar artículos, gestionar tus borradores y llegar a miles de lectores.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: 'Tu Panel de Autor',
    description: 'Gestiona tus artículos publicados y pendientes. Revisa las traducciones automáticas y asegúrate de que tu contenido sea de alta calidad académica.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    action: {
      label: 'Ver Mis Artículos',
      href: '/admin-dashboard/articles'
    }
  },
  {
    title: 'CMS Dashboard',
    description: 'Accede a las estadísticas de lectura, comentarios pendientes y el impacto de tus publicaciones en la comunidad.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    action: {
      label: 'Ir al Dashboard',
      href: '/admin-dashboard'
    }
  },
]

interface OnboardingWizardProps {
  userRole: 'user' | 'author' | 'admin' | 'superadmin'
  onComplete: () => void
}

export function OnboardingWizard({ userRole, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // For now, all roles see author steps as it's the most relevant for Conozca
  const steps = authorSteps
  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false)
      setTimeout(onComplete, 300)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSkip = () => {
    setIsVisible(false)
    setTimeout(onComplete, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-lg p-8 transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${index <= currentStep ? 'bg-primary-500' : 'bg-gray-200'
                }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-100 text-primary-600 mb-6">
            {step.icon}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">
            {step.title}
          </h2>

          <p className="text-foreground-secondary mb-8 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleNext} size="lg" className="w-full">
            {isLastStep ? '¡Comenzar!' : 'Siguiente'}
          </Button>

          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              Omitir tutorial
            </button>
          )}
        </div>

        {/* Step counter */}
        <p className="text-center text-sm text-foreground-secondary mt-6">
          Paso {currentStep + 1} de {steps.length}
        </p>
      </Card>
    </div>
  )
}
