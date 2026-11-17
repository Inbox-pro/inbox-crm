import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { InboxLogo } from '../components/common/InboxLogo';
import {
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Briefcase,
  User as UserIcon,
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { t, tRole } = useLanguage();

  const [activeTab, setActiveTab] = useState<'user' | 'admin' | 'register'>('admin');
  const [email, setEmail] = useState('admin@inboxinfotech.com');
  const [password, setPassword] = useState('admin@inbox2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('Welcome@2026!');
  const [regRole, setRegRole] = useState<'Sales' | 'Manager' | 'Admin'>('Sales');
  const [regDepartment, setRegDepartment] = useState('Sales Operations');

  // If already authenticated, redirect directly to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleTabChange = (tab: 'user' | 'admin' | 'register') => {
    setActiveTab(tab);
    setErrorMessage(null);
    if (tab === 'admin') {
      setEmail('admin@inboxinfotech.com');
      setPassword('admin@inbox2025');
    } else if (tab === 'user') {
      setEmail('sales@inboxinfotech.com');
      setPassword('sales@inbox2025');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeTab === 'register') {
      const trimmedName = regName.trim();
      const trimmedEmail = regEmail.trim();
      const trimmedPass = regPassword.trim();

      if (!trimmedName) {
        const msg = 'Please enter your full name';
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      if (!trimmedEmail) {
        const msg = 'Please enter your work email address';
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      if (!trimmedPass) {
        const msg = 'Please enter a password';
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      setIsLoading(true);
      try {
        const res = await register({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPass,
          role: regRole,
          department: regDepartment.trim() || 'Sales Operations',
        });

        if (res.success) {
          setErrorMessage(null);
          showToast(`Account created and saved in MongoDB Atlas! Welcome, ${trimmedName}!`, 'success');
          navigate('/dashboard');
        } else {
          setErrorMessage(res.message || 'Registration failed.');
          showToast(res.message || 'Registration failed.', 'error');
        }
      } catch (err: any) {
        const msg = err.message || 'An unexpected error occurred during account registration.';
        setErrorMessage(msg);
        showToast(msg, 'error');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      const msg = t('login.email_required', 'Please enter your work email address');
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    if (!trimmedPass) {
      const msg = t('login.pass_required', 'Please enter your password');
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(trimmedEmail, trimmedPass, activeTab);
      if (res.success) {
        setErrorMessage(null);
        showToast(t('login.success', 'Login successful! Welcome to Inbox CRM.'), 'success');
        navigate('/dashboard');
      } else {
        const failureMsg = t('login.invalid', 'Invalid email or password. Please verify your credentials.');
        setErrorMessage(failureMsg);
        showToast(failureMsg, 'error');
      }
    } catch {
      const err = t('login.auth_failed', 'An unexpected error occurred during authentication.');
      setErrorMessage(err);
      showToast(err, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (
    targetEmail: string,
    roleTitle: string,
    targetRole: 'admin' | 'user',
    targetPass: string = 'demo1234'
  ) => {
    setErrorMessage(null);
    setEmail(targetEmail);
    setPassword(targetPass);
    setIsLoading(true);
    try {
      const res = await login(targetEmail, targetPass, targetRole);
      if (res.success) {
        showToast(t('login.signed_in_as', `Signed in successfully as ${roleTitle}!`, { role: roleTitle }), 'success');
        navigate('/dashboard');
      } else {
        const failureMsg = t('login.invalid', 'Sign in failed.');
        setErrorMessage(failureMsg);
        showToast(failureMsg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top utility bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <InboxLogo size="md" crmBadge={true} />
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button
            onClick={toggleTheme}
            id="theme-toggle-login"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('login.live_instance', 'Live Cloud Instance')}
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/40 dark:shadow-black/40 relative overflow-hidden">
            {/* Subtle top branding accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-emerald-500 to-blue-600" />

            {/* Header Text */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 shadow-md mb-4 relative group">
                <InboxLogo size="lg" showText={false} />
                <span className={`absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-xs ${
                  activeTab === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : activeTab === 'register'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}>
                  {activeTab === 'admin' ? t('login.admin_tab', 'Admin') : activeTab === 'register' ? 'Register' : t('login.staff_tab', 'Staff')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {activeTab === 'admin'
                  ? t('login.admin_portal', 'Administrator Portal')
                  : activeTab === 'register'
                  ? 'Create New Account'
                  : t('login.employee_workspace', 'Employee Workspace')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                {activeTab === 'register'
                  ? 'Register new user and save directly to MongoDB Atlas database'
                  : t('login.subtitle', 'Sign in to access your Inbox Infotech CRM instance')}
              </p>
            </div>

            {/* Mode Switcher Tabs: Admin vs Staff vs Register */}
            <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-6 border border-slate-200/70 dark:border-slate-700/60">
              <button
                type="button"
                id="login-tab-admin"
                onClick={() => handleTabChange('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('login.admin_tab', 'Admin')}</span>
              </button>
              <button
                type="button"
                id="login-tab-user"
                onClick={() => handleTabChange('user')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'user'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t('login.staff_tab', 'Staff')}</span>
              </button>
              <button
                type="button"
                id="login-tab-register"
                onClick={() => handleTabChange('register')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>

            {/* Inline Error Alert Banner */}
            {errorMessage && (
              <div
                id="login-error-banner"
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 shadow-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900 dark:text-rose-100">{t('login.auth_failed', 'Authentication Failed')}</p>
                  <p className="mt-0.5 opacity-90 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'register' ? (
                <>
                  {/* Registration Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        id="register-name-input"
                        value={regName}
                        onChange={(e) => {
                          setRegName(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        required
                        placeholder="e.g. Shalini Nair"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Registration Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Work Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        id="register-email-input"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        required
                        placeholder="shalini@inboxinfotech.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Role & Department */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Access Role
                      </label>
                      <select
                        id="register-role-select"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
                      >
                        <option value="Sales">Sales Rep</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Department
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          id="register-dept-input"
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          placeholder="Sales"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="register-password-input"
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        required
                        placeholder="e.g. Welcome@2026!"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Password Policy: </span>
                      Must be ≥8 chars with uppercase, lowercase, number, and special character (!@#$%^&*).
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="register-submit-btn"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange('admin')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Already have an account? Sign in here
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      {t('login.work_email', 'Work Email')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        id="login-email-input"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        required
                        placeholder="name@inboxinfotech.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {t('login.password', 'Password')}
                      </label>
                      <button
                        type="button"
                        onClick={() => showToast(`Registered password: ${activeTab === 'admin' ? 'admin@inbox2025' : 'sales@inbox2025'} (or demo1234)`, 'info')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t('login.forgot_password', 'Forgot password?')}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-password-input"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        required
                        placeholder={t('login.enter_password', 'Enter password')}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Verified Credentials Helper Callout */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {t('login.credentials_guide', 'Demo Credentials Guide')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeTab === 'admin') {
                            setEmail('admin@inboxinfotech.com');
                            setPassword('admin@inbox2025');
                          } else {
                            setEmail('sales@inboxinfotech.com');
                            setPassword('sales@inbox2025');
                          }
                          setErrorMessage(null);
                          showToast(t('login.credentials_filled', 'Credentials filled in form!'), 'info');
                        }}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t('login.autofill', 'Auto-Fill')}
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                      <div>
                        {t('login.work_email', 'Email')}: <span className="font-semibold text-slate-900 dark:text-slate-200 select-all">{activeTab === 'admin' ? 'admin@inboxinfotech.com' : 'sales@inboxinfotech.com'}</span>
                      </div>
                      <div>
                        {t('login.password', 'Password')}: <span className="font-semibold text-slate-900 dark:text-slate-200 select-all">{activeTab === 'admin' ? 'admin@inbox2025' : 'sales@inbox2025'}</span> (or <span className="select-all">demo1234</span>)
                      </div>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-sm border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{t('login.remember_me', 'Remember this device')}</span>
                    </label>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {t('login.tls_encrypted', '256-bit TLS Encrypted')}
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {t('login.sign_in_as', `Sign in as ${activeTab === 'admin' ? 'Administrator' : 'Employee'}`, {
                            role: activeTab === 'admin' ? t('role.Admin', 'Administrator') : t('role.Sales', 'Employee'),
                          })}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleTabChange('register')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Don't have an account yet? Register here
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Quick 1-Click Demo Logins Section */}
            {activeTab !== 'register' && (
              <div className="mt-7 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {t('login.quick_demo_roles', '1-Click Demo Logins')}
                  </span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400">{t('login.preconfigured', 'Pre-configured')}</span>
                </div>

              {activeTab === 'admin' ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    id="quick-login-superadmin"
                    onClick={() => handleQuickLogin('admin@inboxinfotech.com', 'Super Admin (Tejas Chauhan)', 'admin', 'admin@inbox2025')}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Tejas Chauhan</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                          {tRole('Super Admin')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">admin@inboxinfotech.com</div>
                    </div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      {t('login.log_in', 'Log In')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    id="quick-login-admin"
                    onClick={() => handleQuickLogin('ananya@inboxinfotech.com', 'Operations Admin (Ananya Sharma)', 'admin', 'ananya@inbox2025')}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Ananya Sharma</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                          {tRole('Admin')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">ananya@inboxinfotech.com</div>
                    </div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      {t('login.log_in', 'Log In')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    id="quick-login-sales"
                    onClick={() => handleQuickLogin('sales@inboxinfotech.com', 'Sales Executive (Rohan Mehta)', 'user', 'sales@inbox2025')}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Rohan Mehta</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                          {tRole('Sales')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">sales@inboxinfotech.com</div>
                    </div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      {t('login.log_in', 'Log In')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    id="quick-login-manager"
                    onClick={() => handleQuickLogin('manager@inboxinfotech.com', 'Sales Manager (Vikramaditya Rao)', 'user', 'manager@inbox2025')}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-900 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Vikramaditya Rao</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                          {tRole('Manager')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">manager@inboxinfotech.com</div>
                    </div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      {t('login.log_in', 'Log In')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Inbox Infotech Pvt. Ltd. • {t('login.rights_reserved', 'All Rights Reserved • Enterprise CRM Solution')}
      </footer>
    </div>
  );
};
