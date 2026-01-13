'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, AlertTriangle, Users, Database, Shield, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MigrationInfoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header matching the app design */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login"
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 relative">
                <Image
                  src="/newlogo.png"
                  alt="CurrentAdda Logo"
                  fill
                  className="object-contain mix-blend-multiply"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">
                  CurrentAdda
                </h1>
                <span className="text-[7px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1 ml-0.5 opacity-70">Migration Info</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Notice */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-50 p-3 rounded-2xl">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-black text-slate-800 gujarati-text">સિસ્ટમ અપગ્રેડ સૂચના</h2>
            </div>
            <p className="text-slate-600 leading-relaxed gujarati-text text-sm">
              અમારી સેવા વધુ સારી બનાવવા માટે અમે ડેટાબેસ અપગ્રેડ કર્યો છે. 
              આ કારણે તમામ યુઝર્સે નવા એકાઉન્ટ બનાવવા પડશે.
            </p>
          </div>

          {/* Why this happened */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-50 p-3 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800 gujarati-text">આ શા માટે થયું?</h3>
            </div>
            <div className="space-y-3 text-slate-600 gujarati-text text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>અમારા જૂના ડેટાબેસ સર્વરમાં તકનીકી સમસ્યા આવી</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>વધુ સારી સિક્યુરિટી અને સ્પીડ માટે નવા સર્વર પર સ્થાનાંતરિત કર્યું</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>યુઝર એકાઉન્ટ્સ સિક્યુરિટી કારણોસર ઓટોમેટિક ટ્રાન્સફર થઈ શકતા નથી</p>
              </div>
            </div>
          </div>

          {/* Step by step guide */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800 gujarati-text">નવો એકાઉન્ટ કેવી રીતે બનાવવો?</h3>
            </div>
            
            <div className="space-y-5">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm">
                    1
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 mb-2 gujarati-text">રજિસ્ટર પેજ પર જાઓ</h4>
                  <p className="text-slate-600 text-sm mb-3 gujarati-text">
                    "નવો એકાઉન્ટ બનાવો" બટન પર ક્લિક કરો અથવા રજિસ્ટર પેજ પર જાઓ
                  </p>
                  <Link 
                    href="/auth/register"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    રજિસ્ટર પેજ
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm">
                    2
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 mb-2 gujarati-text">તમારી માહિતી ભરો</h4>
                  <div className="text-slate-600 text-sm space-y-1 gujarati-text">
                    <p>• તમારું પૂરું નામ</p>
                    <p>• ઈમેઈલ એડ્રેસ (જૂનો વાપરી શકો છો)</p>
                    <p>• મજબૂત પાસવર્ડ બનાવો</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 mb-2 gujarati-text">તૈયાર!</h4>
                  <p className="text-slate-600 text-sm gujarati-text">
                    હવે તમે લોગિન કરીને બધા ક્વિઝ એન્જોય કરી શકો છો
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What's preserved */}
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 p-3 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800 gujarati-text">શું સાચવાયેલું છે?</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-slate-700 gujarati-text text-sm">બધા ક્વિઝ અને પ્રશ્નો</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-slate-700 gujarati-text text-sm">તમામ અભ્યાસ સામગ્રી</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-slate-700 gujarati-text text-sm">વેબસાઈટની બધી સુવિધાઓ</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-slate-700 gujarati-text text-sm">વધુ સારી સ્પીડ અને સિક્યુરિટી</span>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-slate-100 p-3 rounded-2xl">
                <Shield className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-black text-slate-800 gujarati-text">સિક્યુરિટી નોટ</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed gujarati-text">
              આ અસુવિધા માટે અમે ક્ષમા માગીએ છીએ. અમે તમારી ડેટા સિક્યુરિટીને સૌથી વધુ 
              પ્રાધાન્યતા આપીએ છીએ, તેથી જ આ પ્રક્રિયા જરૂરી હતી. નવા સિસ્ટમમાં તમને 
              વધુ સારો અનુભવ મળશે.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
            <h3 className="text-lg font-black text-slate-800 mb-3 gujarati-text">મદદ જોઈએ?</h3>
            <p className="text-slate-600 text-sm mb-4 gujarati-text">
              કોઈ પણ સમસ્યા હોય તો અમારો સંપર્ક કરો
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/auth/register"
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-colors gujarati-text"
              >
                નવો એકાઉન્ટ બનાવો
              </Link>
              <a 
                href="mailto:support@currentadda.com"
                className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black hover:bg-slate-200 transition-colors text-sm"
              >
                ઈમેઈલ કરો
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}