import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { message, conversationId, userId } = await request.json()

    if (!message || !userId) {
      return Response.json({ error: "Message and userId are required" }, { status: 400 })
    }

    const { text: aiResponse } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `Tu es FindTounsi Assistant, un assistant IA friendly et utile pour la plateforme de commerce FindTounsi.
      
Tu aides les utilisateurs tunisiens avec:
- Les questions sur les produits tunisiens
- L'aide pour acheter sur la plateforme
- Les problèmes de livraison
- Les réclamations et retours
- Les informations sur les vendeurs locaux

Sois courtois, professionnel et toujours prêt à aider. Réponds en français.`,
      prompt: message,
      temperature: 0.7,
      maxTokens: 500,
    })

    const supabase = await createClient()

    const { error: userMsgError } = await supabase.from("chat_messages").insert({
      user_id: userId,
      message_text: message,
      message_type: "user",
      conversation_id: conversationId,
    })

    const { error: aiMsgError } = await supabase.from("chat_messages").insert({
      user_id: userId,
      message_text: aiResponse,
      message_type: "assistant",
      conversation_id: conversationId,
    })

    if (userMsgError || aiMsgError) {
      console.error("[v0] Error saving messages:", userMsgError || aiMsgError)
    }

    return Response.json({ response: aiResponse })
  } catch (error) {
    console.error("[v0] Chat error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
