// photo-to-poem.ts
'use server';

/**
 * @fileOverview Generates a poem from a photo.
 *
 * - photoToPoem - A function that generates a poem from a photo.
 * - PhotoToPoemInput - The input type for the photoToPoem function.
 * - PhotoToPoemOutput - The return type for the photoToPoem function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PhotoToPoemInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the photo.'),
});
export type PhotoToPoemInput = z.infer<typeof PhotoToPoemInputSchema>;

const PhotoToPoemOutputSchema = z.object({
  poem: z.string().describe('The generated poem.'),
});
export type PhotoToPoemOutput = z.infer<typeof PhotoToPoemOutputSchema>;

export async function photoToPoem(input: PhotoToPoemInput): Promise<PhotoToPoemOutput> {
  return photoToPoemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'photoToPoemPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the photo.'),
    }),
  },
  output: {
    schema: z.object({
      poem: z.string().describe('The generated poem.'),
    }),
  },
  prompt: `You are a poet laureate, skilled at creating evocative poems inspired by images.

  Consider the visual elements, mood, and story suggested by the following photo, and compose a short poem that captures its essence.

  Photo: {{media url=photoUrl}}
  `,
});

const photoToPoemFlow = ai.defineFlow<
  typeof PhotoToPoemInputSchema,
  typeof PhotoToPoemOutputSchema
>(
  {
    name: 'photoToPoemFlow',
    inputSchema: PhotoToPoemInputSchema,
    outputSchema: PhotoToPoemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
