'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, UserPlus } from 'lucide-react';

interface LoginErrorMessageProps {
  error: string;
}

const LoginErrorMessage = ({ error }: LoginErrorMessageProps) => {
  // Check if error is related to invalid credentials
  const isCredentialError = error.toLowerCase().includes('invalid') || 
                           error.toLowerCase().includes('credentials') ||
                           error.toLowerCase().includes('password') ||
                           error.toLowerCase().includes('email');

  if (!isCredentialError) {
    // Show regular error for other types of errors
    return (
      <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  // Show migration-specific error message
  return (
    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl space-y-3">
      <div className="flex items-center gap-3 text-rose-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="font-bold text-sm gujarati-text">જૂનો એકાઉન્ટ કામ કરતો નથી</p>
      </div>
      
      <div className="text-rose-600 text-xs space-y-2 gujarati-text">
        <p className="leading-relaxed">સિસ્ટમ અપગ્રેડ થવાથી તમારે નવો એકાઉન્ટ બનાવવો પડશે.</p>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link 
            href="/auth/register"
            className="flex items-center justify-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            નવો એકાઉન્ટ બનાવો
          </Link>
          <Link 
            href="/migration-info"
            className="text-rose-700 hover:text-rose-800 text-xs font-bold underline hover:no-underline text-center py-2"
          >
            વિગતવાર માહિતી
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginErrorMessage;