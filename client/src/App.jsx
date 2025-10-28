import React, { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('request')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const requestOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await axios.post(`${API}/auth/request-otp`, { email })
      setMessage('OTP sent to your email')
      setStep('verify')
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await axios.post(`${API}/auth/verify-otp`, { email, otp })
      setMessage('OTP verified successfully!')
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-semibold mb-4">Email OTP Verification</h1>
        {message && (
          <div className="mb-4 text-sm text-emerald-300">{message}</div>
        )}

        {step === 'request' && (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="6-digit code"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="w-full py-2 rounded-md bg-slate-700 hover:bg-slate-600"
              onClick={() => setStep('request')}
            >
              Resend / Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
