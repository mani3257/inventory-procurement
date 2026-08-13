import { useEffect, useState } from 'react';
import * as userService from '../services/userService';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ROLE_LABELS = {
  admin: 'Admin',
  warehouse_manager: 'Warehouse Manager',
  procurement_manager: 'Procurement Manager'
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    userService.getMyProfile().then((data) => {
      setProfile(data);
      setName(data.name);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const payload = { name };
      if (password) payload.password = password;
      const updated = await userService.updateMyProfile(payload);
      setProfile(updated);
      setPassword('');
      setMessage('Profile updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="p-8 text-ink-muted text-sm">Loading...</div>;

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">My Profile</h1>

      <Card>
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="w-12 h-12 rounded-full bg-signal-dim flex items-center justify-center text-signal font-display font-semibold text-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-ink text-sm">{profile.name}</p>
            <p className="text-xs text-ink-muted">{profile.email}</p>
            <p className="text-xs text-signal font-medium mt-0.5">{ROLE_LABELS[profile.role]}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          {error && <p className="text-critical text-xs">{error}</p>}
          {message && <p className="text-success text-xs">{message}</p>}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="New password (leave blank to keep current)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
        </form>
      </Card>
    </div>
  );
}