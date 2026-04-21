import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { analyzeResume } from '../api';
import toast from 'react-hot-toast';
import ScoreRing from '../components/ScoreRing';

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      toast.success('Resume uploaded! ✔️');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: (files) => {
      const err = files[0]?.errors[0];
      if (err?.code === 'file-too-large') toast.error('File must be under 5MB.');
      else toast.error('Only PDF files are accepted.');
    },
  });

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload your resume PDF.');
    if (jobDescription.trim().length < 50)
      return toast.error('Job description must be at least 50 characters.');

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription.trim());

      const res = await analyzeResume(formData);
      setResult(res.data);
      toast.success('Analysis complete! 🎉');
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      const msg = err.response?.data?.error || 'Analysis failed. Check your API key.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div className="hero-badge">✨ AI-Powered Analysis</div>
        <h1 className="hero-title" style={{ textAlign: 'left', fontSize: '2.25rem', marginBottom: '12px' }}>
          Analyze Your <span className="gradient-text">Resume</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '540px' }}>
          Upload your resume PDF and paste the job description. Our AI will score your match,
          identify missing keywords, and give you specific tips to get noticed.
        </p>
      </div>

      {/* Input Grid */}
      <div className="analyzer-grid">
        {/* PDF Upload */}
        <div>
          <div className="form-label" style={{ marginBottom: '10px', fontSize: '0.875rem', fontWeight: '600' }}>
            📄 Resume PDF <span style={{ color: 'var(--text-muted)' }}>(max 5MB)</span>
          </div>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            id="resume-dropzone"
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="file-info">
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>
                    {(file.size / 1024).toFixed(0)} KB — Click to replace
                  </div>
                </div>
              </div>
            ) : (
              <>
                <span className="dropzone-icon">📂</span>
                <div className="dropzone-text">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop your PDF'}
                </div>
                <div className="dropzone-hint">or click to browse files</div>
              </>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <div className="form-label" style={{ marginBottom: '10px', fontSize: '0.875rem', fontWeight: '600' }}>
            💼 Job Description
          </div>
          <textarea
            id="job-description"
            className="form-input"
            placeholder="Paste the full job description here (requirements, responsibilities, about the role)..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            style={{ height: '185px' }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {jobDescription.length} characters {jobDescription.length < 50 && jobDescription.length > 0 && '(need 50+)'}
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
        <button
          id="analyze-btn"
          onClick={handleAnalyze}
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ minWidth: '240px' }}
        >
          {loading ? (
            <><div className="spinner" /> Analyzing with AI...</>
          ) : (
            '⚡ Analyze Resume'
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-big-spinner" />
          <p className="loading-text">Claude AI is reading your resume...</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>This usually takes 10–20 seconds</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="results-container" id="results-section">
          <div className="divider" />

          {/* Score Card */}
          <div className="score-card" style={{ marginBottom: '24px' }}>
            <div className="score-label">Your Match Score</div>
            <ScoreRing score={result.matchScore} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              {result.matchScore >= 70
                ? '🌟 Great match! A few tweaks and you\'re golden.'
                : result.matchScore >= 40
                ? '📈 Decent start — there\'s room to improve.'
                : '🔧 Significant gaps found. Check the tips below.'}
            </div>
            <div className="score-job-info">
              {result.jobTitle && result.jobTitle !== 'Not specified' && (
                <span className="score-job-badge">💼 {result.jobTitle}</span>
              )}
              {result.company && result.company !== 'Not specified' && (
                <span className="score-job-badge">🏢 {result.company}</span>
              )}
            </div>
          </div>

          {/* Keywords + Strengths */}
          <div className="results-grid">
            {/* Missing Keywords */}
            <div className="card">
              <div className="section-title">
                <span className="icon">❌</span> Missing Keywords
                <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>
                  {result.missingKeywords?.length}
                </span>
              </div>
              <div className="keyword-list">
                {result.missingKeywords?.map((kw, i) => (
                  <span key={i} className="keyword-tag keyword-missing">{kw}</span>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="card">
              <div className="section-title">
                <span className="icon">✅</span> Your Strengths
                <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>
                  {result.strengths?.length}
                </span>
              </div>
              <div className="keyword-list">
                {result.strengths?.map((s, i) => (
                  <span key={i} className="keyword-tag keyword-strength">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Improvement Tips */}
          <div className="card">
            <div className="section-title">
              <span className="icon">💡</span> Improvement Tips
            </div>
            <div className="tips-list">
              {result.improvementTips?.map((tip, i) => (
                <div key={i} className="tip-item">
                  <div className="tip-number">{i + 1}</div>
                  <div>{tip}</div>
                </div>
              ))}
            </div>
          </div>

          {/* New Analysis CTA */}
          <div style={{ textAlign: 'center', marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => { setResult(null); setFile(null); setJobDescription(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="btn btn-secondary"
            >
              🔄 Analyze Another
            </button>
            <a href="/history" className="btn btn-primary">📋 View History</a>
          </div>
        </div>
      )}
    </div>
  );
}
