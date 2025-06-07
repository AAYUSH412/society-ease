// Common API response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data: T
  errors?: any[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: any[]
}
