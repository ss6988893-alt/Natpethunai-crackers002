import { useState } from 'react';
import { LockKeyhole, Mail } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ identity: '', password: '' }); const [busy, setBusy] = useState(false); const { admin, login } = useAdminAuth(); const navigate = useNavigate(); const location = useLocation();
  if (admin) navigate('/admin', { replace: true });
  const submit = async (event) => { event.preventDefault(); setBusy(true); try { await login(form); toast.success('Welcome back'); navigate(location.state?.from?.pathname || '/admin', { replace: true }); } catch (error) { toast.error(error.response?.data?.message || 'Unable to sign in'); } finally { setBusy(false); } };
  return <main className="admin-login"><section><img src="/assets/shop-logo.webp" alt="Natpe Thunai Crackers"/><p>Secure administration</p><h1>Welcome back</h1><span>Sign in to manage products, orders and sales.</span><form onSubmit={submit}><label>Email or username<div><Mail/><input autoFocus required autoComplete="username" value={form.identity} onChange={(e) => setForm({ ...form, identity: e.target.value })}/></div></label><label>Password<div><LockKeyhole/><input required minLength="8" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/></div></label><button disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</button></form><a href="/">← Return to shop</a></section></main>;
}
