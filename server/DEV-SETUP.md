# 🚀 Development Server Setup

## Quick Start

### Method 1: Using npm scripts (Recommended)
```bash
npm run dev
```

### Method 2: Using development scripts
```bash
# Linux/Mac
./dev-server.sh

# Windows
dev-server.bat
```

### Method 3: Using VS Code
- Press `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Dev Server"
- Or use `Ctrl+Shift+B` to build

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run dev:debug` | Start with Node.js debugger enabled |
| `npm run start` | Run production build |
| `npm run start:ts` | Run TypeScript directly (no compilation) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run build:watch` | Compile with watch mode |
| `npm run clean` | Remove build artifacts |
| `npm run type-check` | Check TypeScript types without compilation |

## 🔧 Development Features

### Hot Reload Configuration
- **Watch**: `src/` directory for `.ts`, `.js`, `.json` files
- **Ignore**: Test files, node_modules, dist, logs
- **Delay**: 1 second before restart
- **Executor**: `tsx` for fast TypeScript execution

### Environment Variables
- `NODE_ENV=development` automatically set in dev mode
- Load `.env` files with dotenv

### Debugging Support
- **VS Code**: Use F5 or "Debug Express Server" configuration
- **Chrome DevTools**: Available with `npm run dev:debug`
- **Source Maps**: Enabled for better debugging experience

## 🛠️ File Structure

```
server/
├── src/                    # Source code
├── dist/                   # Compiled JavaScript (auto-generated)
├── logs/                   # Application logs (auto-generated)
├── .vscode/               # VS Code configuration
│   ├── tasks.json         # Build tasks
│   └── launch.json        # Debug configurations
├── nodemon.json           # Nodemon configuration
├── dev-server.sh          # Linux/Mac development script
├── dev-server.bat         # Windows development script
└── package.json           # Dependencies and scripts
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port 3001
   lsof -i :3001
   # Kill the process
   kill -9 <PID>
   ```

2. **TypeScript compilation errors**
   ```bash
   # Check types without running
   npm run type-check
   ```

3. **Module resolution issues**
   - Ensure all imports use `.js` extension
   - Check `tsconfig.json` module settings

### Performance Tips

- **Large Projects**: Increase nodemon delay in `nodemon.json`
- **Memory Issues**: Use `--max-old-space-size=4096` in scripts
- **Slow Restarts**: Check ignore patterns in `nodemon.json`

## 🔍 Monitoring

### Development Logs
- Console output shows file changes and restart events
- Error logs are displayed with stack traces
- Server startup confirmation with port information

### VS Code Integration
- Problem matcher detects TypeScript errors
- Background task runs automatically
- Integrated terminal for output

## 🎯 Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

Remember to set `NODE_ENV=production` in your production environment!
