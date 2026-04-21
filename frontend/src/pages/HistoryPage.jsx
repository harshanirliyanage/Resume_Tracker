import { useEffect, useState } from 'react';
import { getHistory, deleteAnalysis } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await getHistory();
      setAnalyses(res.data.analyses);
    } catch {
      toast.error('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this analysis?')) return;
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Analysis deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.matchScore, 0) / analyses.length)
    : 0;

  const bestScore = analyses.length ? Math.max(...analyses.map((a) => a.matchScore)) : 0;

  const chartData = [...analyses].reverse().map((a, i) => ({
    name: `#${i + 1}`,
    score: a.matchScore,
    label: a.jobTitle || 'Unknown',
  }));

  const selected = analyses.find((a) => a.id === selectedId);

  return (
    <div className="page-wrapper" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
      {/* Header */}
      <div className="history-header">
        <div>
          <h1 className="page-title">📋 Analysis History</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>! Track your progress below.
          </p>
        </div>
        <button onClick={() => navigate('/analyze')} className="btn btn-primary">
          ✨ New Analysis
        </button>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <div className="loading-big-spinner" />
          <p className="loading-text">Loading your history...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">No analyses yet</div>
          <div className="empty-state-text">
            Upload your resume and paste a job description to get started.
          </div>
          <button onClick={() => navigate('/analyze')} className="btn btn-primary btn-lg">
            ⚡ Analyze My First Resume
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{analyses.length}</div>
              <div className="stat-label">Total Analyses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avgScore}%</div>
              <div className="stat-label">Average Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{bestScore}%</div>
              <div className="stat-label">Best Score</div>
            </div>
          </div>

          {/* Progress Chart */}
          {chartData.length > 1 && (
            <div className="chart-card">
              <div className="section-title" style={{ marginBottom: '20px' }}>
                📈 Score Progress Over Time
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#0d1421',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                    formatter={(v, n, p) => [`${v}%`, p.payload.label]}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#scoreGrad)"
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* History List */}
          <div className="history-grid">
            {analyses.map((analysis) => {
              const sc = getScoreClass(analysis.matchScore);
              return (
                <div
                  key={analysis.id}
                  className="history-card"
                  onClick={() => setSelectedId(selectedId === analysis.id ? null : analysis.id)}
                  id={`history-card-${analysis.id}`}
                >
                  <div className={`history-score-circle circle-${sc}`}>
                    {analysis.matchScore}%
                  </div>
                  <div className="history-info">
                    <div className="history-job-title">
                      {analysis.jobTitle || 'Unknown Role'}
                      {analysis.company && analysis.company !== 'Not specified'
                        ? ` — ${analysis.company}` : ''}
                    </div>
                    <div className="history-meta">
                      <span>📄 {analysis.resumeFilename}</span>
                      <span>🕐 {formatDate(analysis.createdAt)}</span>
                      <span>🔑 {analysis.missingKeywords?.length || 0} missing keywords</span>
                    </div>
                  </div>
                  <div className="history-actions">
                    <button
                      onClick={(e) => handleDelete(e, analysis.id)}
                      className="btn btn-danger btn-sm"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Detail Panel */}
          {selected && (
            <div
              className="card"
              style={{
                marginTop: '24px',
                borderColor: 'rgba(99,102,241,0.3)',
                background: 'rgba(99,102,241,0.04)',
                animation: 'slideUp 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {selected.jobTitle} {selected.company !== 'Not specified' ? `— ${selected.company}` : ''}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Analyzed on {formatDate(selected.createdAt)}
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="modal-close">✕</button>
              </div>

              <div className="results-grid">
                <div>
                  <div className="section-title"><span>❌</span> Missing Keywords</div>
                  <div className="keyword-list">
                    {selected.missingKeywords?.map((kw, i) => (
                      <span key={i} className="keyword-tag keyword-missing">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="section-title"><span>✅</span> Strengths</div>
                  <div className="keyword-list">
                    {selected.improvementTips?.strengths?.map((s, i) => (
                      <span key={i} className="keyword-tag keyword-strength">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div className="section-title"><span>💡</span> Improvement Tips</div>
                <div className="tips-list">
                  {selected.improvementTips?.tips?.map((tip, i) => (
                    <div key={i} className="tip-item">
                      <div className="tip-number">{i + 1}</div>
                      <div>{tip}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
