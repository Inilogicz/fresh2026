'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Search, 
  Users, 
  UserCheck, 
  Download, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap
} from 'lucide-react';

interface RegistrationRecord {
  id: number;
  ticket_number: string;
  name: string;
  phone?: string;
  email?: string;
  gender: string;
  institution: string;
  status: string;
  level?: string;
  department?: string;
  member_type: string;
  state?: string;
  region?: string;
  center?: string;
  membership_status?: string;
  denomination?: string;
  location?: string;
  expectations?: string;
  photo?: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Check auth on load
  useEffect(() => {
    const savedToken = localStorage.getItem('fresh_admin_token');
    if (savedToken === 'fresh2026admin') {
      setIsAuthenticated(true);
      fetchRegistrations('fresh2026admin');
    }
  }, []);

  // Fetch registrations from API
  const fetchRegistrations = async (authPassword = password) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/admin/registrations?password=${authPassword}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load registrations.');
      }
      setRegistrations(data.registrations);
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || 'Error occurred while loading data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fresh2026admin') {
      localStorage.setItem('fresh_admin_token', password);
      setIsAuthenticated(true);
      setLoginError('');
      fetchRegistrations(password);
    } else {
      setLoginError('Invalid Administrator password. Please try again.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('fresh_admin_token');
    setIsAuthenticated(false);
    setPassword('');
    setRegistrations([]);
  };

  // Delete registration record
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this registration record? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    const authPassword = localStorage.getItem('fresh_admin_token') || password;
    try {
      const response = await fetch(`/api/admin/registrations?id=${id}&password=${authPassword}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete record.');
      }
      // Remove from state
      setRegistrations(prev => prev.filter(r => r.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err: any) {
      alert(err.message || 'Could not delete registration.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Export database to CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      'Ticket Number', 'Full Name', 'Phone Number', 'Email Address', 'Gender', 'Institution', 'Status', 
      'Academic Level', 'Department', 'Membership Type', 'State', 'Region', 
      'Center', 'Membership Role', 'Denomination', 'Visitor Location', 
      'Expectations', 'Registration Date'
    ];

    const rows = registrations.map(r => [
      r.ticket_number,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      r.gender,
      `"${r.institution.replace(/"/g, '""')}"`,
      r.status,
      r.level || '',
      r.department || '',
      r.member_type,
      r.state || '',
      r.region || '',
      r.center || '',
      r.membership_status || '',
      r.denomination || '',
      r.location || '',
      `"${(r.expectations || '').replace(/"/g, '""')}"`,
      new Date(r.created_at).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FRESH26_Registrations_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle profile expansion and load photo on demand
  const toggleExpand = async (id: number) => {
    const isExpanding = expandedId !== id;
    setExpandedId(prev => prev === id ? null : id);

    if (isExpanding) {
      const record = registrations.find(r => r.id === id);
      if (record && !record.photo) {
        try {
          const authPassword = localStorage.getItem('fresh_admin_token') || password;
          const response = await fetch(`/api/admin/registrations?id=${id}&password=${authPassword}`);
          const data = await response.json();
          if (response.ok && data.success && data.photo) {
            setRegistrations(prev => prev.map(r => r.id === id ? { ...r, photo: data.photo } : r));
          }
        } catch (err) {
          console.error('Failed to fetch photo on demand:', err);
        }
      }
    }
  };

  // Filter & Search Logic
  const filteredRegistrations = registrations.filter(r => {
    const searchString = `${r.name} ${r.ticket_number} ${r.institution}`.toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || r.status === statusFilter;
    const matchesType = typeFilter === '' || r.member_type === typeFilter;
    const matchesGender = genderFilter === '' || r.gender === genderFilter;
    return matchesSearch && matchesStatus && matchesType && matchesGender;
  });

  // Calculate Statistics
  const totalCount = registrations.length;
  const studentCount = registrations.filter(r => r.status === 'Student').length;
  const postgraduateCount = registrations.filter(r => r.status === 'Postgraduate').length;
  const graduateCount = registrations.filter(r => r.status === 'Graduate').length;
  const corperCount = registrations.filter(r => r.status === 'Corper').length;
  const staffCount = registrations.filter(r => r.status === 'Staff').length;
  const nonStudentCount = registrations.filter(r => r.status === 'Non-Student').length;
  const memberCount = registrations.filter(r => r.member_type === 'Member').length;
  const visitorCount = registrations.filter(r => r.member_type === 'Visitor').length;
  const maleCount = registrations.filter(r => r.gender === 'Male').length;
  const femaleCount = registrations.filter(r => r.gender === 'Female').length;

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col justify-between">
      
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <a href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-slate-500">Back to Registration</span>
        </a>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-sm">
            F
          </div>
          <h1 className="text-base font-bold text-slate-800">
            FRESH<span className="text-primary font-mono">'26</span> Admin
          </h1>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="w-full max-w-7xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center items-center z-10 relative">
        
        {!isAuthenticated ? (
          /* ========================================================================= */
          /* LOGIN GATE                                                                */
          /* ========================================================================= */
          <div className="w-full max-w-md animate-fade-in">
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary" />
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Administrator Access</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Enter the event administrator password to unlock registrations.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-red-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="adminPasswordInput" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    id="adminPasswordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    className="w-full glass-input rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-neon-primary py-2.5 px-4 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Unlock Admin Dashboard
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MAIN ADMIN DASHBOARD                                                      */
          /* ========================================================================= */
          <div className="w-full space-y-6 animate-fade-in">
            
            {/* Dashboard Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  REGISTRATION <span className="text-primary glow-text-primary">DASHBOARD</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                  Real-time participant database for DCLM FRESH '26 Youth Summit.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => fetchRegistrations(localStorage.getItem('fresh_admin_token') || password)}
                  disabled={isLoading}
                  className="btn-neon-secondary p-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer font-bold"
                  title="Refresh Database"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={registrations.length === 0}
                  className="btn-neon-primary py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-none font-bold"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export to CSV
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2.5 rounded-lg text-xs bg-red-500/10 border border-red-200 text-red-700 hover:bg-red-500/20 transition-all font-bold cursor-pointer"
                >
                  Lock
                </button>
              </div>
            </div>

            {/* STATISTICS OVERVIEW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stat: Total Registrations */}
              <div className="glass-panel p-5 rounded-xl flex items-center gap-4 bg-white">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Registrations</span>
                  <span className="text-2xl font-black text-slate-900">{totalCount}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono font-bold">
                    {maleCount}M • {femaleCount}F
                  </span>
                </div>
              </div>              {/* Stat: Academic Status */}
              <div className="glass-panel p-5 rounded-xl flex items-center gap-4 bg-white">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Students Count</span>
                  <span className="text-2xl font-black text-slate-900">{studentCount + postgraduateCount}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono font-bold">
                    {studentCount} Undergrad • {postgraduateCount} Postgrad
                  </span>
                </div>
              </div>
 
              {/* Stat: Graduates & Corpers */}
              <div className="glass-panel p-5 rounded-xl flex items-center gap-4 bg-white">
                <div className="w-12 h-12 rounded-lg bg-sky-500/10 border border-sky-200 flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Graduates & Corpers</span>
                  <span className="text-2xl font-black text-slate-900">{graduateCount + corperCount}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono font-bold">
                    {graduateCount} Grads • {corperCount} Corpers
                  </span>
                </div>
              </div>

              {/* Stat: Visitors Split */}
              <div className="glass-panel p-5 rounded-xl flex items-center gap-4 bg-white">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-200 flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Visitors Count</span>
                  <span className="text-2xl font-black text-slate-900">{visitorCount}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono font-bold">
                    {memberCount} DCLM Members
                  </span>
                </div>
              </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center bg-white">
              
              {/* Search input */}
              <div className="relative w-full md:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by name, ticket code, institution..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full glass-input rounded-lg pl-9 pr-4 py-2.5 text-xs border-slate-200"
                />
              </div>

              {/* Filter: Status */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <Filter className="w-3.5 h-3.5 text-primary" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="glass-input rounded-lg px-2 py-2 text-xs w-full md:w-36 border-slate-200 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="Student">Student</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Corper">Corper</option>
                  <option value="Staff">Staff</option>
                  <option value="Non-Student">Non-Student</option>
                </select>
              </div>

              {/* Filter: Member Type */}
              <div className="w-full md:w-auto shrink-0">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="glass-input rounded-lg px-2 py-2 text-xs w-full md:w-36 border-slate-200 cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="Member">Member</option>
                  <option value="Visitor">Visitor</option>
                </select>
              </div>

              {/* Filter: Gender */}
              <div className="w-full md:w-auto shrink-0">
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="glass-input rounded-lg px-2 py-2 text-xs w-full md:w-32 border-slate-200 cursor-pointer"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {fetchError && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-800 flex items-center gap-3 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{fetchError}</span>
              </div>
            )}

            {/* REGISTRATION DATA TABLE */}
            <div className="glass-panel rounded-xl overflow-hidden border border-slate-200 shadow-xl bg-white">
              <div className="overflow-x-auto w-full">
                
                {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500 bg-white">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs uppercase tracking-widest font-mono font-bold">Loading Database...</span>
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="py-20 text-center text-slate-500 bg-white">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
                    <h3 className="font-bold text-slate-800">No registrations found</h3>
                    <p className="text-xs mt-1 font-semibold">Try adjusting your filters or search query.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse bg-white">
                    
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        <th className="py-4 px-6">Ticket No.</th>
                        <th className="py-4 px-4">Name</th>
                        <th className="py-4 px-4">Gender</th>
                        <th className="py-4 px-4">Institution</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4">Member Type</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredRegistrations.map((r) => {
                        const isExpanded = expandedId === r.id;
                        return (
                          <React.Fragment key={r.id}>
                            <tr 
                              className={`hover:bg-slate-50/50 transition-all cursor-pointer ${
                                isExpanded ? 'bg-slate-50/80 border-b-0' : ''
                              }`}
                              onClick={() => toggleExpand(r.id)}
                            >
                              <td className="py-4 px-6 font-mono font-bold text-emerald-600">
                                {r.ticket_number}
                              </td>
                              <td className="py-4 px-4 font-bold text-slate-900">
                                {r.name}
                              </td>
                              <td className="py-4 px-4 text-slate-600 font-medium">
                                {r.gender}
                              </td>
                              <td className="py-4 px-4 text-slate-500 truncate max-w-[150px] font-medium">
                                {r.institution}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.status === 'Student' ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                                  r.status === 'Postgraduate' ? 'bg-indigo-500/10 text-indigo-700 border border-indigo-500/20' :
                                  r.status === 'Graduate' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                                  r.status === 'Corper' ? 'bg-sky-500/10 text-sky-700 border border-sky-500/20' :
                                  r.status === 'Staff' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                                  'bg-slate-500/10 text-slate-700 border border-slate-500/20'
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.member_type === 'Member' ? 'bg-primary/10 text-primary border border-primary/20' :
                                  'bg-slate-100 text-slate-700 border border-slate-300'
                                }`}>
                                  {r.member_type}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => toggleExpand(r.id)}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* COLLAPSIBLE ROW DETAILS */}
                            {isExpanded && (
                              <tr className="bg-slate-50/60">
                                <td colSpan={7} className="px-6 pb-6 pt-2 border-t-0">
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-xl bg-white border border-slate-200 shadow-inner">
                                    
                                    {/* Profile Avatar Photo (Col-3) */}
                                    <div className="md:col-span-3 flex flex-col items-center">
                                      <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-md relative bg-slate-50 flex items-center justify-center">
                                        {r.photo ? (
                                          <img 
                                            src={r.photo} 
                                            alt={`${r.name} profile`}
                                            className="w-full h-full object-cover animate-fade-in"
                                          />
                                        ) : (
                                          <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            <span className="text-[9px] uppercase font-bold tracking-wider font-mono">Loading Photo...</span>
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-mono mt-2.5 flex items-center gap-1 font-bold">
                                        <Clock className="w-3.5 h-3.5" /> 
                                        {new Date(r.created_at).toLocaleDateString()}
                                      </span>
                                    </div>

                                    {/* Core Details (Col-5) */}
                                    <div className="md:col-span-5 space-y-3">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Registration Details</h4>
                                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                                        <div>
                                          <span className="text-slate-400 block font-medium">Full Name</span>
                                          <span className="font-bold text-slate-900">{r.name}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block font-medium">Gender</span>
                                          <span className="font-bold text-slate-900">{r.gender}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block font-medium">Phone Number</span>
                                          <span className="font-bold text-slate-900">{r.phone || 'N/A'}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block font-medium">Email Address</span>
                                          <span className="font-bold text-slate-900 break-all">{r.email || 'N/A'}</span>
                                        </div>
                                        <div className="col-span-2">
                                          <span className="text-slate-400 block font-medium">Institution / Workplace</span>
                                          <span className="font-bold text-slate-900">{r.institution}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block font-medium">Primary Status</span>
                                          <span className="font-bold text-slate-900">{r.status}</span>
                                        </div>

                                        {/* Render conditional student details */}
                                        {r.status === 'Student' && (
                                          <>
                                            <div>
                                              <span className="text-primary block font-medium">Academic Level</span>
                                              <span className="font-bold text-slate-900">{r.level}</span>
                                            </div>
                                            <div className="col-span-2">
                                              <span className="text-primary block font-medium">Department</span>
                                              <span className="font-bold text-slate-900">{r.department}</span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Church Details & Expectations (Col-4) */}
                                    <div className="md:col-span-4 space-y-3 border-l border-slate-100 pl-0 md:pl-6">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                                        {r.member_type === 'Member' ? 'DCLM Church Details' : 'Visitor Details'}
                                      </h4>
                                      <div className="text-xs space-y-2 text-slate-700">
                                        {r.member_type === 'Member' ? (
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <span className="text-slate-400 block font-medium">State</span>
                                              <span className="font-bold text-slate-900">{r.state}</span>
                                            </div>
                                            <div>
                                              <span className="text-slate-400 block font-medium">Region</span>
                                              <span className="font-bold text-slate-900">{r.region}</span>
                                            </div>
                                            <div className="col-span-2">
                                              <span className="text-slate-400 block font-medium">Group / Center</span>
                                              <span className="font-bold text-slate-900">{r.center}</span>
                                            </div>
                                            <div>
                                              <span className="text-slate-400 block font-medium">Church Role</span>
                                              <span className="font-bold text-slate-900 capitalize">{r.membership_status}</span>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            <div>
                                              <span className="text-slate-400 block font-medium">Denomination</span>
                                              <span className="font-bold text-slate-900">{r.denomination}</span>
                                            </div>
                                            <div>
                                              <span className="text-slate-400 block font-medium">Visitor Location</span>
                                              <span className="font-bold text-slate-900">{r.location}</span>
                                            </div>
                                          </div>
                                        )}

                                        <div className="pt-2.5 border-t border-slate-100">
                                          <span className="text-slate-400 block font-bold">Personal Expectations</span>
                                          <p className="text-slate-600 italic mt-0.5 leading-relaxed font-medium">
                                            {r.expectations || "No specific expectations recorded."}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>

                  </table>
                )}

              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-200 mt-12 bg-white/50 text-center z-10">
        <p className="text-xs text-slate-400 font-bold">© 2026 Deeper Christian Life Ministry. Admin Portal.</p>
      </footer>

    </div>
  );
}
