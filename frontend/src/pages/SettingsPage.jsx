import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import { User, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'];

const SettingsPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useContext(AuthContext);

  // Profile state
  const [profile, setProfile] = useState({ displayName: '', profilePictureUrl: '', username: '', email: '' });
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [usernameFeedback, setUsernameFeedback] = useState(null);
  const [emailFeedback, setEmailFeedback] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  // Email change
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');

  // Username check
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Security state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [securityFeedback, setSecurityFeedback] = useState(null);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setProfile(res.data);
      setOriginalEmail(res.data.email);
    } catch {
      toast.error('Failed to load profile');
    }
  };

  // === Profile Section ===
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileFeedback(null);
    try {
      const res = await api.put('/user/profile', {
        displayName: profile.displayName,
        profilePictureUrl: profile.profilePictureUrl,
      });
      setProfile(res.data);
      updateUser({ ...user, displayName: res.data.displayName, profilePictureUrl: res.data.profilePictureUrl });
      setProfileFeedback({ type: 'success', message: 'Profile updated successfully' });
      toast.success('Profile saved');
    } catch (err) {
      setProfileFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  // === Username Section ===
  const checkUsernameAvailability = async (username) => {
    if (!username || username === user?.username) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await api.get(`/user/check-username/${username}`);
      setUsernameAvailable(res.data.available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSaveUsername = async () => {
    if (profile.username === user?.username) return;
    setSavingUsername(true);
    setUsernameFeedback(null);
    try {
      const res = await api.put('/user/username', { username: profile.username });
      setProfile(res.data);
      updateUser({ ...user, username: res.data.username });
      setUsernameFeedback({ type: 'success', message: 'Username updated' });
      toast.success('Username changed');
    } catch (err) {
      setUsernameFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to change username' });
    } finally {
      setSavingUsername(false);
    }
  };

  // === Email Section ===
  const handleSaveEmail = async () => {
    if (profile.email === originalEmail) return;
    if (!showEmailConfirm) {
      setShowEmailConfirm(true);
      return;
    }
    setSavingEmail(true);
    setEmailFeedback(null);
    try {
      const res = await api.put('/user/email', { email: profile.email, currentPassword: emailPassword });
      setProfile(res.data);
      setOriginalEmail(res.data.email);
      updateUser({ ...user, email: res.data.email });
      setEmailFeedback({ type: 'success', message: 'Email updated' });
      setShowEmailConfirm(false);
      setEmailPassword('');
      toast.success('Email changed');
    } catch (err) {
      setEmailFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to change email' });
    } finally {
      setSavingEmail(false);
    }
  };

  // === Security Section ===
  const passwordStrength = getPasswordStrength(passwords.newPassword);

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSecurityFeedback({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    setSavingSecurity(true);
    setSecurityFeedback(null);
    try {
      await api.put('/user/password', passwords);
      setSecurityFeedback({ type: 'success', message: 'Password changed successfully' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      setSecurityFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setSavingSecurity(false);
    }
  };

  // === Delete Account ===
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/user/account');
      toast.info('Account deleted');
      logout();
      navigate('/login');
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = () => {
    if (profile.displayName) return profile.displayName.charAt(0).toUpperCase();
    if (profile.username) return profile.username.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div className="settings-page">
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>Manage your account preferences</p>

      {/* ═══ Profile Section ═══ */}
      <div className="glass glass-card settings-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <User size={20} style={{ color: 'var(--primary-color)' }} />
          <h2 className="settings-section-title" style={{ margin: 0 }}>Profile</h2>
        </div>

        <div className="settings-grid">
          {/* Avatar preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            {profile.profilePictureUrl ? (
              <img src={profile.profilePictureUrl} alt="Profile" className="avatar avatar-lg" />
            ) : (
              <div className="avatar avatar-lg avatar-placeholder">{getInitials()}</div>
            )}
            <div style={{ flex: 1 }}>
              <div className="settings-field">
                <label>Profile Picture URL</label>
                <input
                  type="url"
                  value={profile.profilePictureUrl || ''}
                  onChange={(e) => setProfile({ ...profile, profilePictureUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </div>

          <div className="settings-field">
            <label>Display Name</label>
            <input
              type="text"
              value={profile.displayName || ''}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          {profileFeedback && (
            <div className={`settings-feedback ${profileFeedback.type}`}>{profileFeedback.message}</div>
          )}

          <button onClick={handleSaveProfile} disabled={savingProfile} className="btn btn-sm" style={{ alignSelf: 'flex-start' }}>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', margin: '20px 0', paddingTop: '20px' }}>
          <div className="settings-grid">
            <div className="settings-field">
              <label>Username</label>
              <input
                type="text"
                value={profile.username || ''}
                onChange={(e) => {
                  setProfile({ ...profile, username: e.target.value });
                  setUsernameAvailable(null);
                }}
                onBlur={(e) => checkUsernameAvailability(e.target.value)}
                minLength={3}
              />
              {checkingUsername && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Checking...</span>}
              {usernameAvailable === true && <span style={{ fontSize: '12px', color: 'var(--success-color)' }}>✓ Available</span>}
              {usernameAvailable === false && <span style={{ fontSize: '12px', color: 'var(--error-color)' }}>✗ Already taken</span>}
            </div>
            {usernameFeedback && (
              <div className={`settings-feedback ${usernameFeedback.type}`}>{usernameFeedback.message}</div>
            )}
            <button
              onClick={handleSaveUsername}
              disabled={savingUsername || profile.username === user?.username || usernameAvailable === false}
              className="btn btn-sm"
              style={{ alignSelf: 'flex-start' }}
            >
              {savingUsername ? 'Saving...' : 'Update Username'}
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', margin: '20px 0', paddingTop: '20px' }}>
          <div className="settings-grid">
            <div className="settings-field">
              <label>Email Address</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => {
                  setProfile({ ...profile, email: e.target.value });
                  setShowEmailConfirm(false);
                }}
              />
            </div>
            {showEmailConfirm && (
              <div className="settings-field">
                <label>Confirm with current password</label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
            )}
            {emailFeedback && (
              <div className={`settings-feedback ${emailFeedback.type}`}>{emailFeedback.message}</div>
            )}
            <button
              onClick={handleSaveEmail}
              disabled={savingEmail || profile.email === originalEmail}
              className="btn btn-sm"
              style={{ alignSelf: 'flex-start' }}
            >
              {savingEmail ? 'Saving...' : showEmailConfirm ? 'Confirm Email Change' : 'Update Email'}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Security Section ═══ */}
      <div className="glass glass-card settings-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Shield size={20} style={{ color: 'var(--primary-color)' }} />
          <h2 className="settings-section-title" style={{ margin: 0 }}>Security</h2>
        </div>

        <div className="settings-grid">
          <div className="settings-field">
            <label>Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="settings-field">
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Enter new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwords.newPassword && (
              <>
                <div className="password-strength-meter">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`strength-bar ${level <= passwordStrength ? `active strength-${passwordStrength}` : ''}`}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[passwordStrength] }}>
                  {strengthLabels[passwordStrength]}
                </span>
              </>
            )}
          </div>

          <div className="settings-field">
            <label>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
              <span style={{ fontSize: '12px', color: 'var(--error-color)' }}>Passwords do not match</span>
            )}
          </div>

          {securityFeedback && (
            <div className={`settings-feedback ${securityFeedback.type}`}>{securityFeedback.message}</div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={savingSecurity || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
            className="btn btn-sm"
            style={{ alignSelf: 'flex-start' }}
          >
            {savingSecurity ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* ═══ Danger Zone ═══ */}
      <div className="danger-zone settings-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AlertTriangle size={20} style={{ color: '#ef4444' }} />
          <h2 className="danger-zone-title" style={{ margin: 0 }}>Danger Zone</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        <div className="settings-field" style={{ marginBottom: '16px' }}>
          <label style={{ color: 'var(--error-color)' }}>Type DELETE to confirm</label>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE"
            style={{ maxWidth: '300px', borderColor: deleteConfirm === 'DELETE' ? 'var(--error-color)' : undefined }}
          />
        </div>

        <button
          onClick={handleDeleteAccount}
          disabled={deleteConfirm !== 'DELETE' || deleting}
          className="btn btn-danger btn-sm"
        >
          {deleting ? 'Deleting...' : 'Delete My Account'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
