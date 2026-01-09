const API_URL = process.env.NEXT_PUBLIC_SALAPISO_API || 'http://localhost:3001'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  token?: string
  user?: {
    id: string
    email: string
    name: string | null
  }
  requiresVerification?: boolean
  email?: string
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
}

export async function api<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await res.json()
    return data
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error',
    }
  }
}

// Auth API helpers
export const authApi = {
  login: (email: string, password: string) =>
    api('/auth/login', { method: 'POST', body: { email, password } }),

  signup: (email: string, password: string, name?: string) =>
    api('/auth/signup', { method: 'POST', body: { email, password, name } }),

  google: (credential: string) =>
    api('/auth/google', { method: 'POST', body: { credential } }),

  me: (token: string) =>
    api('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),

  forgotPassword: (email: string) =>
    api('/auth/forgot-password', { method: 'POST', body: { email } }),

  resendResetCode: (token: string) =>
    api('/auth/resend-reset-code', { method: 'POST', body: { token } }),

  verifyResetCode: (token: string, code: string) =>
    api('/auth/verify-reset-code', { method: 'POST', body: { token, code } }),

  resetPassword: (token: string, code: string, newPassword: string) =>
    api('/auth/reset-password', { method: 'POST', body: { token, code, newPassword } }),

  changePassword: (currentPassword: string, newPassword: string, authToken: string) =>
    api('/auth/change-password', { 
      method: 'POST', 
      body: { currentPassword, newPassword },
      headers: { Authorization: `Bearer ${authToken}` }
    }),

  verifyEmail: (token: string) =>
    api(`/auth/verify-email?token=${token}`),

  resendVerification: (email: string) =>
    api('/auth/resend-verification', { method: 'POST', body: { email } }),
}

// Savings API helpers
export const savingsApi = {
  // Wallets
  getWallets: () => api('/savings/wallets'),

  // Goals
  getGoals: (token: string) =>
    api('/savings/goals', { headers: { Authorization: `Bearer ${token}` } }),

  getGoal: (goalId: string, token: string) =>
    api(`/savings/goals/${goalId}`, { headers: { Authorization: `Bearer ${token}` } }),

  createGoal: (data: { walletId: string; name?: string; targetAmount?: number; initialAmount?: number }, token: string) =>
    api('/savings/goals', { 
      method: 'POST', 
      body: data,
      headers: { Authorization: `Bearer ${token}` } 
    }),

  deleteGoal: (goalId: string, token: string) =>
    api(`/savings/goals/${goalId}`, { 
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` } 
    }),

  updateGoal: (goalId: string, data: { name?: string; targetAmount?: number; currentAmount?: number }, token: string) =>
    api(`/savings/goals/${goalId}`, {
      method: 'PATCH',
      body: data,
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Entries
  addEntry: (goalId: string, data: { amount: number; note?: string }, token: string) =>
    api(`/savings/goals/${goalId}/entries`, {
      method: 'POST',
      body: data,
      headers: { Authorization: `Bearer ${token}` }
    }),

  // Summary
  getSummary: (token: string) =>
    api('/savings/summary', { headers: { Authorization: `Bearer ${token}` } }),

  // All transactions
  getTransactions: (token: string, limit?: number) =>
    api(`/savings/transactions${limit ? `?limit=${limit}` : ''}`, { headers: { Authorization: `Bearer ${token}` } }),
}


// Support API helpers
export const supportApi = {
  // Get count and check if user has hearted
  getSupport: (token?: string) =>
    api("/support", token ? { headers: { Authorization: `Bearer ${token}` } } : {}),

  // Toggle heart (requires auth)
  toggleHeart: (token: string) =>
    api("/support", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),
}
