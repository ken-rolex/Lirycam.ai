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
  audioUrl: z.string().describe('The URL of the narrated poem audio. For this free implementation, the audio is played directly and no URL is available.'),
});
export type NarratePoemOutput = z.infer<typeof NarratePoemOutputSchema>;

export async function narratePoem(input: NarratePoemInput): Promise<NarratePoemOutput> {
  return narratePoemFlow(input);
}

// Utility function to map voice gender to ResponsiveVoice's limited options.
function mapVoiceGender(gender: 'male' | 'female' | 'neutral', language: string): string {
  const langCode = language.split('-')[0];
  switch (gender) {
    case 'male':
      return `${langCode}male`; // e.g., enmale, himale
    case 'female':
      return `${langCode}female`; // e.g., enfemale, hifemale
    case 'neutral':
    default:
      // For neutral, try to use a standard voice if available, otherwise default to female.
      return `${langCode}female`;
  }
}

const textToSpeechTool = ai.defineTool({
  name: 'textToSpeech',
  description: 'Converts text to speech using a specified voice gender and language.',
  inputSchema: z.object({
    text: z.string().describe('The text to convert to speech.'),
    voiceGender: z.enum(['male', 'female', 'neutral']).describe('The gender of the voice to use.'),
    language: z.string().default('en-IN').describe('The language to use for narration (e.g., en-IN, hi-IN, es-ES). Defaults to English (India).'),
  }),
  outputSchema: z.string().describe('The URL of the generated audio file.  For this free implementation, the audio is played directly and no URL is available.'),
},
async input => {
  // Free implementation using responsivevoice.js
  if (typeof window !== 'undefined' && window.responsiveVoice) {
    // Initialize ResponsiveVoice with a placeholder API key to prevent warnings.
    window.responsiveVoice.apiKey = 'YOUR_API_KEY'; // Replace with a real API key if you have one

    const voice = mapVoiceGender(input.voiceGender, input.language);
    console.log(`Attempting to speak with voice: ${voice}`);
    window.responsiveVoice.speak(input.text, voice, {
      pitch: 1,
      rate: 1,
      volume: 1,
      onstart: () => {
        console.log('Speech started');
      },
      onend: () => {
        console.log('Speech ended');
      },
      onerror: (e) => {
        console.error('Speech error:', e);
      }
    });
    return 'Audio played directly using responsivevoice.js'; // No audio URL is available
  } else {
    console.warn('responsiveVoice not available.  Make sure it is included in the page.');
    throw new Error('responsiveVoice not available.');
  }
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
      audioUrl: z.string().describe('The URL of the narrated poem audio. For this free implementation, the audio is played directly and no URL is available.'),
    }),
  },
  tools: [textToSpeechTool],
  prompt: `You are a helpful assistant designed to narrate poems using a text-to-speech tool.

  The user has provided the following poem:
  """{{poem}}"""

  The user has selected the following voice gender for the narration: {{voiceGender}}
  The user has selected the following language for the narration: {{language}}

  Use the textToSpeech tool to convert the poem to speech using the specified voice gender and language.
  Return the URL of the narrated poem audio.  Since the audio is played directly, there is no URL so just return the message "Audio played directly using responsivevoice.js".
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
