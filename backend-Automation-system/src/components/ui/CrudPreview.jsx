import { useState } from 'react';

export default function CrudPreview({ schema }) {
  const [activeModel, setActiveModel] = useState(0);
  if (!schema?.models?.length) return null;

  const model = schema.models[activeModel];
  const basePath = `/api/${model.name.toLowerCase()}s`;
  const fields = Array.isArray(model.fields)
    ? model.fields : Object.entries(model.fields).map(([n, t]) => ({ name: n, type: t }));

  const sampleBody = {};
  fields.forEach(f => {
    if (f.type === 'Number') sampleBody[f.name] = 42;
    else if (f.type === 'Boolean') sampleBody[f.name] = true;
    else if (f.type === 'Date') sampleBody[f.name] = '2026-01-01';
    else sampleBody[f.name] = `sample_${f.name}`;
  });

  const endpoints = [
    { method: 'GET', path: basePath, desc: 'Fetch all', color: '#10b981' },
    { method: 'GET', path: `${basePath}/:id`, desc: 'Fetch by ID', color: '#10b981' },
    { method: 'POST', path: basePath, desc: 'Create new', color: '#f59e0b', body: sampleBody },
  ];

  const s = {
    card: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' },
    tab: (active) => ({
      padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 8,
      background: active ? 'rgba(124,92,252,0.15)' : 'transparent',
      color: active ? 'var(--accent-light)' : 'var(--text-3)',
      border: 'none', transition: 'all .15s',
    }),
    method: (color) => ({
      padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700,
      background: `${color}20`, color, letterSpacing: '0.03em',
    }),
    codebox: {
      background: 'var(--bg-input)', padding: 14, borderRadius: 8, margin: '8px 0',
      fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-light)',
      lineHeight: 1.6, overflowX: 'auto', border: '1px solid var(--border)',
    },
  };

  return (
    <div style={s.card}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>🧪 API Testing Playground</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {schema.models.map((m, i) => (
            <button key={m.name} style={s.tab(i === activeModel)} onClick={() => setActiveModel(i)}>{m.name}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {endpoints.map((ep, i) => (
          <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={s.method(ep.color)}>{ep.method}</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-1)' }}>{ep.path}</code>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>{ep.desc}</span>
            </div>
            {ep.body && (
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Request Body:</span>
                <pre style={s.codebox}>{JSON.stringify(ep.body, null, 2)}</pre>
              </div>
            )}
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Header:</span>
              <pre style={s.codebox}>Authorization: Bearer {'<'}your_jwt_token{'>'}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
