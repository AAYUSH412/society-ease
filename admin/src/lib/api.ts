import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  flatNumber: string;
  building?: string;
  societyName: string;
  role: 'resident' | 'admin' | 'super_admin';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isEmailVerified: boolean;
  profileImage?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  flatNumber: string;
  building?: string;
  societyName: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface LoginData {
  identifier: string; // email or phone
  password: string;
  rememberMe?: boolean;
}

// HTTP Client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for auth
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const api = new ApiClient(API_BASE_URL);

// Auth API functions
export const authApi = {
  // Register new user
  register: (data: RegisterData): Promise<ApiResponse<{ user: User }>> =>
    api.post('/auth/register', data),

  // Login user
  login: (data: LoginData): Promise<ApiResponse<LoginResponse>> =>
    api.post('/auth/login', data),

  // Logout user
  logout: (): Promise<ApiResponse> =>
    api.post('/auth/logout'),

  // Refresh access token
  refreshToken: (refreshToken?: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> =>
    api.post('/auth/refresh-token', refreshToken ? { refreshToken } : undefined),

  // Get current user
  getMe: (): Promise<ApiResponse<{ user: User }>> =>
    api.get('/auth/me'),

  // Verify email
  verifyEmail: (token: string): Promise<ApiResponse> =>
    api.post('/auth/verify-email', { token }),

  // Resend email verification
  resendEmailVerification: (email: string): Promise<ApiResponse> =>
    api.post('/auth/resend-email-verification', { email }),
};

// Admin API functions
export const adminApi = {
  // Get all users
  getAllUsers: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
    search?: string;
    societyName?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return api.get(`/admin/users?${queryParams.toString()}`);
  },

  // Get pending users
  getPendingUsers: (): Promise<ApiResponse<{ users: User[]; count: number }>> =>
    api.get('/admin/users/pending'),

  // Get user statistics
  getUserStats: (): Promise<ApiResponse<any>> =>
    api.get('/admin/users/stats'),

  // Approve user
  approveUser: (userId: string): Promise<ApiResponse<{ user: User }>> =>
    api.patch(`/admin/users/${userId}/approve`),

  // Reject user
  rejectUser: (userId: string, reason?: string): Promise<ApiResponse<{ user: User }>> =>
    api.patch(`/admin/users/${userId}/reject`, reason ? { reason } : undefined),

  // Suspend user
  suspendUser: (userId: string, reason?: string): Promise<ApiResponse<{ user: User }>> =>
    api.patch(`/admin/users/${userId}/suspend`, reason ? { reason } : undefined),

  // Reactivate user
  reactivateUser: (userId: string): Promise<ApiResponse<{ user: User }>> =>
    api.patch(`/admin/users/${userId}/reactivate`),

  // Update user role
  updateUserRole: (userId: string, role: 'resident' | 'admin' | 'super_admin'): Promise<ApiResponse<{ user: User }>> =>
    api.patch(`/admin/users/${userId}/role`, { role }),

  // Create new resident
  createResident: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    flatNumber: string;
    building?: string;
    societyName: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  }): Promise<ApiResponse<{ user: User }>> =>
    api.post('/admin/users/create', data),

  // Get user by ID
  getUserById: (userId: string): Promise<ApiResponse<{ user: User }>> =>
    api.get(`/admin/users/${userId}`),

  // Update user
  updateUser: (userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    flatNumber?: string;
    building?: string;
    societyName?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  }): Promise<ApiResponse<{ user: User }>> =>
    api.put(`/admin/users/${userId}`, data),

  // Delete user
  deleteUser: (userId: string): Promise<ApiResponse> =>
    api.delete(`/admin/users/${userId}`),
};

// Utility functions for token management
export const tokenUtils = {
  // Store tokens in localStorage
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  // Get access token
  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  // Clear all tokens
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!tokenUtils.getAccessToken();
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};
