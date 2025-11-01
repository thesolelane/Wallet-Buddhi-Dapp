# Git Commit Guidelines for Wallet Buddhi

## 🎯 Quick Reference

### Initial Setup
```bash
# Already done - repository is set up
git init
git add .
git commit -m "Initial commit"
```

### For Future Commits

**Good commit messages:**
```bash
git commit -m "feat(dashboard): add real-time transaction monitoring"
git commit -m "fix(classifier): resolve false positive spam detection"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(storage): migrate to PostgreSQL"
```

**Bad commit messages:**
```bash
git commit -m "updates"
git commit -m "fix"
git commit -m "changes"
git commit -m "wip"
```

## 📝 Conventional Commits Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `perf` - Performance improvement
- `test` - Adding tests
- `chore` - Maintenance, dependencies, config

### Scopes (optional but recommended)
- `dashboard` - Dashboard page
- `classifier` - Spam classifier
- `websocket` - Real-time monitoring
- `api` - API endpoints
- `ui` - UI components
- `storage` - Data storage
- `auth` - Authentication
- `bot` - Arbitrage bots
- `tier` - Tier system
- `payment` - Payment processing

## 🔄 Workflow

### 1. Before You Start
```bash
# Make sure you're on the main branch
git checkout main

# Pull latest changes
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Making Changes
```bash
# Check what changed
git status

# Review your changes
git diff

# Stage specific files
git add path/to/file

# Or stage all changes
git add .
```

### 3. Committing
```bash
# Commit with a good message
git commit -m "feat(dashboard): add transaction filtering"

# If you need a longer description
git commit -m "feat(dashboard): add transaction filtering" -m "Users can now filter transactions by status (Safe, Suspicious, Danger, Blocked). Added dropdown selector and updated UI state management."
```

### 4. Pushing
```bash
# Push to your branch
git push origin feature/your-feature-name

# Or set upstream and push
git push -u origin feature/your-feature-name
```

## 🌳 Branching Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Development branch (if using)

### Feature Branches
```bash
feature/add-wallet-adapter
feature/implement-deep3-api
fix/websocket-reconnect
docs/update-contributing-guide
```

### Branch Lifecycle
```bash
# Create branch
git checkout -b feature/my-feature

# Work on your feature
git add .
git commit -m "feat(scope): description"

# Keep your branch updated
git checkout main
git pull origin main
git checkout feature/my-feature
git merge main

# Push your branch
git push origin feature/my-feature

# After merge, delete branch
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

## ✅ Commit Checklist

Before committing, ensure:
- [ ] Code is tested locally
- [ ] No sensitive data (API keys, passwords) in code
- [ ] No `console.log` statements left behind (unless needed)
- [ ] Code follows project style guidelines
- [ ] Commit message is clear and descriptive
- [ ] Only related changes in one commit

## 🚫 What NOT to Commit

Never commit:
- `node_modules/`
- `.env` files
- Build artifacts (`dist/`, `build/`)
- IDE configuration (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Logs (`*.log`)
- Personal notes or TODO files

These are already in `.gitignore` ✅

## 📊 Example Workflow

```bash
# 1. Start new feature
git checkout main
git pull origin main
git checkout -b feature/nft-pass-verification

# 2. Make changes to files
# ... edit code ...

# 3. Stage and commit
git add .
git commit -m "feat(nft): add NFT pass ownership verification"

# 4. Continue working
# ... more edits ...
git add .
git commit -m "feat(nft): parse NFT metadata for benefits"

# 5. Push to remote
git push -u origin feature/nft-pass-verification

# 6. Create Pull Request on GitHub
# ... via GitHub UI ...

# 7. After merge, cleanup
git checkout main
git pull origin main
git branch -d feature/nft-pass-verification
```

## 🔧 Useful Git Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD

# View commit history
git log --oneline --graph

# View changes in a file
git diff path/to/file

# Stash changes temporarily
git stash
git stash pop

# Update commit message (before push)
git commit --amend -m "new message"

# View remote URLs
git remote -v
```

## 🏷️ Tagging Releases

```bash
# Create a tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag to remote
git push origin v1.0.0

# List all tags
git tag -l
```

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://github.com/git-guides)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**Remember:** Good commits make collaboration easier and help track project history! 🚀
