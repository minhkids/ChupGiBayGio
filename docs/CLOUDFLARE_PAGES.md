# Cloudflare Pages Configuration
# Place this in your project root or configure via dashboard

# Build settings (auto-detected from package.json)
# Build command: npm run build
# Build output directory: dist
# Root directory: /

# Environment variables (set in Cloudflare Pages dashboard)
# Production:
# VITE_APP_TITLE=Chụp Gì Bây Giờ
# VITE_API_BASE_URL=https://api.chupgibaygio.com

# Preview (per-branch):
# VITE_API_BASE_URL=https://api-staging.chupgibaygio.com

# Headers (configured in _headers file in public/)
# See public/_headers for security headers

# Client-side routes (SPA): production uses the **Worker** in wrangler.toml with
# assets.not_found_handling = "single-page-application". Do not add public/_redirects;
# Cloudflare Workers static assets reject catch-all rules like /* → /index.html.

# Custom domain: chupgibaygio.com (configure in Pages dashboard after first deploy)
# www.chupgibaygio.com -> chupgibaygio.com (redirect)

# Functions (edge middleware) - optional
# Place in functions/ directory
# Example: functions/api/[[path]].ts for API routes on Pages