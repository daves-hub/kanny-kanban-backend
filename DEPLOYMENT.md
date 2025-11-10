# Deployment Checklist

Checklist for deploying the Kanny Kanban Backend to production.

## Pre-Deployment

### Environment Setup
- [ ] Update `.env` with production values:
  - [ ] Set `NODE_ENV=production`
  - [ ] Generate strong `JWT_SECRET` (use: `openssl rand -base64 128 | tr -d '\n'`)
  - [ ] Set production `DATABASE_URL`
  - [ ] Update `FRONTEND_URL` to production domain
  - [ ] Set appropriate `PORT` (default: 5000)

### Database
- [ ] Create production PostgreSQL database
- [ ] Run migrations: `pnpm prisma:migrate deploy`
- [ ] Verify database connection
- [ ] Set up database backups
- [ ] Configure connection pooling

### Code Quality
- [ ] Run `pnpm build` successfully
- [ ] Run `pnpm test` - all tests pass
- [ ] Fix any linter warnings (optional)
- [ ] Review error logs
- [ ] Code review completed

### Security
- [ ] Strong JWT secret configured
- [ ] Database credentials secured
- [ ] CORS origins restricted
- [ ] Rate limiting implemented (recommended)
- [ ] HTTPS enabled
- [ ] Security headers configured (Helmet.js recommended)

## Deployment

#### Render.com
1. Connect repository
2. Create PostgreSQL database
3. Create Web Service
4. Set build command: `pnpm install && pnpm build && pnpm prisma:generate`
5. Set start command: `pnpm start`
6. Configure environment variables

## Post-Deployment

### Verification
- [ ] Health check responds: `curl https://api.yourdomain.com/health`
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] Can create project/board/task
- [ ] CORS works with frontend
- [ ] Database persists data
- [ ] Error logging works

### Monitoring Setup
- [ ] Set up application monitoring (PM2, CloudWatch, etc.)
- [ ] Configure error tracking (Sentry, Rollbar, etc.)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Configure log aggregation
- [ ] Set up alerts for errors

### Documentation
- [ ] Document deployment process
- [ ] Update API documentation with production URL
- [ ] Share credentials securely with team
- [ ] Document rollback procedure

### Performance
- [ ] Database query optimization
- [ ] Enable connection pooling
- [ ] Configure caching (Redis recommended)
- [ ] CDN for static assets (if any)
- [ ] Database indexes verified

### Security Checklist
- [ ] No secrets in code/git
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Security headers added
- [ ] Dependencies updated
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention
- [ ] CSRF protection (if using cookies)

## Database Commands
```bash
# Connect to production database
psql $DATABASE_URL

# Run migrations
pnpm exec prisma migrate deploy

# Check migration status
pnpm exec prisma migrate status

# Open Prisma Studio (use SSH tunnel)
pnpm prisma:studio
```

## Production Environment Variables

Required:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.com
```

## Support & Troubleshooting

### Common Issues

**502 Bad Gateway**
- Check if application is running
- Verify port configuration
- Check nginx/proxy settings

**Database Connection Errors**
- Verify DATABASE_URL
- Check firewall rules
- Verify database is running

**High Memory Usage**
- Check for connection leaks
- Verify Prisma client is singleton
- Monitor query performance

**Slow Responses**
- Enable database query logging
- Check for N+1 queries
- Add appropriate indexes

## Final Checklist

- [ ] All tests passing
- [ ] Build successful
- [ ] Production environment configured
- [ ] Database migrated
- [ ] Application deployed
- [ ] HTTPS enabled
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Documentation updated
- [ ] Team notified
- [ ] Frontend connected and tested
