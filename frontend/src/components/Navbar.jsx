import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { LayoutDashboard, LogOut, Moon, Sun, Menu, X, Plus, ChevronRight, Settings } from 'lucide-react';

const WorkspacesDropdown = ({ isOpen, onClose }) => {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/workspaces')
         .then(res => setWorkspaces(res.data))
         .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose} />
      <div className="mega-dropdown" style={{ zIndex: 100 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-secondary)', marginBottom: '12px', padding: '0 4px' }}>
          Your Workspaces
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          {workspaces.map(ws => (
            <Link 
              key={ws.id} 
              to={`/workspace/${ws.id}`} 
              className="workspace-list-item"
              onClick={onClose}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: ws.color || '#6366f1', flexShrink: 0 }} />
              <span style={{ flex: 1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
              <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
            </Link>
          ))}
          {workspaces.length === 0 && (
            <div style={{ padding: '8px 4px', fontSize: '13px', color: 'var(--text-secondary)' }}>No workspaces yet.</div>
          )}
        </div>
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />
        <Link 
          to="/?newWorkspace=true" 
          className="btn-secondary" 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
          onClick={onClose}
        >
          <Plus size={16} style={{ marginRight: '6px' }} /> New Workspace
        </Link>
      </div>
    </>
  );
};

const WorkspacesMobileList = ({ onClose }) => {
  const [workspaces, setWorkspaces] = useState([]);
  useEffect(() => {
    api.get('/workspaces').then(res => setWorkspaces(res.data)).catch(() => {});
  }, []);

  return (
    <>
      {workspaces.map(ws => (
        <Link key={ws.id} to={`/workspace/${ws.id}`} style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={onClose}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ws.color || '#6366f1', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
        </Link>
      ))}
      <Link to="/?newWorkspace=true" style={{ textDecoration: 'none', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }} onClick={onClose}>
        <Plus size={16} /> New Workspace
      </Link>
    </>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspacesOpen, setWorkspacesOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setWorkspacesOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/tasks');
    if (path === '/workspace') return location.pathname.startsWith('/workspace') || location.pathname.startsWith('/project');
    return location.pathname.startsWith(path);
  };

  const navContainerStyle = {
    position: 'fixed',
    top: '16px',
    left: '0',
    right: '0',
    padding: '0 32px',
    zIndex: 50,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    pointerEvents: 'none'
  };

  const pointerEventsAuto = { pointerEvents: 'auto' };

  const glassCircleStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surface-color)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    ...pointerEventsAuto
  };

  if (!user) {
    return (
      <nav style={navContainerStyle}>
        <Link to="/" style={glassCircleStyle} title="TaskManager">
          <LayoutDashboard size={20} style={{ color: 'var(--primary-color)' }} />
        </Link>
        <div style={{ ...glassCircleStyle, width: 'auto', padding: '0 16px', borderRadius: '9999px', gap: '12px' }}>
          <Link to="/login" className="btn-secondary btn-sm" style={{ textDecoration: 'none', border: 'none' }}>Login</Link>
          <Link to="/register" className="btn btn-sm" style={{ textDecoration: 'none' }}>Register</Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav style={navContainerStyle}>
        {/* Left Column: Logo */}
        <Link to="/" style={glassCircleStyle} title="TaskManager">
          <LayoutDashboard size={20} style={{ color: 'var(--primary-color)' }} />
        </Link>

        {/* Center Column: Liquid Glass Pill (Hidden on Mobile) */}
        <div 
          className="liquid-glass-nav hidden-mobile"
          style={{ 
            display: 'flex',
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: scrolled ? (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)') : undefined,
            transition: 'background-color 0.3s ease',
            ...pointerEventsAuto
          }}
        >
          <Link to="/" className={`nav-pill-link ${isActive('/') ? 'active' : ''}`}>
            My Tasks
          </Link>
          
          <div style={{ position: 'relative' }}>
            <button 
              className={`nav-pill-link ${isActive('/workspace') ? 'active' : ''}`}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none' }}
              onClick={() => setWorkspacesOpen(!workspacesOpen)}
            >
              Workspaces
            </button>
            <WorkspacesDropdown isOpen={workspacesOpen} onClose={() => setWorkspacesOpen(false)} />
          </div>

          <Link to="/timer" className={`nav-pill-link ${isActive('/timer') ? 'active' : ''}`}>
            Timer
          </Link>
          
          <Link to="/settings" className={`nav-pill-link ${isActive('/settings') ? 'active' : ''}`}>
            Settings
          </Link>

          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)', margin: '0 8px' }} />
          
          <Link to="/?newTask=true" className="btn btn-sm" style={{ borderRadius: '9999px', padding: '6px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Plus size={16} /> New Task
          </Link>
        </div>

        {/* Right Column: User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', ...pointerEventsAuto }}>
          <button onClick={toggleTheme} style={{ ...glassCircleStyle, width: '36px', height: '36px' }}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Desktop User Avatar */}
          <div className="hidden-mobile" style={{ position: 'relative' }}>
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{ 
                border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 600, fontSize: '14px',
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
              }}
            >
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                getInitials()
              )}
            </button>

            {profileDropdownOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setProfileDropdownOpen(false)} />
                <div className="mega-dropdown" style={{ right: 0, left: 'auto', transform: 'none', minWidth: '200px' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.displayName || user.username}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>
                  </div>
                  <Link to="/settings" className="workspace-list-item" style={{ padding: '8px 12px' }} onClick={() => setProfileDropdownOpen(false)}>
                    <Settings size={16} /> Settings
                  </Link>
                  <button onClick={handleLogout} className="workspace-list-item" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', color: 'var(--error-color)', cursor: 'pointer', padding: '8px 12px' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="hidden-desktop"
            style={{ ...glassCircleStyle, width: '44px', height: '44px' }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay">
          <div style={{ position: 'absolute', top: '16px', right: '32px' }}>
            <button onClick={() => setMobileMenuOpen(false)} style={glassCircleStyle}>
              <X size={20} />
            </button>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '48px', overflowY: 'auto' }}>
            <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              My Tasks updated <ChevronRight size={20} />
            </Link>
            
            <div className="mobile-nav-link" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px', paddingBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Workspaces
              </div>
              <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px', fontWeight: 500 }}>
                <WorkspacesMobileList onClose={() => setMobileMenuOpen(false)} />
              </div>
            </div>

            <Link to="/timer" className={`mobile-nav-link ${isActive('/timer') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              Timer <ChevronRight size={20} />
            </Link>
            
            <Link to="/settings" className={`mobile-nav-link ${isActive('/settings') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              Settings <ChevronRight size={20} />
            </Link>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {getInitials()}
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || user.username}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px', borderRadius: '50%' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
