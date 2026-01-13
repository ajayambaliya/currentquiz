'use client';

import React from 'react';
import { CheckCircle, Info } from 'lucide-react';
import { useMigrationState } from '@/hooks/useMigrationState';

const RegistrationMigrationNotice = () => {
  const { shouldShowNotices } = useMigrationState();

  if (!shouldShowNotices) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl space-y-3 mb-6">
      <div className="flex items-center gap-3 text-blue-700">
        <Info className="w-5 h-5 flex-shrink-0" />
        <p className="font-bold text-sm gujarati-text">સિસ્ટમ અપગ્રેડ સૂચના</p>
      </div>
      
      <div className="text-blue-600 text-xs space-y-2 gujarati-text">
        <p className="leading-relaxed">
          અમારા સિસ્ટમમાં સુધારા થયા છે. જૂના યુઝર્સે નવા એકાઉન્ટ બનાવવા પડશે.
        </p>
        
        <div className="bg-blue-100/50 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <p className="font-bold text-blue-700 text-xs">શું સાચવાયેલું છે:</p>
          </div>
          <div className="space-y-1 text-xs text-blue-600 ml-6">
            <p>• બધા ક્વિઝ અને પ્રશ્નો</p>
            <p>• તમામ અભ્યાસ સામગ્રી</p>
            <p>• વધુ સારી સ્પીડ અને સિક્યુરિટી</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationMigrationNotice;