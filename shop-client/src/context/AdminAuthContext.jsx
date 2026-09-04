import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../services/api';

const Context = createContext(null);
export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { adminApi.me().then((result) => setAdmin(result.data)).catch(() => setAdmin(null)).finally(() => setLoading(false)); }, []);
  const value = useMemo(() => ({ admin, loading, login: async (payload) => { const result = await adminApi.login(payload); setAdmin(result.data); return result; }, logout: async () => { await adminApi.logout(); setAdmin(null); } }), [admin, loading]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useAdminAuth = () => useContext(Context);
