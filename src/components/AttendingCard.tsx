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

  // Helper utility to load images with Promises
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  };

  useEffect(() => {
    let active = true;
    setIsGeneratingCard(true);

    const generate = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set high-res 1080x1440 dimensions (3:4 aspect ratio)
      canvas.width = 1080;
      canvas.height = 1440;

      try {
        // Load all assets in parallel
        const [logoImg, bgImg, avatarImg] = await Promise.all([
          loadImage("/fresh.png").catch(() => null),
          loadImage("/bg.png").catch(() => null),
          loadImage(record.photo || "/fresh.png").catch(() => null), // fallback if photo is empty
        ]);

        if (!active) return;

        // 1. Draw Background Image
        if (bgImg) {
          ctx.drawImage(bgImg, 0, 0, 1080, 1440);
        } else {
          // Fallback gradient if background fails to load
          const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1440);
          bgGradient.addColorStop(0, '#FFFFFF');
          bgGradient.addColorStop(0.6, '#F8FAFC');
          bgGradient.addColorStop(1, '#F1F5F9');
          ctx.fillStyle = bgGradient;
          ctx.fillRect(0, 0, 1080, 1440);
        }

        // Add a very subtle vignette/glow at the edges
        const overlayGrad = ctx.createRadialGradient(540, 720, 300, 540, 720, 900);
        overlayGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        overlayGrad.addColorStop(1, 'rgba(15, 23, 42, 0.12)');
        ctx.fillStyle = overlayGrad;
        ctx.fillRect(0, 0, 1080, 1440);

        // 2. Draw User Avatar with Premium Glass & Neon Borders
        const avatarX = 540;
        const avatarY = 665;
        const avatarR = 230;

        if (avatarImg) {
          // Draw Avatar Shadow/Glow (Soft shadow in light mode)
          ctx.save();
          ctx.shadowColor = 'rgba(37, 99, 235, 0.35)';
          ctx.shadowBlur = 40;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Clip Avatar Image inside the circle
          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarR - 6, 0, Math.PI * 2);
          ctx.clip();

          // Center crop logic
          const imgWidth = avatarImg.width;
          const imgHeight = avatarImg.height;
          const diameter = (avatarR - 6) * 2;
          const ratio = Math.max(diameter / imgWidth, diameter / imgHeight);
          const newWidth = imgWidth * ratio;
          const newHeight = imgHeight * ratio;
          const xOffset = avatarX - newWidth / 2;
          const yOffset = avatarY - newHeight / 2;

          ctx.drawImage(avatarImg, xOffset, yOffset, newWidth, newHeight);
          ctx.restore();

          // Draw Premium Dual-ring borders around avatar
          // Outer Neon/Glass white border
          ctx.lineWidth = 10;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.lineWidth = 4;
          ctx.strokeStyle = '#2563EB'; // Vibrant Blue
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
          ctx.stroke();

          // Inner gold/cyan ring
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#06B6D4'; // Cyan
          ctx.beginPath();
          ctx.arc(avatarX, avatarY, avatarR + 10, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 3. Draw Text and Info
        ctx.textAlign = 'center';
        
        // "I WILL BE ATTENDING" Glassmorphic Banner at the top
        ctx.save();
        // ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 4;
        ctx.beginPath();
        // ctx.roundRect(140, 50, 800, 90, 45);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.font = 'bold 48px sans-serif';
        ctx.fillStyle = '#1E3A8A'; // Deep Navy Blue
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText("I WILL BE ATTENDING", 540, 95);
        ctx.restore();

        // Draw Event Logo Image
        if (logoImg) {
          const logoSize = 360;
          ctx.drawImage(logoImg, 540 - logoSize / 2, 175, logoSize, logoSize);
        }

        // Subtitle - STATE CONGRESS
        // ctx.save();
        // ctx.font = 'bold 34px sans-serif';
        // ctx.fillStyle = '#1D4ED8'; // Vibrant Dark Blue
        // ctx.letterSpacing = '3px';
        // ctx.fillText("ANNUAL STATE CONGRESS", 540, 375);
        // ctx.restore();

        // User's Name (Crisp Legible Text on Cloudy/Light transition)
        ctx.save();
        ctx.font = 'bold 64px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '1px';
        
        // Solid white backdrop outline for flawless legibility
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 10;
        ctx.lineJoin = 'round';
        ctx.strokeText(record.name.toUpperCase(), 540, 975);
        
        ctx.fillStyle = '#0F172A'; // Dark slate name
        ctx.fillText(record.name.toUpperCase(), 540, 975);
        ctx.restore();

        // User's Designation (Primary Status)
        ctx.save();
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#334155';
        let statusText = record.status;
        if (statusText === 'Staff') statusText = 'Staff / Professional';
        if (statusText === 'Corper') statusText = 'Corper (NYSC)';
        ctx.fillText(statusText.toUpperCase(), 540, 1080);
        ctx.restore();

        // Status Badge Capsule (Institution • Location) - White glass capsule
        const locationText = record.member_type === 'Member' 
          ? `${record.center}` 
          : `${record.location}`;
        const badgeText = `${record.institution.toUpperCase()} • ${locationText.toUpperCase()}`;
        
        ctx.save();
        ctx.font = 'bold 18px sans-serif';
        const badgeWidth = ctx.measureText(badgeText).width + 48;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(540 - badgeWidth / 2, 1135, badgeWidth, 44, 22);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#2563EB'; // Vibrant Blue
        ctx.fillText(badgeText, 540, 1161);
        ctx.restore();

        // Venue & Date Info (Contrast adjusted for the deep blue ocean water at the bottom!)
        ctx.save();
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#F0FDFA'; // Off-white/teal glow text
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.letterSpacing = '2px';
        ctx.fillText(" JUNE 4 - 7, 2026", 540, 1235);

        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = '#E2E8F0'; // Soft light gray
        ctx.fillText("DEEPER LIFE CAMPGROUND, EGBEDA, OGBOMOSO", 540, 1285);
        ctx.restore();

        // Footer Tagline
        ctx.save();
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#ffffff'; // Muted grey
        ctx.fillText("Are you registered? Register now at bit.ly/FRESH2026", 540, 1390);
        ctx.restore();

        // Save Data URL to state for download
        const url = canvas.toDataURL('image/png');
        setDownloadUrl(url);
        if (onGenerated) {
          onGenerated(url);
        }
      } catch (err) {
        console.error("Failed to generate Attending Card:", err);
      } finally {
        if (active) {
          setIsGeneratingCard(false);
        }
      }
    };

    generate();

    return () => {
      active = false;
    };
  }, [record]);

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
          <div className="aspect-[3/4] w-full rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-3 border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono font-bold">Generating Card...</p>
          </div>
        ) : (
          downloadUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 relative group">
              <img 
                src={downloadUrl} 
                alt="My Attending Card" 
                className="w-full h-auto aspect-[3/4] object-contain"
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
      
      {/* <span className="text-[11px] text-slate-500 mt-4 tracking-wider uppercase font-mono font-bold">
        PNG high-resolution output (1080 x 1440 px, 3:4 aspect ratio)
      </span> */}

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
