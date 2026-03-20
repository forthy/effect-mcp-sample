import { Effect, Schema, Option, pipe } from "effect"
import { LazyArg } from "effect/Function"
import { Command, Options } from "@effect/cli"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { GreetingService } from "./greeting.js"
import { z } from "zod/v4"

const inputSchema = z.object({
  name: z.string().min(2).max(100).describe("The name of the user"),
})
type Input = z.infer<typeof inputSchema>

const serverOf: LazyArg<McpServer> = () => {
  const server = new McpServer({
    name: "effect-ts-demo-server",
    version: "1.0.0",
  })

  server.registerTool(
    "greetUser",
    {
      title: "Greet User",
      description: "Generates a personalized greeting message.",
      inputSchema,
    },
    async (input: Input): Promise<CallToolResult> => {
      const programme = Effect.gen(function* () {
        const greetingService = yield* GreetingService

        return yield* greetingService.greet(input.name)
      })

      return await Effect.runPromise(programme.pipe(Effect.provide(GreetingService.Live)))
    }
  )

  return server
}

const stdioMain = Effect.gen(function* () {
  yield* Effect.promise(() => serverOf().connect(new StdioServerTransport()))
})

const httpMain = Effect.gen(function* () {
  // INFO
  yield* Effect.log("Starting Effect MCP server with HTTP transport...")

  // TODO
  // Implement an HTTP transport for the MCP server and connect it here

  // INFO
  yield* Effect.log("MCP server connected via HTTP.")
})

// TODO
// Make a CLI with @effect/cli to start the server and add options for configuration
// BunRuntime.runMain(main.pipe(Effect.provide(BunContext.layer)))

// ---
// Command-line
// ---
const httpOption = Options.boolean("http").pipe(
  Options.withAlias("t"),
  Options.withDescription("Start the server with HTTP transport instead of stdio")
)
const portOption = Options.integer("port").pipe(
  Options.withAlias("p"),
  Options.withDescription("The port to start the HTTP server on"),
  Options.optional
)
const portSchema = Schema.Int.pipe(Schema.between(1024, 65535))
const command = Command.make("greet", { http: httpOption, port: portOption }, ({ http, port }) =>
  Effect.gen(function* () {
    if (http) {
      return yield* pipe(
        port,
        Option.match({
          onNone: () => Effect.log("No port specified. Using default stdio transport."),
          onSome: (p: number) => {
            return pipe(
              Schema.decode(portSchema)(p),
              Effect.flatMap(x => Effect.log(`Starting HTTP server on port ${x}...`))
            )
          },
        })
      )
    }

    return yield* stdioMain
  })
)

const cli = Command.run(command, {
  name: "Greeting MCP CLI",
  version: "v1.0.0",
})

cli(process.argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain)
