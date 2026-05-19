'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  Download
} from 'lucide-react';
import { RegistrationRecord } from '../types/registration';
import AttendingCard from './AttendingCard';

interface RegistrationSuccessProps {
  record: RegistrationRecord;
  onReset: () => void;
}

export default function RegistrationSuccess({ record, onReset }: RegistrationSuccessProps) {
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
      
      {/* Left Column: Success Confirmation Details */}
      <div className="lg:col-span-5 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold shadow-sm">
          <CheckCircle className="w-4 h-4 shrink-0 text-blue-500" /> Registered Successfully
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            WELCOME ABOARD, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glow-text-primary">
              {record.name.toUpperCase()}!
            </span>
          </h2>
          <p className="text-slate-600 text-sm font-medium">
            Your seat has been reserved for FRESH '26! We have successfully received your credentials and created your official registration record in our database.
          </p>
        </div>

        {/* Monospaced Ticket Pass */}
        <div className="glass-panel p-5 rounded-xl border-amber-500/20 shadow-[0_4px_20px_rgba(217,119,6,0.05)] bg-amber-50/20">
          <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase font-mono block mb-1">
            Unique Registration Ticket
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black font-mono text-slate-900 tracking-widest">
              {record.ticket_number}
            </span>
            <span className="text-xs px-2.5 py-1 rounded bg-amber-600/10 text-amber-700 border border-amber-600/20 font-bold font-mono">
              ACTIVE PASS
            </span>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Status</span>
              <span className="font-bold text-slate-900">{record.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Category</span>
              <span className="font-bold text-slate-900">{record.member_type}</span>
            </div>
          </div>
        </div>

        {/* Instructions Callout */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2 shadow-sm">
          <p className="font-bold text-slate-800">🎉 Share Your Attending Flier!</p>
          <p className="font-medium">
            We have designed a gorgeous light-themed personalized banner featuring your photo and delegate ID. 
            Download it using the button below to post on your status and invite your friends!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`FRESH26-Attending-${record.name.replace(/\s+/g, '-')}.png`}
              className="flex-1 btn-neon-primary py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(37,99,235,0.3)] font-bold"
              id="download-card"
            >
              <Download className="w-4 h-4" /> Download Attending Card
            </a>
          )}
          <button
            onClick={onReset}
            className="btn-neon-secondary py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer font-bold"
            id="register-another"
          >
            Register Another Person
          </button>
        </div>
      </div>

      {/* Right Column: Premium "I Will Be Attending" Card Component */}
      <div className="lg:col-span-7">
        <AttendingCard 
          record={record} 
          onGenerated={setDownloadUrl}
        />
      </div>

    </div>
  );
}
