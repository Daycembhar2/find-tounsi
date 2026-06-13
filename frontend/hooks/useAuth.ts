import { useState, useEffect } from 'react'
import { authService } from '@/services/auth.service'

export function useAuth() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const signOut = () => {
    authService.logout()
    setUser(null)
  }

  return { user, signOut }
}