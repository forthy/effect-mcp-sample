import { Context, Effect, Layer } from "effect"

export type GreetingResults = {
  readonly content: Array<{
    type: "text"
    text: string
  }>
}

export class GreetingService extends Context.Tag("GreetingService")<
  GreetingService,
  {
    greet: (name: string) => Effect.Effect<GreetingResults>
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
