import { useState } from 'react';

export default function Sidebar({ history, onSelect, onNew }) {
  const [collapsed, setCollapsed] = useState(false);

  const s = {
    root: {
      width: collapsed ? 60 : 260, minHeight: '100vh',
      background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', transition: 'width .25s ease',
      flexShrink: 0, overflow: 'hidden',
    },
    header: {
      padding: collapsed ? '20px 12px' : '20px 16px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
    },
    logo: {
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: 'linear-gradient(135deg, var(--accent), #c084fc)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, cursor: 'pointer',
    },
    newBtn: {
      width: '100%', padding: '10px 14px', margin: collapsed ? '12px 8px' : '12px 16px',
      borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      color: 'var(--text-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s',
    },
    item: (active) => ({
      padding: '10px 14px', margin: '2px 8px', borderRadius: 8,
      background: active ? 'rgba(124,92,252,0.1)' : 'transparent',
      color: active ? 'var(--accent-light)' : 'var(--text-2)',
      fontSize: 13, cursor: 'pointer', transition: 'all .15s',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }),
    section: { padding: '12px 16px 6px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  };

  return (
    <aside style={s.root}>
      <div style={s.header}>
        <div style={s.logo} onClick={() => setCollapsed(!collapsed)}>⚡</div>
        {!collapsed && <span style={{ fontWeight: 800, fontSize: 18 }}>Auto<span style={{ color: 'var(--accent-light)' }}>Mind</span></span>}
      </div>

      <button style={s.newBtn} onClick={onNew}>
        <span style={{ fontSize: 16 }}>＋</span>
        {!collapsed && 'New Generation'}
      </button>

      {!collapsed && (
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
          {history.length > 0 && <div style={s.section}>History</div>}
          {history.map((item, i) => (
            <div key={i} style={s.item(false)} onClick={() => onSelect(item)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              📦 {item.projectName || item.prompt?.substring(0, 30)}
            </div>
          ))}
          {history.length === 0 && (
            <div style={{ padding: '20px 16px', color: 'var(--text-3)', fontSize: 13, textAlign: 'center' }}>
              No generations yet.<br />Start by describing your API.
            </div>
          )}
        </div>
      )}

      <div style={{ padding: 16, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>
        {!collapsed && '🔒 All data stays local'}
      </div>
    </aside>
  );
}
