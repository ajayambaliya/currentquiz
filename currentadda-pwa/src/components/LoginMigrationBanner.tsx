'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useMigrationState } from '@/hooks/useMigrationState';

const LoginMigrationBanner = () => {
  const { shouldShowNotices } = useMigrationState();

  // Don't render if user has already acknowledged migration
  if (!shouldShowNotices) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-3">
      <div className="flex items-center gap-3 text-amber-700">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <p className="font-bold text-sm gujarati-text">જૂના એકાઉન્ટ કામ કરતા નથી</p>
      </div>
      
      <div className="text-amber-600 text-xs space-y-2 gujarati-text">
        <p className="leading-relaxed">
          સિસ્ટમ અપગ્રેડ થવાથી તમારે <span className="font-bold">નવો એકાઉન્ટ</span> બનાવવો પડશે.
        </p>
        
        <div className="bg-amber-100/50 rounded-xl p-3 space-y-1">
          <p className="font-bold text-amber-700 text-xs">ઝડપી સ્ટેપ્સ:</p>
          <div className="space-y-1 text-xs text-amber-600">
            <p>• નવો એકાઉન્ટ બનાવો</p>
            <p>• તમારો જૂનો ઈમેઈલ વાપરો</p>
            <p>• નવો પાસવર્ડ સેટ કરો</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link 
            href="/auth/register"
            className="bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors text-center"
          >
            નવો એકાઉન્ટ બનાવો
          </Link>
          <Link 
            href="/migration-info"
            className="text-amber-700 hover:text-amber-800 text-xs font-bold underline hover:no-underline text-center py-2"
          >
            વિગતવાર માહિતી
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginMigrationBanner;