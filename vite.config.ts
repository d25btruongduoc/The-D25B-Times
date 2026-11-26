import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function readRecentGitCommits() {
  try {
    if (!fs.existsSync(path.resolve(__dirname, '.git'))) return [];
    const raw = execSync(
      'git log -n 10 --pretty=format:%H%x1f%cI%x1f%s%x1f%b%x1f%an%x1e',
      {cwd: __dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}
    );
    return raw
      .split('\x1e')
      .map((rec) => rec.trim())
      .filter(Boolean)
      .map((rec) => {
        const [sha = '', date = '', subject = '', body = '', author = ''] = rec.split('\x1f');
        return {
          sha: sha.trim(),
          date: date.trim(),
          subject: subject.trim(),
          body: body.trim(),
          author: author.trim(),
        };
      })
      .filter((c) => c.sha && c.subject && c.date);
  } catch {
    return [];
  }
}

export default defineConfig(({command}) => {
  const buildGitCommits = readRecentGitCommits();
  return {
    base: process.env.VITE_BASE_PATH || (command === 'build' ? './' : '/'),
    define: {
      __BUILD_GIT_COMMITS__: JSON.stringify(buildGitCommits),
    },
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
