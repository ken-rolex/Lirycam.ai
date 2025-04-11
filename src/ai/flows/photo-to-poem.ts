'use server';

/**
 * @fileOverview Generates a poem from photos.
 *
 * - photoToPoem - A function that generates a poem from a photo.
 * - PhotoToPoemInput - The input type for the photoToPoem function.
 * - PhotoToPoemOutput - The return type for the PhotoToPoem function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PhotoToPoemInputSchema = z.object({
  photoUrls: z.array(z.string().describe('The URLs of the photos.')).min(1).describe('Array of photo URLs. Must contain at least one URL.'),
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
      photoUrls: z.array(z.string().describe('The URLs of the photos.')).min(1).describe('Array of photo URLs. Must contain at least one URL.'),
    }),
  },
  output: {
    schema: z.object({
      poem: z.string().describe('The generated poem.'),
    }),
  },
  prompt: `You are a poet laureate, skilled at creating evocative poems inspired by images.
  Consider the visual elements, mood, and story suggested by the following photos, and compose a short poem that captures their essence.
  Photos:
  {{#each photoUrls}}
    {{media url=this}}
  {{/each}}
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
