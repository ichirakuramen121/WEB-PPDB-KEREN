import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

try {
  const zip = new AdmZip();
  const distDir = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory does not exist! Please build first (npm run build).');
    process.exit(1);
  }

  // Only include index.html and assets folder for standard static hosting
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    zip.addLocalFolder(assetsDir, 'assets');
    console.log('Added assets folder to ZIP');
  }

  const indexFile = path.join(distDir, 'index.html');
  if (fs.existsSync(indexFile)) {
    zip.addLocalFile(indexFile);
    console.log('Added index.html to ZIP');
  }

  // Also include any logo, favicon, or main images residing at the root of /dist in the ZIP
  try {
    const rootFiles = fs.readdirSync(distDir);
    rootFiles.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      // Add root assets such as .png, .svg, .ico, .webp (excluding index.html, directory folders, etc)
      if (['.png', '.svg', '.ico', '.webp'].includes(ext)) {
        const filePath = path.join(distDir, file);
        if (fs.statSync(filePath).isFile()) {
          zip.addLocalFile(filePath);
          console.log(`Added root asset ${file} to ZIP`);
        }
      }
    });
  } catch (e) {
    console.error('Error adding root assets to ZIP:', e);
  }

  // Create and add .htaccess for React SPA Routing on Apache / cPanel
  const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`;
  
  const htaccessPath = path.join(distDir, '.htaccess');
  fs.writeFileSync(htaccessPath, htaccessContent);
  zip.addLocalFile(htaccessPath);
  console.log('Created and added .htaccess to ZIP for SPA routing');

  const zipPath = path.join(process.cwd(), 'website-siap-upload.zip');
  zip.writeZip(zipPath);
  console.log(`SUCCESS: Created compatible Windows ZIP with static files at ${zipPath}`);
} catch (error) {
  console.error('Failed to create ZIP:', error);
  process.exit(1);
}
