# Context7 MCP Setup Guide

## Prerequisites

1. Context7 API account and access
2. Valid Context7 API key

## Adding the Context7 MCP Server

Add the server using the CLI command:

```bash
claude mcp add context7 https://mcp.context7.com/mcp --transport http --header "Authorization: Bearer ctx7sk-534317dd-0c9b-4887-bbd2-4c3eef30a56e"
```

Configuration details:
- Name: `context7`
- Transport: HTTP
- Endpoint: `https://mcp.context7.com/mcp`
- Authorization: Bearer token authentication
- API Key: `ctx7sk-534317dd-0c9b-4887-bbd2-4c3eef30a56e`

## Verification

After setting up the server, you can verify the configuration by running:

```bash
claude mcp list
```

This should show the Context7 MCP server as configured and connected.

## Troubleshooting

If you encounter issues:
1. Verify your Context7 API key is valid
2. Check that the endpoint URL is accessible
3. Ensure you have proper network connectivity to the Context7 service