import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ' +
    (isActive ? 'bg-signal-dim text-signal' : 'text-ink-muted hover:bg-canvas hover:text-ink');

  return (
    <aside className="w-60 h-screen bg-surface border-r border-border flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-signal text-white font-display font-bold text-sm flex items-center justify-center">
            IP
          </div>
          <span className="font-display font-semibold text-ink">Inventory</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/" end className={linkClass}>Products</NavLink>
        <NavLink to="/purchase-requests" className={linkClass}>Purchase Requests</NavLink>
        <NavLink to="/purchase-orders" className={linkClass}>Purchase Orders</NavLink>
        <NavLink to="/warehouses" className={linkClass}>Warehouses</NavLink>
        <NavLink to="/suppliers" className={linkClass}>Suppliers</NavLink>
        {user?.role === 'admin' && (
          <>
            <NavLink to="/team" className={linkClass}>Team</NavLink>
            <NavLink to="/supplier-approvals" className={linkClass}>Supplier Approvals</NavLink>
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={() => navigate('/profile')}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-canvas transition mb-1"
        >
          <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
          <p className="text-xs text-ink-muted capitalize">{user?.role?.replace('_', ' ')}</p>
        </button>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink-muted hover:bg-canvas hover:text-critical transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}