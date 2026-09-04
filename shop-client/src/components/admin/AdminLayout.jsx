import { useState } from 'react';
import { BarChart3, Bell, Boxes, ChevronLeft, CircleUserRound, LayoutDashboard, LogOut, Menu, PackagePlus, Settings, ShoppingCart, Tags, Users, X } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const links = [
  ['/admin', LayoutDashboard, 'Dashboard', true], ['/admin/products', Boxes, 'Products'], ['/admin/products/new', PackagePlus, 'Add Product'], ['/admin/categories', Tags, 'Categories'], ['/admin/orders', ShoppingCart, 'Orders'], ['/admin/customers', Users, 'Customers'], ['/admin/analytics', BarChart3, 'Analytics'], ['/admin/notifications', Bell, 'Notifications'], ['/admin/settings', Settings, 'Settings'],
];
export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false); const [mobile, setMobile] = useState(false); const { admin, logout } = useAdminAuth(); const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate('/admin/login', { replace: true }); };
  return <div className={`admin-shell ${collapsed ? 'is-collapsed' : ''}`}>
    <aside className={`admin-sidebar ${mobile ? 'is-open' : ''}`}><div className="admin-brand"><img src="/assets/shop-logo.webp" alt="Natpe Thunai"/><div><strong>Natpe Thunai</strong><span>Admin console</span></div><button onClick={() => setMobile(false)} className="admin-mobile-close" aria-label="Close menu"><X/></button></div>
      <nav>{links.map(([to, Icon, label, end]) => <NavLink key={to} end={end} to={to} onClick={() => setMobile(false)}><Icon/><span>{label}</span></NavLink>)}</nav>
      <button className="admin-logout" onClick={signOut}><LogOut/><span>Logout</span></button><button className="admin-collapse" onClick={() => setCollapsed((value) => !value)} aria-label="Collapse sidebar"><ChevronLeft/></button>
    </aside>
    {mobile && <button className="admin-overlay" onClick={() => setMobile(false)} aria-label="Close menu"/>}
    <section className="admin-workspace"><header className="admin-topbar"><button onClick={() => setMobile(true)} className="admin-menu"><Menu/></button><div><small>Management workspace</small><strong>{admin?.name}</strong></div><span className="admin-avatar"><CircleUserRound/></span></header><main className="admin-main"><Outlet/></main></section>
  </div>;
}
