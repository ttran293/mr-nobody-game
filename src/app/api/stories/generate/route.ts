import { NextRequest, NextResponse } from "next/server"
import { Story } from "@/lib/story"

// Use Node.js runtime
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = (await req.json()) as { prompt?: string; model?: string }
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 })
    }

    const token = process.env.DEEPINFRA_TOKEN
    
    if (!token) {
      return NextResponse.json({ error: "DEEPINFRA_TOKEN is not set" }, { status: 500 })
    }

    const upstream = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: model || "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [
          { role: "system", content: "You are a helpful story generator." },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    })

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => upstream.statusText)
      return NextResponse.json({ error: errText || "Upstream error" }, { status: 502 })
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const text = (data.choices?.[0]?.message?.content || "").trim()
    const story = new Story({ text })
    return NextResponse.json(story.toJSON(), { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate story" },
      { status: 500 }
    )
  }
}


