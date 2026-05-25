import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import ProjectModal from '../components/ProjectModal';
import WorkspaceModal from '../components/WorkspaceModal';
import { Plus, FolderKanban, Edit2, Trash2, ArrowLeft } from 'lucide-react';

const CompletionRing = ({ percentage, size = 52 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="completion-ring">
      <circle className="completion-ring-bg" cx={size / 2} cy={size / 2} r={radius} />
      <circle
        className="completion-ring-progress"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="completion-text"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
};

const WorkspaceDashboard = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchWorkspace();
    fetchProjects();
  }, [workspaceId]);

  useEffect(() => {
    if (searchParams.get('newProject') === 'true') {
      setIsProjectModalOpen(true);
    }
  }, [searchParams]);

  const fetchWorkspace = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}`);
      setWorkspace(res.data);
    } catch {
      toast.error('Failed to load workspace');
      navigate('/');
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/projects`);
      setProjects(res.data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (data) => {
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, data);
        toast.success('Project updated');
      } else {
        await api.post(`/workspaces/${workspaceId}/projects`, data);
        toast.success('Project created');
      }
      setIsProjectModalOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch {
      toast.error('Failed to save project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Delete this project and all its tasks?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted');
        fetchProjects();
      } catch {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleUpdateWorkspace = async (data) => {
    try {
      await api.put(`/workspaces/${workspaceId}`, data);
      toast.success('Workspace updated');
      setIsWorkspaceModalOpen(false);
      fetchWorkspace();
    } catch {
      toast.error('Failed to update workspace');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (window.confirm('Delete this workspace and ALL its projects and tasks? This cannot be undone.')) {
      try {
        await api.delete(`/workspaces/${workspaceId}`);
        toast.success('Workspace deleted');
        navigate('/');
      } catch {
        toast.error('Failed to delete workspace');
      }
    }
  };

  if (!workspace && !loading) return null;

  return (
    <div>
      {/* Workspace Header */}
      {workspace && (
        <div className="workspace-header">
          <div
            className="workspace-avatar"
            style={{ background: workspace.color || '#6366f1' }}
          >
            {workspace.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>{workspace.name}</h1>
            {workspace.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{workspace.description}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsWorkspaceModalOpen(true)} className="btn btn-secondary btn-sm">
              <Edit2 size={14} /> Edit
            </button>
            <button onClick={handleDeleteWorkspace} className="btn btn-danger btn-sm">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Projects</h2>
        <button onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }} className="btn btn-sm">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass glass-card skeleton" style={{ height: '180px' }} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FolderKanban size={48} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '12px' }} />
          <h3 style={{ marginBottom: '8px' }}>No projects yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
            Create your first project to organize tasks.
          </p>
          <button onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }} className="btn btn-sm">
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="glass glass-card project-card"
              onClick={() => navigate(`/project/${proj.id}`)}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '17px', marginBottom: '4px' }}>{proj.name}</h3>
                  {proj.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {proj.description}
                    </p>
                  )}
                </div>
                <CompletionRing percentage={proj.completionPercentage || 0} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {proj.completedTasks}/{proj.totalTasks} tasks
                </span>
                <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditingProject(proj); setIsProjectModalOpen(true); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => { setIsProjectModalOpen(false); setEditingProject(null); }}
        onSave={handleSaveProject}
        project={editingProject}
      />

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSave={handleUpdateWorkspace}
        workspace={workspace}
      />
    </div>
  );
};

export default WorkspaceDashboard;
