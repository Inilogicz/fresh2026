'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  User, 
  Sparkles, 
  School, 
  ArrowRight, 
  Image as ImageIcon, 
  Camera, 
  Globe, 
  Loader2, 
  BookOpen
} from 'lucide-react';
import { RegistrationFormData, RegistrationRecord } from '../types/registration';

interface RegistrationFormProps {
  onSuccess: (record: RegistrationRecord) => void;
  onError: (msg: string) => void;
}

export default function RegistrationForm({ onSuccess, onError }: RegistrationFormProps) {
  const [form, setForm] = useState<RegistrationFormData>({
    name: '',
    phone: '',
    email: '',
    gender: '',
    institution: '',
    status: '', // 'Student', 'Staff', 'Corper'
    level: '',
    department: '',
    member_type: '', // 'Member', 'Visitor'
    state: '',
    region: '',
    center: '',
    membership_status: '', // 'member', 'worker', 'Staff'
    denomination: '',
    location: '',
    expectations: '',
    photo: '' // base64 string
  });

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Text/Select Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      // Clear conditional fields when parent choices change
      ...(name === 'status' && value !== 'Student' ? { level: '', department: '' } : {}),
      ...(name === 'member_type' && value !== 'Member' ? { state: '', region: '', center: '', membership_status: '' } : {}),
      ...(name === 'member_type' && value !== 'Visitor' ? { denomination: '', location: '' } : {})
    }));
  };

