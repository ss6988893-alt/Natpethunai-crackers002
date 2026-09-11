import { useEffect, useState } from 'react';
import { KeyRound, Save, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminAuth } from '../../context/AdminAuthContext';

const emptyForm = { username: '', currentPassword: '', newPassword: '', confirmPassword: '' };

export default function AdminSettings() {
  const { admin, updateCredentials } = useAdminAuth();
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setForm((value) => ({ ...value, username: admin?.username || '' })); }, [admin?.username]);
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('New passwords do not match');
    setBusy(true);
    try {
      const result = await updateCredentials({ username: form.username, currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success(result.message);
      setForm((value) => ({ ...value, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update login details');
    } finally { setBusy(false); }
  };

  return <div className="admin-page">
    <div className="admin-page-title"><div><p>Configuration</p><h1>Settings</h1></div></div>
    <section className="admin-settings-intro admin-panel"><ShieldCheck/><div><h2>Owner security</h2><p>Change the username used to sign in, or set a new password. Your current password is always required.</p></div></section>
    <form className="admin-panel admin-credentials-form" onSubmit={submit}>
      <header><div><small>Login details</small><h2>Username and password</h2></div></header>
      <div className="admin-form-grid">
        <label><span><UserRound/> Username</span><input className="admin-username-input" required minLength="3" maxLength="40" pattern="[A-Za-z0-9._-]+" autoComplete="username" value={form.username} onChange={(event) => change('username', event.target.value)} /></label>
        <label><span><KeyRound/> Current password</span><input required minLength="8" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(event) => change('currentPassword', event.target.value)} /></label>
        <label><span>New password <small>(optional)</small></span><input minLength="12" maxLength="128" type="password" autoComplete="new-password" placeholder="At least 12 characters" value={form.newPassword} onChange={(event) => change('newPassword', event.target.value)} /></label>
        <label><span>Confirm new password</span><input minLength="12" maxLength="128" type="password" autoComplete="new-password" disabled={!form.newPassword} value={form.confirmPassword} onChange={(event) => change('confirmPassword', event.target.value)} /></label>
      </div>
      <p className="admin-security-note">Changing the password signs out every other admin session for security.</p>
      <button className="admin-primary" disabled={busy}><Save/>{busy ? 'Saving…' : 'Save login details'}</button>
    </form>
  </div>;
}
