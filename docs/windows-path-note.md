# Windows Path Note

Use a simple folder name for local development on Windows, for example:

`C:\Users\caner\Randevo`

Avoid special characters in the full path (for example `&` and decorative dashes), because some CLI tools can misparse command arguments.

Prefer npm scripts for Prisma checks:

```powershell
npm run prisma:validate
npm run prisma:generate
```

If path parsing still breaks direct Prisma CLI calls in this workspace, use the equivalent Node entrypoints:

```powershell
node .\node_modules\prisma\build\index.js validate
node .\node_modules\prisma\build\index.js generate
```