// Helper function to compress images client-side before sending to the backend API.
// This prevents Vercel's 4.5MB Serverless Function payload limit error (HTTP 413)
// and optimizes database storage and page load times.
const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions preserving aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str); // Fallback to original if context not supported
        return;
      }

      // Fill with a white background to support transparent PNG conversion to JPEG cleanly
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);
      
      // Get compressed JPEG base64 string
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
  });
};

  // Handle Photo File Upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      onError('Photo size should be less than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      // Compress the image client-side to keep payloads lightweight, preventing 413 errors on Vercel
      compressImage(base64String, 800, 800, 0.82)
        .then((compressed) => {
          setPhotoPreview(compressed);
          setForm(prev => ({ ...prev, photo: compressed }));
        })
        .catch((err) => {
          console.error('Image compression failed, falling back to original:', err);
          setPhotoPreview(base64String);
          setForm(prev => ({ ...prev, photo: base64String }));
        });
    };
    reader.readAsDataURL(file);
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic Validation
    if (!form.name || !form.phone || !form.email || !form.gender || !form.institution || !form.status || !form.member_type || !form.photo) {
      onError('Please fill in all required fields and upload your photo.');
      setIsLoading(false);
      return;
    }

    // Conditional Student validation
    if (form.status === 'Student' && (!form.level || !form.department)) {
      onError('Student Level and Department are required.');
      setIsLoading(false);
      return;
    }

    // Conditional Member type validation
    if (form.member_type === 'Member' && (!form.state || !form.region || !form.center || !form.membership_status)) {
      onError('All Member details (State, Region, Center, Status) are required.');
      setIsLoading(false);
      return;
    }

    // Conditional Visitor validation
    if (form.member_type === 'Visitor' && (!form.denomination || !form.location)) {
      onError('Visitor details (Denomination, Location) are required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Registration failed.');
      }

      onSuccess(data.registration);
    } catch (err: any) {
      console.error(err);
      onError(err.message || 'Something went wrong. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in">
      {/* Form Banner */}
      <div className="text-center mb-8">
        <Image className="mx-auto"  src="/fresh.png" alt="FRESH '26" width={150} height={150} />
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
          SECURE YOUR PASS FOR <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glow-text-primary">FRESH '26</span>
        </h2>
        <p className="text-slate-600 max-w-lg mx-auto text-sm md:text-base">
          Join thousands of students, professionals, and visitors for a life-transforming and empowering encounter. Fill in your details below to generate your official access pass.
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden" id="registration-form">
        {/* Top ambient color strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />

        <div className="space-y-6">
          
          {/* 1. SECTION: PERSONAL DETAILS */}
          <div>
            <h3 className="text-sm uppercase tracking-wider text-primary font-bold mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> 1. Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full glass-input rounded-lg pl-3 pr-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-xs font-semibold text-slate-700 mb-1.5">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full glass-input rounded-lg px-3 py-2.5 text-sm cursor-pointer"
                >
                  <option value="" disabled className="text-gray-400">Select Gender</option>
                  <option value="Male" className="text-slate-900">Male</option>
                  <option value="Female" className="text-slate-900">Female</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. +234 812 345 6789"
                  className="w-full glass-input rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. john.doe@example.com"
                  className="w-full glass-input rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 2. SECTION: STATUS & INSTITUTION */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm uppercase tracking-wider text-primary font-bold mb-4 flex items-center gap-2">
              <School className="w-4 h-4" /> 2. Profile & Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institution */}
              <div className="md:col-span-2">
                <label htmlFor="institution" className="block text-xs font-semibold text-slate-700 mb-1.5">Institution / Workplace *</label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  required
                  value={form.institution}
                  onChange={handleChange}
                  placeholder="e.g. Ladoke Akintola University of Technology"
                  className="w-full glass-input rounded-lg px-3 py-2.5 text-sm"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Status *</label>
                <select
                  id="status"
                  name="status"
                  required
                  value={form.status}
                  onChange={handleChange}
                  className="w-full glass-input rounded-lg px-3 py-2.5 text-sm cursor-pointer"
                >
                  <option value="" disabled className="text-gray-400">Select Status</option>
                  <option value="Staff" className="text-slate-900">Staff / Professional</option>
                  <option value="Student" className="text-slate-900">Student</option>
                  <option value="Graduate" className="text-slate-900">Graduate</option>
                  <option value="Postgraduate" className="text-slate-900">Postgraduate</option>
                  <option value="Corper" className="text-slate-900">Corper (NYSC)</option>
                  <option value="Non-Student" className="text-slate-900">Non-Student</option>
                </select>
              </div>
            </div>

            {/* CONDITIONAL STUDENT FIELDS */}
            {form.status === 'Student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in">
                <div>
                  <label htmlFor="level" className="block text-xs font-semibold text-primary mb-1.5">Academic Level *</label>
                  <select
                    id="level"
                    name="level"
                    required
                    value={form.level}
                    onChange={handleChange}
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm border-primary/20 cursor-pointer"
                  >
                    <option value="" disabled className="text-gray-400">Select Level</option>
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                    <option value="500 Level">500 Level</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="department" className="block text-xs font-semibold text-primary mb-1.5">Department *</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    required
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm border-primary/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. SECTION: MEMBERSHIP STATUS */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm uppercase tracking-wider text-primary font-bold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 3. Membership Details
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Are you a DCLM Member or Visitor? *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'member_type', value: 'Member' } } as any)}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    form.member_type === 'Member'
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(37,99,235,0.1)]'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  DCLM Member
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'member_type', value: 'Visitor' } } as any)}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    form.member_type === 'Visitor'
                      ? 'bg-secondary/10 border-secondary text-secondary shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  Visitor / Guest
                </button>
              </div>
            </div>

            {/* CONDITIONAL DCLM MEMBER FIELDS */}
            {form.member_type === 'Member' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in">
                <div>
                  <label htmlFor="state" className="block text-xs font-semibold text-primary mb-1.5">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    value={form.state}
                    onChange={handleChange}
                    placeholder="e.g. Oyo"
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm border-primary/20"
                  />
                </div>
                <div>
                  <label htmlFor="region" className="block text-xs font-semibold text-primary mb-1.5">Region *</label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    required
                    value={form.region}
                    onChange={handleChange}
                    placeholder="e.g. Ogbomoso"
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm border-primary/20"
                  />
                </div>
                <div>
                  <label htmlFor="center" className="block text-xs font-semibold text-primary mb-1.5">Center *</label>
                  <input
                    type="text"
                    id="center"
                    name="center"
                    required
                    value={form.center}
                    onChange={handleChange}
                    placeholder="e.g. Canaanland"
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm border-primary/20"
                  />
                </div>
                <div>
                  <label htmlFor="membership_status" className="block text-xs font-semibold text-primary mb-1.5">Membership Role *</label>
                  <select
                    id="membership_status"
                    name="membership_status"
                    required
                    value={form.membership_status}
                    onChange={handleChange}
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm border-primary/20 cursor-pointer"
                  >
                    <option value="" disabled className="text-gray-400">Select Role</option>
                    <option value="member">Member</option>
                    <option value="worker">Worker</option>
                    <option value="Staff">Staff / Leader</option>
                  </select>
                </div>
              </div>
            )}

            {/* CONDITIONAL VISITOR FIELDS */}
            {form.member_type === 'Visitor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-secondary/5 border border-secondary/10 animate-fade-in">
                <div>
                  <label htmlFor="denomination" className="block text-xs font-semibold text-secondary mb-1.5">Denomination *</label>
                  <input
                    type="text"
                    id="denomination"
                    name="denomination"
                    required
                    value={form.denomination}
                    onChange={handleChange}
                    placeholder="e.g. RCCG, Catholic, Anglican"
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm border-secondary/20"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-xs font-semibold text-secondary mb-1.5">Location (City/State) *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Somolu, Lagos"
                    className="w-full glass-input rounded-lg px-3 py-2 text-sm border-secondary/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. SECTION: PHOTO UPLOAD */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm uppercase tracking-wider text-primary font-bold mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4" /> 4. Photo for Attending Card *
            </h3>
            <p className="text-xs text-slate-500 mb-4 -mt-2">
              Upload a high-quality portrait/avatar photo. This photo will be rendered on your custom light "I WILL BE ATTENDING" flier which you can download and share on social media.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circle Avatar Preview */}
              <div 
                onClick={handleUploadClick}
                className="w-36 h-36 rounded-full border-2 border-dashed border-slate-300 hover:border-primary flex items-center justify-center overflow-hidden bg-slate-50 cursor-pointer transition-all relative group shrink-0 shadow-inner"
              >
                {photoPreview ? (
                  <>
                    <img 
                      src={photoPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[10px] font-bold uppercase tracking-wider">
                      Change Photo
                    </div>
                  </>
                ) : (
                  <div className="text-center p-3 text-slate-400 hover:text-slate-600">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60 text-slate-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider block">Select Photo</span>
                  </div>
                )}
              </div>

              {/* Instructions & File Action */}
              <div className="flex-1 w-full text-center sm:text-left">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="btn-neon-secondary px-5 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 mx-auto sm:mx-0 cursor-pointer"
                >
                  <Camera className="w-4 h-4" /> Select Avatar Image
                </button>
                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  Supported formats: JPG, PNG, WEBP. Max size: 8MB. Recommended square aspect ratio.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* 5. SECTION: EXPECTATIONS (OPTIONAL) */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 5. Expectations (Optional)
            </h3>
            <div>
              <label htmlFor="expectations" className="block text-xs font-semibold text-slate-700 mb-1.5">What are you expecting from FRESH '26? (Optional)</label>
              <textarea
                id="expectations"
                name="expectations"
                value={form.expectations}
                onChange={handleChange}
                rows={3}
                placeholder="Share your spiritual, career or academic expectations..."
                className="w-full glass-input rounded-lg px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>

        </div>

        {/* Submit Button */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-neon-primary py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:pointer-events-none group cursor-pointer"
            id="submit-registration"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering and Generating Pass...
              </>
            ) : (
              <>
                Register & Build My Card
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
