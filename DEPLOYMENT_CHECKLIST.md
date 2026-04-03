# AIRA Labs Production Checklist

## 1. Environment and Secrets
- Set `NODE_ENV=production`.
- Set `DATABASE_URL` to production Neon/PostgreSQL endpoint.
- Set a strong random `NEXTAUTH_SECRET` (at least 32+ chars).
- Set `NEXTAUTH_URL` to your production domain (e.g. `https://airalabs.example.com`).
- Rotate default admin credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and avoid weak defaults.
- Store secrets in hosting secret manager, not committed files.

## 2. Database Readiness (Prisma)
- Install dependencies: `npm install`.
- Validate schema: `npx prisma validate`.
- Generate client: `npx prisma generate`.
- Run migrations in production:
  - `npx prisma migrate deploy`
- Seed initial data (if needed):
  - `npm run prisma:seed`
  - or `node prisma/seed.js`
- Backup strategy:
  - Enable Neon branch backup/point-in-time restore.
  - Validate a restore drill once.

## 3. Auth Hardening
- Ensure admin-only API route guard is active (`requireAdmin` checks role).
- Disable emergency bypass login path in production if present.
- Enforce HTTPS only cookies and secure session settings.
- Add login rate limiting / brute-force protection at edge or reverse proxy.
- Add audit logs for critical admin actions (create/update/delete events, members, settings).

## 4. Image Storage Strategy
Current implementation writes files to local disk under `public/uploads/*`.

Production recommendation:
- Move image storage to object storage (Azure Blob, S3, Cloudinary, etc.).
- Serve via CDN URL for performance.
- Store only file URLs in DB.
- Add image validation:
  - MIME allow-list
  - max size limits
  - extension sanitization
- Add optional image optimization pipeline (thumbnail generation).

## 5. Build and Runtime Checks
- Run lint/type checks: `npm run lint`.
- Run production build: `npm run build`.
- Start production server locally for smoke test: `npm run start`.
- Test these flows:
  - public events showcase and event detail
  - join application submit
  - admin login
  - admin event create/edit/delete + image reorder
  - admin team profile CRUD
  - applications pipeline actions

## 6. API and Security Validation
- Confirm unauthorized requests return:
  - `401` when not logged in
  - `403` when not admin
- Verify all admin mutation routes are protected.
- Configure CORS only if required.
- Add request logging and error monitoring (Sentry/Application Insights).

## 7. Performance and UX
- Enable caching for public GET APIs where possible.
- Use optimized image loading and responsive images.
- Verify mobile responsiveness for all public and admin pages.
- Validate animation performance on low-end devices.

## 8. Deployment Execution
- Deploy app build to hosting (Vercel/Azure App Service/container).
- Apply environment variables in hosting config.
- Run database migration step during release pipeline.
- Run post-deploy smoke test checklist.

## 9. Post-Deployment Operations
- Set up uptime monitoring and alerts.
- Track API error rates and slow queries.
- Schedule dependency/security updates.
- Document rollback procedure (app + DB).
