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
 * @returns {Promise<{ files: string[], projectName: string }>}
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
 * Triggers a ZIP download of the generated project folder.
 * @param {string} projectName - The project name returned by buildProject.
 */
export async function downloadProjectZip(projectName) {
  const res = await fetch(`${API_BASE}/download/${encodeURIComponent(projectName)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Download failed');
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
