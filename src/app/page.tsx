'use client';

import React, { useState } from 'react';
import { Calendar, Award, BookOpen, AlertCircle } from 'lucide-react';
import RegistrationForm from '../components/RegistrationForm';
import RegistrationSuccess from '../components/RegistrationSuccess';
import { RegistrationRecord } from '../types/registration';

export default function Home() {
  const [successData, setSuccessData] = useState<RegistrationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRegistrationSuccess = (record: RegistrationRecord) => {
    setSuccessData(record);
    setError(null);
  };

  const handleRegistrationError = (msg: string) => {
    setError(msg);
  };

  const handleReset = () => {
    setSuccessData(null);
    setError(null);
  };

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col justify-between">
      {/* Header Branding */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xl shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            F
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              FRESH<span className="text-primary font-mono">'26</span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-secondary font-bold -mt-1 font-mono">
              Youth Summit
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            May 2026
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center items-center relative z-10">
        
        {/* Decorative ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {error && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-800 flex items-start gap-3 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <div>
              <h4 className="font-bold text-red-900">Registration Error</h4>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {!successData ? (
          <RegistrationForm 
            onSuccess={handleRegistrationSuccess}
            onError={handleRegistrationError}
          />
        ) : (
          <RegistrationSuccess 
            record={successData}
            onReset={handleReset}
          />
        )}

      </main>

      {/* Footer Details */}
      <footer className="w-full py-8 border-t border-slate-200 mt-12 bg-white/50 z-10 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 Deeper Christian Life Ministry. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <Award className="w-3.5 h-3.5 text-primary" /> FRESH '26 Summit
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <BookOpen className="w-3.5 h-3.5 text-secondary" /> Empowering Youths
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
