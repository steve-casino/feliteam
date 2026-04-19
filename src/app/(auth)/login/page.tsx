'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { mockUsers } from '@/lib/mock-data'

const LoginPage: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Store user info in session/cookie
    document.cookie = `user_email=${email}; path=/`
    document.cookie = `user_authenticated=true; path=/`

    setIsLoading(false)
    router.push('/dashboard')
  }

  const handleDemoLogin = async (role: 'admin' | 'case_manager' | 'intake_agent') => {
    setIsLoading(true)

    // Find user with the specified role
    const user = mockUsers.find((u) => u.role === role)

    if (user) {
      // Simulate login delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Store user info in session/cookie
      document.cookie = `user_id=${user.id}; path=/`
      document.cookie = `user_email=${user.email}; path=/`
      document.cookie = `user_name=${user.full_name}; path=/`
      document.cookie = `user_authenticated=true; path=/`

      setIsLoading(false)
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-navy-50 border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Logo and Tagline */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-purple-400">InjuryFlow</h1>
            </div>
            <p className="text-sm text-white/60">Your PI Firm, Gamified.</p>
          </div>

          {/* Email Input */}
          <form onSubmit={handleLogin} className="space-y-5 mb-6">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@injuryflow.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-200 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-navy-200 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-2.5 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 disabled:from-purple-400/50 disabled:to-purple-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/20"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-white/50 font-medium">Demo Accounts</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Demo Account Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:cursor-not-allowed border border-white/10 hover:border-purple-400/30 text-white font-medium rounded-lg transition-all text-sm"
            >
              Login as Admin
            </button>
            <button
              onClick={() => handleDemoLogin('case_manager')}
              disabled={isLoading}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:cursor-not-allowed border border-white/10 hover:border-teal-400/30 text-white font-medium rounded-lg transition-all text-sm"
            >
              Login as Case Manager
            </button>
            <button
              onClick={() => handleDemoLogin('intake_agent')}
              disabled={isLoading}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:cursor-not-allowed border border-white/10 hover:border-coral-400/30 text-white font-medium rounded-lg transition-all text-sm"
            >
              Login as Intake Agent
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-white/50 mt-6">
            Use demo accounts to explore InjuryFlow features
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
