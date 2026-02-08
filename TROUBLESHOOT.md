# Database Test & Troubleshooting

## Step 1: Test Database Connection

Visit: http://localhost:3000/api/health

Should return:

```json
{
  "status": "ok",
  "service": "authly-auth-server",
  "database": "connected"
}
```

## Step 2: Check if you're logged in

Visit: http://localhost:3001/api/developer

Should return your developer info.

## Step 3: Test Projects API Directly

Visit: http://localhost:3000/api/projects

This should show your projects (or empty array if none).

## Step 4: Check Browser Console

Open browser console (F12) and look for any API errors when visiting:
http://localhost:3001/dashboard/projects

## Common Issues:

### Issue 1: Database not migrated

```bash
cd apps/auth-server
npm run db:push
```

### Issue 2: Old dummy data in database

Clear the projects table:

```sql
DELETE FROM project_keys;
DELETE FROM project_auth_settings;
DELETE FROM projects;
```

### Issue 3: Cookie/Auth issues

Clear cookies and login again.
