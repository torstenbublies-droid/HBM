import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getChatResponse } from "../services/chat-service";

export const chatRouter = router({
  /**
   * Chat-Endpoint: Beantwortet Bürger-Fragen mit Perplexity
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        message: z.string().min(1, "Nachricht darf nicht leer sein"),
        sessionId: z.string(),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, sessionId } = input;
      const tenant = ctx.tenant;

      if (!tenant) {
        throw new Error("Tenant nicht gefunden");
      }

      try {
        const response = await getChatResponse(
          tenant.id,
          tenant.name,
          tenant.website || 'https://www.schieder-schwalenberg.de',
          tenant.chatbotName || 'Chatbot',
          message,
          sessionId
        );

        return {
          response,
        };
      } catch (error: any) {
        console.error("[Chat] Fehler beim Verarbeiten der Nachricht:", error);
        throw new Error(`Fehler beim Verarbeiten der Nachricht: ${error.message}`);
      }
    }),
});
