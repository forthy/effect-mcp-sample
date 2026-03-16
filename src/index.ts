import { Effect } from "effect"
import { Command, Options } from "@effect/cli"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { GreetingService } from "./greeting.js"
import { z } from "zod"
import "@zod-plugin/effect"

const inputSchema = z.object({
  name: z.string().describe("The name of the user"),
})
type Input = z.infer<typeof inputSchema>

const outputSchema = z
  .object({
    content: z
      .array(
        z
          .object({
            type: z.literal("text").describe("The type of the greeting message"),
            text: z.string().describe("The text of the greeting message"),
          })
          .describe("A greeting message object")
      )
      .describe("An array of greeting message objects"),
  })
  .readonly()
  .describe("The greeting message response")
type Output = z.infer<typeof outputSchema>

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
    outputSchema,
  },
  async (input: Input): Promise<Output> => {
    const programme = Effect.gen(function* () {
      const p = yield* inputSchema.effect.parse(input)

      // INFO
      yield* Effect.log(`Received request to greet ${p.name}`)

      const greetingService = yield* GreetingService

      return yield* greetingService.greet(p.name)
    })

    return await Effect.runPromise(programme.pipe(Effect.provide(GreetingService.Live)))
  }
)

const stdioMain = Effect.gen(function* () {
  // INFO
  yield* Effect.log("Starting Effect MCP server...")

  yield* Effect.promise(() => server.connect(new StdioServerTransport()))

  // INFO
  yield* Effect.log("MCP server connected via stdio.")
})

// TODO
// Make a CLI with @effect/cli to start the server and add options for configuration
// BunRuntime.runMain(main.pipe(Effect.provide(BunContext.layer)))

// ---
// Command-line
// ---
const httpOption = Options.boolean("http").pipe(Options.withAlias("t"))
const command = Command.make("greet", { http: httpOption }, ({ http }) =>
  Effect.gen(function* () {
    if (http) {
      // INFO
      yield* Effect.log("HTTP transport is not implemented yet. Falling back to stdio.")
    }

    return yield* stdioMain
  })
)
const cli = Command.run(command, {
  name: "Greeting MCP CLI",
  version: "v1.0.0",
})

cli(process.argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain)
