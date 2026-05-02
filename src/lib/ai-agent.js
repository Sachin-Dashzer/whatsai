import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processMessageWithAI(config, contactHistory, incomingMessage) {
  const messages = contactHistory.map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }));

  messages.push({ role: 'user', content: incomingMessage });

  const tagRulesText =
    config.tagRules
      ?.map(
        (r) =>
          `- If customer mentions "${r.keyword}", add tag "${r.tag}"${r.stage ? ` and set stage to "${r.stage}"` : ''}`
      )
      .join('\n') || '';

  const systemPrompt = `${config.systemPrompt}

TAGGING RULES (apply automatically):
${tagRulesText}

HANDOVER TRIGGERS: If customer says any of these, set shouldHandover to true: ${config.handoverTriggers?.join(', ')}

IMPORTANT: You must ALWAYS respond with a valid JSON object (no markdown, no backticks) in this exact format:
{
  "reply": "Your reply message to the customer",
  "tagsToAdd": ["tag1", "tag2"],
  "tagsToRemove": [],
  "stageUpdate": null,
  "shouldHandover": false,
  "reasoning": "Brief internal note about why you responded this way"
}

Be conversational, helpful, and natural. Ask one question at a time. Never mention you are an AI unless asked directly.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1000,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
  });

  const rawText = response.choices[0].message.content;

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch {
    return {
      reply: rawText,
      tagsToAdd: [],
      tagsToRemove: [],
      stageUpdate: null,
      shouldHandover: false,
      reasoning: 'JSON parse failed, used raw text',
    };
  }
}
