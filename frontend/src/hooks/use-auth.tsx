"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi, tokenUtils, User, LoginData, RegisterData, handleApiError } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && tokenUtils.isAuthenticated()

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (tokenUtils.isAuthenticated()) {
        try {
          const response = await authApi.getMe()
          if (response.success && response.data) {
            setUser(response.data.user)
          } else {
            // If token is invalid, try to refresh
            try {
              const refreshResponse = await authApi.refreshToken()
              if (refreshResponse.success && refreshResponse.data) {
                const { accessToken, refreshToken } = refreshResponse.data
                tokenUtils.setTokens(accessToken, refreshToken)
                // Try to get user again with new token
                const userResponse = await authApi.getMe()
                if (userResponse.success && userResponse.data) {
                  setUser(userResponse.data.user)
                } else {
                  tokenUtils.clearTokens()
                }
              } else {
                tokenUtils.clearTokens()
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError)
              tokenUtils.clearTokens()
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          // Try refresh token before clearing
          try {
            const refreshResponse = await authApi.refreshToken()
            if (refreshResponse.success && refreshResponse.data) {
              const { accessToken, refreshToken } = refreshResponse.data
              tokenUtils.setTokens(accessToken, refreshToken)
              const userResponse = await authApi.getMe()
              if (userResponse.success && userResponse.data) {
                setUser(userResponse.data.user)
              } else {
                tokenUtils.clearTokens()
              }
            } else {
              tokenUtils.clearTokens()
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            tokenUtils.clearTokens()
          }
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await authApi.login(data)
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data
        setUser(user)
        tokenUtils.setTokens(accessToken, refreshToken)
        return { success: true }
      }
      
      return { success: false, error: response.message || 'Login failed' }
    } catch (error) {
      const errorMessage = handleApiError(error)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await authApi.register(data)
      
      if (response.success) {
        return { success: true }
      }
      
      return { success: false, error: response.message || 'Registration failed' }
    } catch (error) {
      const errorMessage = handleApiError(error)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      tokenUtils.clearTokens()
    }
  }

  const refreshUser = async () => {
    if (tokenUtils.isAuthenticated()) {
      try {
        const response = await authApi.getMe()
        if (response.success && response.data) {
          setUser(response.data.user)
        }
      } catch (error) {
        console.error('Failed to refresh user:', error)
      }
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
