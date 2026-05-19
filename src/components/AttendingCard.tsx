'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { RegistrationRecord } from '../types/registration';

interface AttendingCardProps {
  record: RegistrationRecord;
  onGenerated?: (url: string) => void;
}

export default function AttendingCard({ record, onGenerated }: AttendingCardProps) {
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    generateAttendingCard(record);
  }, [record]);

  // Programmatically Draw the White-Themed Blue "I Will Be Attending" Card
  const generateAttendingCard = (record: RegistrationRecord) => {
    setIsGeneratingCard(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res 1080x1080 dimensions for download quality
    canvas.width = 1080;
    canvas.height = 1080;

    // Draw Light/White Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGradient.addColorStop(0, '#FFFFFF');
    bgGradient.addColorStop(0.6, '#F8FAFC');
    bgGradient.addColorStop(1, '#F1F5F9');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Draw Decorative Neon Glow Circular Lights (Soft/Translucent in light mode)
    const glow1 = ctx.createRadialGradient(200, 200, 50, 200, 200, 450);
    glow1.addColorStop(0, 'rgba(37, 99, 235, 0.08)'); // Soft electric blue
    glow1.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.arc(200, 200, 450, 0, Math.PI * 2);
    ctx.fill();

    const glow2 = ctx.createRadialGradient(880, 880, 50, 880, 880, 450);
    glow2.addColorStop(0, 'rgba(6, 182, 212, 0.08)'); // Soft cyan
    glow2.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(880, 880, 450, 0, Math.PI * 2);
    ctx.fill();

    // Draw Tech Grids in ultra-light grey
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.025)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Sleek Accent Shapes/Corner Borders (Vibrant light mode blue/cyan colors)
    ctx.strokeStyle = '#2563EB'; // Vibrant Blue
    ctx.lineWidth = 4;
    
    // Top Left Corner
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.lineTo(40, 40);
    ctx.lineTo(120, 40);
    ctx.stroke();

    // Top Right Corner
    ctx.strokeStyle = '#06B6D4'; // Teal/Cyan
    ctx.beginPath();
    ctx.moveTo(1040, 120);
    ctx.lineTo(1040, 40);
    ctx.lineTo(960, 40);
    ctx.stroke();

    // Bottom Left Corner
    ctx.strokeStyle = '#06B6D4';
    ctx.beginPath();
    ctx.moveTo(40, 960);
    ctx.lineTo(40, 1040);
    ctx.lineTo(120, 1040);
    ctx.stroke();

    // Bottom Right Corner
    ctx.strokeStyle = '#2563EB';
    ctx.beginPath();
    ctx.moveTo(1040, 960);
    ctx.lineTo(1040, 1040);
    ctx.lineTo(960, 1040);
    ctx.stroke();

    // Load User Avatar Image
    const img = new Image();
    img.src = record.photo;
    img.onload = () => {
      // 1. Draw User Avatar with Neon Borders & Glow
      const avatarX = 540;
      const avatarY = 475;
      const avatarR = 210;

      // Draw Avatar Shadow/Glow (Soft shadow in light mode)
      ctx.save();
      ctx.shadowColor = 'rgba(37, 99, 235, 0.2)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Clip Avatar Image inside the circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR - 5, 0, Math.PI * 2);
      ctx.clip();

      // Center crop logic
      const imgWidth = img.width;
      const imgHeight = img.height;
      const diameter = (avatarR - 5) * 2;
      const ratio = Math.max(diameter / imgWidth, diameter / imgHeight);
      const newWidth = imgWidth * ratio;
      const newHeight = imgHeight * ratio;
      const xOffset = avatarX - newWidth / 2;
      const yOffset = avatarY - newHeight / 2;

      ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
      ctx.restore();

      // Draw Dual-ring borders around avatar
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#2563EB'; // Vibrant Blue
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#06B6D4'; // Cyan
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR + 8, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw Text and Info
      // Event Title "FRESH '26" (Slate dark text)
      ctx.textAlign = 'center';
      
      ctx.save();
      ctx.font = 'bold 85px sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText("FRESH '26", 540, 150);
      ctx.restore();

      // Subtitle
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#0284C7';
      ctx.letterSpacing = '8px';
      ctx.fillText("YOUTH SUMMIT", 540, 200);

      // "I WILL BE ATTENDING" badge/banner in light blue colors
      ctx.fillStyle = 'rgba(37, 99, 235, 0.05)';
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.22)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(320, 225, 440, 48, 24);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#1D4ED8'; // Royal dark blue
      ctx.fillText("⭐ I WILL BE ATTENDING ⭐", 540, 256);

      // User's Name (Dark Slate text)
      ctx.font = 'bold 48px sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(record.name, 540, 755);

      // User's Institution & Location Tagline
      ctx.font = '500 24px sans-serif';
      ctx.fillStyle = '#475569';
      const locationText = record.member_type === 'Member' 
        ? `${record.center} Center, ${record.state}` 
        : `${record.location}`;
      ctx.fillText(`${record.institution} | ${locationText}`, 540, 800);

      // Status Badge Capsule (Pastel cyan capsule with teal text)
      const badgeText = `${record.status.toUpperCase()} • ${record.member_type.toUpperCase()}`;
      ctx.font = 'bold 18px monospace';
      const badgeWidth = ctx.measureText(badgeText).width + 40;
      
      ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(540 - badgeWidth / 2, 830, badgeWidth, 36, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0284C7';
      ctx.fillText(badgeText, 540, 854);

      // Ticket ID Pass Box (Light Gray / Amber borders)
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(340, 905, 400, 80, 12);
      ctx.fill();
      ctx.stroke();

      // Pass ID Label
      ctx.font = '600 16px monospace';
      ctx.fillStyle = '#B45309';
      ctx.fillText("OFFICIAL DELEGATE TICKET", 540, 934);

      // Unique Ticket Code
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(record.ticket_number, 540, 968);

      // Footer Tagline
      ctx.font = '500 16px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText("Are you registered? Register now at fresh26.dclm.org", 540, 1030);

      // Save Data URL to state for download
      const url = canvas.toDataURL('image/png');
      setDownloadUrl(url);
      setIsGeneratingCard(false);
      if (onGenerated) {
        onGenerated(url);
      }
    };
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Card Canvas - Hidden, used purely for generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Premium Render Preview Wrapper */}
      <div className="w-full max-w-md glass-panel-glow p-4 rounded-2xl animate-float relative bg-white">
        {/* Badge corner details */}
        <div className="absolute top-0 right-0 p-3 flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-[9px] font-mono text-blue-600 font-bold uppercase tracking-wider">Preview</span>
        </div>

        {isGeneratingCard ? (
          <div className="aspect-square w-full rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-3 border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono font-bold">Generating Card...</p>
          </div>
        ) : (
          downloadUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 relative group">
              <img 
                src={downloadUrl} 
                alt="My Attending Card" 
                className="w-full h-auto aspect-square object-contain"
              />
              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <a
                  href={downloadUrl}
                  download={`FRESH26-Attending-${record.name.replace(/\s+/g, '-')}.png`}
                  className="bg-white text-slate-900 p-3.5 rounded-full hover:scale-110 transition-all shadow-xl"
                  id="download-card-overlay"
                >
                  <Download className="w-6 h-6" />
                </a>
              </div>
            </div>
          )
        )}
      </div>
      
      <span className="text-[11px] text-slate-500 mt-4 tracking-wider uppercase font-mono font-bold">
        PNG high-resolution output (1080 x 1080 px)
      </span>

      {/* Expose action button inside card container if needed by parent, or handled externally */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download={`FRESH26-Attending-${record.name.replace(/\s+/g, '-')}.png`}
          className="w-full mt-4 btn-neon-primary py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(37,99,235,0.3)] font-bold lg:hidden"
          id="download-card-mobile"
        >
          <Download className="w-4 h-4" /> Download Attending Card
        </a>
      )}
    </div>
  );
}
