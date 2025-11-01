# Contributing to Wallet Buddhi

Thank you for your interest in contributing to Wallet Buddhi! We welcome contributions from the community.

## 📋 Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/wallet-buddhi.git
   cd wallet-buddhi
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/add-wallet-adapter`)
- `fix/` - Bug fixes (e.g., `fix/transaction-display`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/storage-interface`)
- `test/` - Adding tests (e.g., `test/classifier-unit-tests`)

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(classifier): add advanced spam detection rules
fix(websocket): resolve connection timeout issue
docs(readme): update installation instructions
refactor(storage): simplify interface methods
```

### Code Style

- **TypeScript**: Use strict type checking
- **Formatting**: Run `npm run format` before committing (if configured)
- **Linting**: Ensure `npm run lint` passes (if configured)
- **Imports**: Use absolute imports with `@/` prefix for client code

### Testing

- Test your changes locally before submitting
- Add tests for new features when applicable
- Ensure existing tests pass

## 📤 Submitting Changes

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changed and why
   - Include screenshots for UI changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex code sections
- [ ] Updated documentation if needed
- [ ] No new warnings generated
- [ ] Added tests for new features
```

## 🐛 Reporting Bugs

### Before Submitting
- Check if the bug has already been reported
- Collect information about the bug
- Try to reproduce it consistently

### Bug Report Template
```markdown
**Describe the bug**
Clear description of what the bug is

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox]
- Version: [e.g., 1.0.0]
```

## 💡 Feature Requests

We love new ideas! Please provide:
- Clear description of the feature
- Use cases and examples
- Why it would benefit users
- Any implementation suggestions

## 🔍 Review Process

1. **Automated checks** - CI/CD will run tests
2. **Code review** - Maintainers will review your code
3. **Feedback** - Address any requested changes
4. **Merge** - Once approved, we'll merge your PR!

## 📚 Development Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Solana Documentation](https://docs.solana.com)
- [Shadcn UI Components](https://ui.shadcn.com)

## ❓ Questions?

Feel free to:
- Open a discussion on GitHub
- Join our Discord community
- Email us at dev@walletbuddhi.com

Thank you for contributing! 🙏
