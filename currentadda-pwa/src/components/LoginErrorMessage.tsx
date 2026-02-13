'use client';
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface LoginErrorMessageProps {
  error: string;
}

const LoginErrorMessage = ({ error }: LoginErrorMessageProps) => {
  return (
    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p>{error}</p>
    </div>
  );
};

export default LoginErrorMessage;