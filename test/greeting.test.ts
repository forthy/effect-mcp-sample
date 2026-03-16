import { describe, expect, it } from "@effect/vitest"
import { Effect, pipe } from "effect"
import { GreetingService } from "../src/greeting.js"

describe("GreetingService", () => {
  it("returns a greeting message for a given name", async () => {
    const programme = Effect.gen(function* () {
      const greetingService = yield* GreetingService
      return yield* greetingService.greet("Alice")
    })

    const result = await Effect.runPromise(
      pipe(programme, Effect.provide(GreetingService.Live)),
    )

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Hello, Alice!",
        },
      ],
    })
  })
})
