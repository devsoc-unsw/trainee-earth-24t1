import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateText(
  messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam>
): Promise<OpenAI.Chat.Completions.ChatCompletion.Choice | null> {
  console.log("Generating text...");

  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-4o",
    });
    console.log(`Generated text: ${completion.choices[0].message.content}`);
    return completion.choices[0];
  } catch (err) {
    console.error("Failed to generate text");
    console.error(err);
    return null;
  }
}
