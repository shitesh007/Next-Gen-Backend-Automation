// ============================================
// API Service — Works on both localhost & Vercel
// ============================================

const API_BASE = '/api';

/**
 * Sends a user prompt to the backend and returns a structured JSON schema.
 * @param {string} prompt - The user's English description.
 * @returns {Promise<object>} The generated schema.
 */
export async function generateSchema(prompt) {
  const res = await fetch(`${API_BASE}/generate-schema`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Schema generation failed');
  return data.schema;
}

/**
 * Sends a schema to the backend to generate the project files.
 * @param {object} schema - The validated JSON schema.
 * @returns {Promise<{ files: string[], projectName: string, fileContents?: object }>}
 */
export async function buildProject(schema) {
  const res = await fetch(`${API_BASE}/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schema }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Build failed');
  return data;
}

/**
 * Triggers a ZIP download of the generated project.
 * Works on both localhost (server-side ZIP) and Vercel (client-side ZIP).
 * @param {string} projectName - The project name returned by buildProject.
 * @param {object} [fileContents] - Optional file contents for client-side ZIP (Vercel mode).
 */
export async function downloadProjectZip(projectName, fileContents) {
  // If fileContents provided (Vercel mode), generate ZIP client-side
  if (fileContents && Object.keys(fileContents).length > 0) {
    await generateClientZip(projectName, fileContents);
    return;
  }

  // Otherwise, try server-side download (localhost mode)
  const res = await fetch(`${API_BASE}/download/${encodeURIComponent(projectName)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Download failed');
  }

  const contentType = res.headers.get('content-type') || '';

  // If server returned JSON instead of ZIP (Vercel fallback)
  if (contentType.includes('application/json')) {
    console.warn('Server returned JSON — client-side ZIP not available without fileContents.');
    throw new Error('Download not available. Please rebuild the project first.');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `generated_${projectName.toLowerCase()}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Generates a ZIP file client-side using JSZip (loaded from CDN).
 */
async function generateClientZip(projectName, fileContents) {
  // Dynamically load JSZip from CDN if not already loaded
  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const zip = new window.JSZip();
  const folder = zip.folder(`generated_${projectName.toLowerCase()}`);

  for (const [filePath, content] of Object.entries(fileContents)) {
    folder.file(filePath, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `generated_${projectName.toLowerCase()}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
