import { useState } from 'react';
import { generateSchema, buildProject, downloadProjectZip } from '../services/api';
import CrudPreview from './ui/CrudPreview';

const EXAMPLES = [
  { icon: '📝', text: 'Build a blog app with User and Post models' },
  { icon: '✅', text: 'Create a task manager with Users, Projects, and Tasks' },
  { icon: '🛒', text: 'Make an e-commerce API with Products, Orders, and Customers' },
];

export default function PromptEngine() {
  const [prompt, setPrompt] = useState('');
  const [schema, setSchema] = useState(null);
  const [generatedFiles, setGeneratedFiles] = useState(null);
  const [fileContents, setFileContents] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [step, setStep] = useState('prompt');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  /* ===== PRESERVED HANDLERS ===== */
  const handleGenerateSchema = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError('');
    try {
      const result = await generateSchema(prompt);
      setSchema(result);
      setStep('preview');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleBuildAPI = async () => {
    setLoading(true); setError('');
    try {
      const data = await buildProject(schema);
      setGeneratedFiles(data.files);
      setFileContents(data.fileContents || null);
      setProjectName(data.projectName || schema.projectName);
      setStep('done');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try { await downloadProjectZip(projectName, fileContents); showToast('✅ ZIP downloaded!'); }
    catch (err) { setError(err.message); }
    finally { setDownloading(false); }
  };

  const handleReset = () => {
    setPrompt(''); setSchema(null); setGeneratedFiles(null); setFileContents(null);
    setProjectName(''); setStep('prompt'); setError('');
  };
  /* ===== END HANDLERS ===== */

  const spinner = { width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' };
  const stepIdx = ['prompt', 'preview', 'done'].indexOf(step);
  const steps = ['Describe', 'Preview', 'Build'];

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Toast */}
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, padding: '10px 20px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: 13, fontWeight: 600, zIndex: 9999 }} className="fade-in">{toast}</div>}

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Step Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 36 }}>
        {steps.map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= stepIdx ? 'var(--accent)' : 'var(--bg-elevated)', color: i <= stepIdx ? '#fff' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all .3s' }}>{i + 1}</div>
            <span style={{ color: i <= stepIdx ? 'var(--text-1)' : 'var(--text-3)', fontSize: 13, fontWeight: 500 }}>{label}</span>
            {i < 2 && <div style={{ width: 32, height: 2, borderRadius: 1, background: i < stepIdx ? 'var(--accent)' : 'var(--border)', transition: 'all .3s' }} />}
          </div>
        ))}
      </div>

      {/* ========== STEP 1 ========== */}
      {step === 'prompt' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>What API do you want to build?</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 15, marginTop: 8 }}>Describe it in plain English. Our AI handles the rest.</p>
          </div>

          {/* Prompt Area */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
            <textarea
              id="prompt-input"
              value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Build a blog platform with User authentication and Post management..."
              rows={4}
              style={{ width: '100%', padding: 14, borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-1)', fontSize: 15, fontFamily: 'var(--font-sans)', resize: 'vertical', outline: 'none', transition: 'border .2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            <button id="generate-schema-btn" onClick={handleGenerateSchema} disabled={loading || !prompt.trim()}
              style={{ marginTop: 14, width: '100%', padding: '13px', borderRadius: 10, background: loading || !prompt.trim() ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--accent), #9b6dff)', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s' }}>
              {loading ? <><span style={spinner} /> Analyzing prompt...</> : <>🧠 Generate Schema</>}
            </button>
          </div>

          {/* Examples */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
            {EXAMPLES.map(ex => (
              <button key={ex.text} onClick={() => setPrompt(ex.text)} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'all .15s', lineHeight: 1.4 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
                <span style={{ fontSize: 18, display: 'block', marginBottom: 6 }}>{ex.icon}</span>
                {ex.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========== STEP 2 ========== */}
      {step === 'preview' && schema && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Schema Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>📋 Schema Preview</h2>
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(schema, null, 2)); showToast('📋 Copied!'); }}
              style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)', color: 'var(--accent-light)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Copy JSON</button>
          </div>

          {/* JSON */}
          <pre style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 18, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.7, color: 'var(--accent-light)', border: '1px solid var(--border)', maxHeight: 320, overflowY: 'auto' }}>
            {JSON.stringify(schema, null, 2)}
          </pre>

          {/* Model Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {schema.models?.map(m => {
              const fieldList = Array.isArray(m.fields) ? m.fields : Object.entries(m.fields).map(([k, v]) => ({ name: k, type: v, required: true }));
              return (
                <div key={m.name} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 14, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-light)', marginBottom: 8, fontSize: 14 }}>📦 {m.name}</div>
                  {fieldList.map(f => (
                    <div key={f.name} style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>{f.name} {f.required === false && <span style={{ color: 'var(--text-3)', fontSize: 10 }}>(opt)</span>}</span>
                      <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{f.type}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep('prompt')} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-2)', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>← Edit Prompt</button>
            <button id="build-api-btn" onClick={handleBuildAPI} disabled={loading}
              style={{ flex: 2, padding: 12, borderRadius: 10, background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--green), var(--green-dim))', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><span style={spinner} /> Building...</> : <>🚀 Build API Now</>}
            </button>
          </div>
        </div>
      )}

      {/* ========== STEP 3 ========== */}
      {step === 'done' && generatedFiles && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Success Header */}
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontSize: 26, fontWeight: 800 }}>API Generated!</h2>
            <p style={{ color: 'var(--text-2)', marginTop: 6 }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>{generatedFiles.length} files</span> created for <span style={{ color: 'var(--accent-light)', fontWeight: 700 }}>{projectName}</span>
            </p>
          </div>

          {/* Feature Tags */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'JWT Active', icon: '🔐', color: 'var(--green)' },
              { label: 'RBAC Enabled', icon: '🛡️', color: 'var(--accent-light)' },
              { label: 'Bcrypt Hashing', icon: '🔒', color: 'var(--amber)' },
              { label: 'CORS + Helmet', icon: '🌐', color: '#38bdf8' },
            ].map(tag => (
              <span key={tag.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}30`,
              }}>{tag.icon} {tag.label}</span>
            ))}
          </div>

          {/* File List */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>Generated Files</div>
            {generatedFiles.map(file => (
              <div key={file} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--green)', fontSize: 14 }}>✓</span>
                <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-light)', fontSize: 13 }}>{file}</code>
              </div>
            ))}
          </div>

          {/* Download */}
          <button id="download-zip-btn" onClick={handleDownload} disabled={downloading}
            style={{ width: '100%', padding: 14, borderRadius: 12, background: downloading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--green), var(--green-dim))', color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {downloading ? <><span style={spinner} /> Preparing...</> : <>⬇️ Download ZIP</>}
          </button>

          {/* CRUD Preview */}
          {schema && <CrudPreview schema={schema} />}

          {/* Reset */}
          <button onClick={handleReset} style={{ width: '100%', padding: 12, borderRadius: 10, background: 'rgba(124,92,252,0.08)', border: '1px solid rgba(124,92,252,0.15)', color: 'var(--accent-light)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            ✨ Generate Another API
          </button>
        </div>
      )}
    </div>
  );
}
