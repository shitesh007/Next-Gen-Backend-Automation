import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Streams a zipped version of the generated project folder to the response.
 * @param {string} projectName - The project name (used to locate the folder).
 * @param {import('express').Response} res - Express response object.
 */
export function streamProjectZip(projectName, res) {
  const folderName = `generated_${projectName.toLowerCase()}`;
  const folderPath = path.join(__dirname, '..', folderName);

  if (!fs.existsSync(folderPath)) {
    throw new Error(`Project folder "${folderName}" not found on server.`);
  }

  const archive = archiver('zip', { zlib: { level: 9 } });

  // Set response headers for ZIP download
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);

  archive.on('error', (err) => { throw err; });
  archive.pipe(res);
  archive.directory(folderPath, folderName);
  archive.finalize();
}
