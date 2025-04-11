'use server';
/**
 * @fileOverview A poem narration AI agent.
 *
 * - narratePoem - A function that handles the poem narration process.
 * - NarratePoemInput - The input type for the narratePoem function.
 * - NarratePoemOutput - The return type for the NarratePoem function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const NarratePoemInputSchema = z.object({
  poem: z.string().describe('The poem to be narrated.'),
  voiceGender: z.enum(['male', 'female', 'neutral']).describe('The gender of the voice to use for narration.'),
  language: z.string().default('en-IN').describe('The language to use for narration (e.g., en-IN, hi-IN). Defaults to English (India).'),
});
export type NarratePoemInput = z.infer<typeof NarratePoemInputSchema>;

const NarratePoemOutputSchema = z.object({
  audioUrl: z.string().describe('The URL of the narrated poem audio.'),
});
export type NarratePoemOutput = z.infer<typeof NarratePoemOutputSchema>;

export async function narratePoem(input: NarratePoemInput): Promise<NarratePoemOutput> {
  return narratePoemFlow(input);
}

const textToSpeechTool = ai.defineTool({
  name: 'textToSpeech',
  description: 'Converts text to speech using a specified voice gender and language.',
  inputSchema: z.object({
    text: z.string().describe('The text to convert to speech.'),
    voiceGender: z.enum(['male', 'female', 'neutral']).describe('The gender of the voice to use.'),
    language: z.string().default('en-IN').describe('The language to use for narration (e.g., en-IN, hi-IN, es-ES). Defaults to English (India).'),
  }),
  outputSchema: z.string().describe('The URL of the generated audio file.'),
},
async input => {
  // Placeholder implementation for text-to-speech conversion.
  // In a real application, this would call an external TTS service or API.
  // For now, it simply returns a dummy audio URL.
  console.log(`Converting text to speech with voice gender: ${input.voiceGender} and language: ${input.language}`);
  return `https://example.com/audio/${input.text.substring(0, 10)}_${input.voiceGender}_${input.language}.mp3`;
}
);

const prompt = ai.definePrompt({
  name: 'narratePoemPrompt',
  input: {
    schema: z.object({
      poem: z.string().describe('The poem to be narrated.'),
      voiceGender: z.string().describe('The gender of the voice to use for narration.'),
      language: z.string().describe('The language to use for narration.'),
    }),
  },
  output: {
    schema: z.object({
      audioUrl: z.string().describe('The URL of the narrated poem audio.'),
    }),
  },
  tools: [textToSpeechTool],
  prompt: `You are a helpful assistant designed to narrate poems using a text-to-speech tool.

  The user has provided the following poem:
  """{{poem}}"""

  The user has selected the following voice gender for the narration: {{voiceGender}}
  The user has selected the following language for the narration: {{language}}

  Use the textToSpeech tool to convert the poem to speech using the specified voice gender and language.
  Return the URL of the narrated poem audio.
`,
});

const narratePoemFlow = ai.defineFlow<
  typeof NarratePoemInputSchema,
  typeof NarratePoemOutputSchema
>(
  {
    name: 'narratePoemFlow',
    inputSchema: NarratePoemInputSchema,
    outputSchema: NarratePoemOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error(`Failed to generate audio URL. The prompt returned null for input: ${JSON.stringify(input)}`);
    }
    return output;
  }
);


