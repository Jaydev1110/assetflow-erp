/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('jaydevprajapati1110@gmail.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Jaydev Prajapati');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      alert('Please fill out all login parameters.');
      return;
    }

    try {
      const endpoint = isRegister ? 'http://localhost:5000/api/auth/signup' : 'http://localhost:5000/api/auth/login';
      const body = isRegister ? { name, email, department: 'Technology Division' } : { email };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.user);
      } else {
        const errData = await res.json();
        alert(`Authentication failed: ${errData.error || 'Invalid credentials'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to authentication server.');
    }
  };

  const handleQuickBypass = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'jaydevprajapati1110@gmail.com' })
      });
      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.user);
      } else {
        // Local fallback in case server is starting up
        onLoginSuccess({
          name: 'Jaydev Prajapati',
          email: 'jaydevprajapati1110@gmail.com',
          role: 'Enterprise Administrator',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD5m25eAev4ZJPWDBvjApISv16W1RfYw0rWSwdElf1gpL3S-cg5JZyRpU1pfzhXMEUXCRMB5z3TQb_kTiLCFHSNUf78lFOot4zdYUnqXw5PJjZwSUFfjQBcawrMv5ZAE5taHANl_4qFoWFbwZvS12TPyAWvHdDUi_fiEsQ6RcB1XLcoMBA_mc3EaOlqiLqMMb91ioQhjRf2gEhZ24Vyt4Zz4u3mnHUs1s-vXdluX5fG7d2Vc84HVlj-A',
        });
      }
    } catch (err) {
      console.error(err);
      onLoginSuccess({
        name: 'Jaydev Prajapati',
        email: 'jaydevprajapati1110@gmail.com',
        role: 'Enterprise Administrator',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD5m25eAev4ZJPWDBvjApISv16W1RfYw0rWSwdElf1gpL3S-cg5JZyRpU1pfzhXMEUXCRMB5z3TQb_kTiLCFHSNUf78lFOot4zdYUnqXw5PJjZwSUFfjQBcawrMv5ZAE5taHANl_4qFoWFbwZvS12TPyAWvHdDUi_fiEsQ6RcB1XLcoMBA_mc3EaOlqiLqMMb91ioQhjRf2gEhZ24Vyt4Zz4u3mnHUs1s-vXdluX5fG7d2Vc84HVlj-A',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 selection:bg-[#111827] selection:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-8 space-y-8"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#111827] text-white rounded-xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[26px]">inventory_2</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">AssetFlow</h2>
          <p className="text-xs text-[#6B7280] font-normal">
            Enterprise Asset Management & Resource Allocation
          </p>
        </div>

        {/* Dynamic Form title */}
        <div className="flex justify-center border-b border-[#E5E7EB] pb-0.5 gap-6">
          <button
            onClick={() => setIsRegister(false)}
            className={`pb-2.5 text-xs font-semibold transition ${
              !isRegister ? 'border-b-2 border-[#111827] text-[#111827]' : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Sign In Account
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`pb-2.5 text-xs font-semibold transition ${
              isRegister ? 'border-b-2 border-[#111827] text-[#111827]' : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Create Credentials
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jaydev Prajapati"
                className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
              Corporate Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jaydevprajapati1110@gmail.com"
              className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F3F4F6] border border-transparent rounded-lg px-3.5 py-2 text-xs text-[#111827] placeholder-[#6B7280] focus:bg-white focus:border-[#D1D5DB] outline-none transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-[#111827] font-semibold"
              >
                {showPassword ? 'hide' : 'show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#111827] text-white hover:bg-black rounded-lg text-xs font-semibold transition"
          >
            {isRegister ? 'Register Credentials' : 'Sign In To Workspace'}
          </button>
        </form>

        {/* Separator line */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#E5E7EB]" />
          <span className="flex-shrink mx-4 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
            Bypass Testing
          </span>
          <div className="flex-grow border-t border-[#E5E7EB]" />
        </div>

        {/* Demo Bypass button */}
        <button
          onClick={handleQuickBypass}
          className="w-full py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          Instant Sandbox Admin Entry
        </button>
      </motion.div>
    </div>
  );
}
