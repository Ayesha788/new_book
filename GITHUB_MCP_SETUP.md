# GitHub MCP Setup Guide

## Prerequisites

1. GitHub CLI installed (run `winget install GitHub.cli` on Windows)
2. GitHub Personal Access Token with appropriate permissions

## Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Select the scopes your token needs (typically `repo`, `read:org`, `gist` for basic functionality)
4. Copy the generated token

## Setting up Environment Variable

Set the GitHub token as an environment variable:

On Windows:
```cmd
setx GITHUB_TOKEN "your_token_here"
```

Or add it to your system environment variables manually.

## Adding the GitHub MCP Server

After installing GitHub CLI and setting up the token, add the server using the CLI:

```bash
claude mcp add github --transport stdio --env GITHUB_TOKEN="${GITHUB_TOKEN}" -- gh mcp stdio
```

## Verification

After setting up the server, you can verify the configuration by running:

```bash
claude mcp list
```

This should show the GitHub MCP server as configured and connected.