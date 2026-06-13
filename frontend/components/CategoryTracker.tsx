"use client"
import { useEffect } from 'react'

interface CategoryTrackerProps {
  categorySlug: string
}

export function CategoryTracker({ categorySlug }: CategoryTrackerProps) {
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('viewed_categories') || '[]')
    if (!viewed.includes(categorySlug)) {
      viewed.unshift(categorySlug)
      localStorage.setItem('viewed_categories', JSON.stringify(viewed.slice(0, 10)))
    }
  }, [categorySlug])

  return null
}