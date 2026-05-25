import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import TaskModal from '../components/TaskModal';
import WorkspaceModal from '../components/WorkspaceModal';
import { Plus, Edit2, Trash2, Calendar, Clock, Search, Inbox } from 'lucide-react';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    if (searchParams.get('newWorkspace') === 'true') {
      setIsWorkspaceModalOpen(true);
    }
    if (searchParams.get('newTask') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tasks/inbox?page=${page}&size=10&sortBy=createdAt`);
      setTasks(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page]);

  const handleSaveTask = async (taskData) => {
    try {
      if (currentTask) {
        await api.put(`/tasks/${currentTask.id}`, taskData);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', taskData);
        toast.success('Task created');
      }
      setIsModalOpen(false);
      setCurrentTask(null);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleSaveWorkspace = async (data) => {
    try {
      await api.post('/workspaces', data);
      toast.success('Workspace created');
      setIsWorkspaceModalOpen(false);
      // Sidebar will auto-refresh on next render
    } catch {
      toast.error('Failed to create workspace');
    }
  };

  const openNewTaskModal = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'TODO': return { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1' };
      case 'IN_PROGRESS': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
      case 'COMPLETED': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
      default: return { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af' };
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Inbox size={28} style={{ color: 'var(--primary-color)' }} />
          <h1 style={{ fontSize: '28px' }}>My Tasks</h1>
        </div>
        <button onClick={openNewTaskModal} className="btn btn-sm">
          <Plus size={16} /> New Task
        </button>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
        Tasks not assigned to any project. Create workspaces and projects to organize your work.
      </p>

      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Search tasks..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '42px', maxWidth: '400px' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass glass-card skeleton" style={{ height: '180px' }}></div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Calendar size={48} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '12px' }} />
          <h3 style={{ marginBottom: '8px' }}>No tasks found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Get started by creating a new task.</p>
          <button onClick={openNewTaskModal} className="btn btn-sm">
            <Plus size={16} /> Create Task
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredTasks.map(task => {
              const statusStyle = getStatusColor(task.status);
              return (
                <div key={task.id} className="glass glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', flex: 1, wordBreak: 'break-word' }}>{task.title}</h3>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEditTaskModal(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)', padding: '2px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {task.description || 'No description provided.'}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ 
                      backgroundColor: statusStyle.bg, 
                      color: statusStyle.text, 
                      padding: '3px 10px', 
                      borderRadius: '999px', 
                      fontSize: '11px', 
                      fontWeight: '600' 
                    }}>
                      {task.status.replace('_', ' ')}
                    </span>
                    
                    {task.dueDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        <Clock size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '28px' }}>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn btn-secondary btn-sm">Previous</button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>Page {page + 1} of {totalPages}</span>
              <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn btn-secondary btn-sm">Next</button>
            </div>
          )}
        </>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setCurrentTask(null); }} 
        onSave={handleSaveTask} 
        task={currentTask} 
      />

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onSave={handleSaveWorkspace}
        workspace={null}
      />
    </div>
  );
};

export default DashboardPage;
