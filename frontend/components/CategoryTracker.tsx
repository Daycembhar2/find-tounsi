// components/CategoryTracker.tsx
"use client"

import { useEffect } from 'react'
// components/CategoryTracker.tsx
import { useRecommendationTracking } from '../../hooks/useRecommendationTracking';
interface CategoryTrackerProps {
  categorySlug: string
}

export function CategoryTracker({ categorySlug }: CategoryTrackerProps) {
  const { trackCategoryView } = useRecommendationTracking()

  useEffect(() => {
    trackCategoryView(categorySlug)
  }, [categorySlug, trackCategoryView])

  return null // Ce composant ne rend rien, il fait juste le tracking
}