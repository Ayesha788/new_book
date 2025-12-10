# MCP Server Setup: Context7 and GitHub Integration

## Overview
This document details the setup process for two MCP (Model Context Protocol) servers:
1. Context7 - AI-powered context management service
2. GitHub - GitHub Copilot integration

## Prerequisites
- Claude Code CLI installed and configured
- Windows operating system (commands specific to Windows)
- Administrative privileges for installing software

## Step 1: Context7 MCP Server Setup

### Configuration Details
- Name: `context7`
- Transport: HTTP
- Endpoint: `https://mcp.context7.com/mcp`
- Authorization: Bearer token authentication
- API Key: `ctx7sk-534317dd-0c9b-4887-bbd2-4c3eef30a56e`

### Setup Command
```bash
claude mcp add context7 https://mcp.context7.com/mcp --transport http --header "Authorization: Bearer ctx7sk-534317dd-0c9b-4887-bbd2-4c3eef30a56e"
```

## Step 2: GitHub MCP Server Setup

### Prerequisites
- GitHub CLI installed
- GitHub Personal Access Token with appropriate permissions

### Installing GitHub CLI on Windows
```cmd
winget install GitHub.cli
```

### Creating a GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Select the scopes your token needs (typically `repo`, `read:org`, `gist` for basic functionality)
4. Copy the generated token

### Setting up Environment Variable
On Windows:
```cmd
setx GITHUB_TOKEN "your_token_here"
```

### GitHub MCP Server Configuration
- Name: `github`
- Transport: stdio
- Command: `gh mcp stdio`
- Environment Variable: `GITHUB_TOKEN`

### Setup Command
```bash
claude mcp add github --transport stdio --env GITHUB_TOKEN="${GITHUB_TOKEN}" -- gh mcp stdio
```

## Step 3: Verification

### Testing Connections
Run the following command to verify both servers are properly configured:

```bash
claude mcp list
```

Expected output:
```
Checking MCP server health...

context7: https://mcp.context7.com/mcp (HTTP) - ✓ Connected
github: gh mcp stdio - ✓ Connected
```

### Troubleshooting

#### GitHub Connection Issues
If GitHub shows "✗ Failed to connect":
1. Verify GitHub CLI is installed: `gh --version`
2. Ensure GITHUB_TOKEN environment variable is set
3. Verify the token has appropriate permissions
4. Restart your terminal after setting environment variables

#### Context7 Connection Issues
If Context7 shows "✗ Failed to connect":
1. Verify the API key is correct
2. Check network connectivity to `https://mcp.context7.com/mcp`
3. Ensure the API key has not expired

## Configuration Files
The MCP server configurations are stored in:
- User-level: `C:\Users\[username]\.claude.json`
- Project-level: `C:\Users\[username]\Desktop\my_book\.claude\settings.local.json`

## Security Considerations
- Store API keys securely and never commit them to version control
- Use environment variables for sensitive tokens
- Regularly rotate API keys for security
- Limit GitHub token permissions to minimum required scopes

## Additional Resources
- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Context7 API Documentation](https://context7.com/docs)