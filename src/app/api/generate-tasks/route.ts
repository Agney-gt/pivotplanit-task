import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
const TaskSchema = z.object({
  tasks: z
    .array(
      z.object({
        name: z.string().describe("A clear, actionable task name"),
        description: z.string().describe("Detailed description of what needs to be done"),
        timeframe: z.string().describe('Estimated time to complete (e.g., "2 hours", "30 minutes", "1 day")'),
      }),
    )
    .min(3)
    .max(5)
    .describe("Array of 3-5 actionable tasks"),
})

export async function POST(request: NextRequest) {
  try {
    const { content, threadId } = await request.json()
    console.log(threadId)

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required and must be a string" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: openai("gpt-3.5-turbo"),
      schema: TaskSchema,
      prompt: `Based on the following context, generate 3-5 specific, actionable tasks that would help someone accomplish their goal. Each task should be practical and achievable.

Context: "${content}"

Please provide tasks that are:
- Specific and actionable
- Realistic in scope
- Properly sequenced if order matters
- Include reasonable time estimates

Focus on breaking down the main goal into concrete steps that can be completed and checked off.`,
      temperature: 0.7,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("Error generating tasks:", error)
    return NextResponse.json({ error: "Failed to generate tasks" }, { status: 500 })
  }
}