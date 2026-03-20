# effect-mcp-sample

A minimal example demonstrating an Effect.ts + Model Context Protocol (MCP) server with a greeting tool.

## Project purpose

- Show how to build an MCP tool with `@modelcontextprotocol/sdk`.
- Demonstrate Effect pattern using `@effect/io`, `Context.Tag`, and layered services.
- Include CLI start path with stdo transport handling.

## Structure

- `src/greeting.ts` - `GreetingService` effect service + live layer implementation.
- `src/index.ts` - MCP server creation + tool registration + CLI via `@effect/cli`.
- `test/greeting.test.ts` - unit tests for `GreetingService`.

## Requirements

- Node.js 20+ (or Bun runtime compatible)
- npm

## Install

```bash
npm install
```

## Run tests

```bash
npm test
```

## Run CLI

These commands are currently provided by `src/index.ts`.

### STDIO mode (default)

```bash
npm start
```

### HTTP mode (flags)

```bash
npm start -- --http --port 4000
```

> Note: `httpMain` currently contains TODO placeholders. Add HTTP transport support in `src/index.ts`.

## Tool schema: `greetUser`

- `title`: "Greet User"
- `description`: "Generates a personalized greeting message."
- `inputSchema`: `{ name: string }`
- returns: `CallToolResult` with `[{ type: 'text', text: 'Hello, ${name}!' }]`

## Development notes

- Add input validation for `name` (`non-empty`, `max length`).
- Add HTTP transport implementation and port fallback (`3000`).
- Add richer greeting formatting + i18n path.
- Add CLI `start`, `stop`, `config` options.
- Add lint + typecheck step to CI.

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Add tests for new behavior.
4. Open a pull request.
