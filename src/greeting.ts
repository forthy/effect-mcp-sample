import { Context, Effect, Layer } from "effect"
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"

export class GreetingService extends Context.Tag("GreetingService")<
  GreetingService,
  {
    greet: (name: string) => Effect.Effect<CallToolResult>
  }
>() {
  static Live = Layer.succeed(GreetingService, {
    greet: (name: string) =>
      Effect.succeed({
        content: [
          {
            type: "text",
            text: `Hello, ${name}!`,
          },
        ],
      }),
  })
}
