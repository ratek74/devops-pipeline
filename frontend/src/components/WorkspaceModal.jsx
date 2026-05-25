import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const WORKSPACE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

const WorkspaceModal = ({ isOpen, onClose, onSave, workspace }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: WORKSPACE_COLORS[0],
  });

  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || '',
        description: workspace.description || '',
        color: workspace.color || WORKSPACE_COLORS[0],
      });
    } else {
      setFormData({ name: '', description: '', color: WORKSPACE_COLORS[0] });
    }
  }, [workspace, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="glass glass-card modal-content">
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>
        <h2 style={{ marginBottom: '24px', fontSize: '22px' }}>
          {workspace ? 'Edit Workspace' : 'New Workspace'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Personal, Work, University"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', fontSize: '14px' }}>
              Color
            </label>
            <div className="color-swatch-grid">
              {WORKSPACE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-swatch ${formData.color === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" className="btn btn-sm">
              {workspace ? 'Update' : 'Create'} Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceModal;
