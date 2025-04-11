'use server';

/**
 * @fileOverview Generates a song from photos.
 *
 * - photoToSong - A function that generates a song from a photo.
 * - PhotoToSongInput - The input type for the PhotoToSong function.
 * - PhotoToSongOutput - The return type for the PhotoToSong function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PhotoToSongInputSchema = z.object({
  photoUrls: z.array(z.string().describe('The URLs of the photos.')).min(1).describe('Array of photo URLs. Must contain at least one URL.'),
});

export type PhotoToSongInput = z.infer<typeof PhotoToSongInputSchema>;

const PhotoToSongOutputSchema = z.object({
  song: z.string().describe('The generated song.'),
});
export type PhotoToSongOutput = z.infer<typeof PhotoToSongOutputSchema>;

export async function photoToSong(input: PhotoToSongInput): Promise<PhotoToSongOutput> {
  return photoToSongFlow(input);
}

const prompt = ai.definePrompt({
  name: 'photoToSongPrompt',
  input: {
    schema: z.object({
      photoUrls: z.array(z.string().describe('The URLs of the photos.')).min(1).describe('Array of photo URLs. Must contain at least one URL.'),
    }),
  },
  output: {
    schema: z.object({
      song: z.string().describe('The generated song.'),
    }),
  },
  prompt: `You are a songwriter, skilled at creating songs inspired by images.

  Consider the visual elements, mood, and story suggested by the following photos, and compose a song that has at least two verses and a chorus. The song lyrics must have enough words to have an approximate read time of 2 minutes.  If appropriate for the photos, incorporate Indian cultural elements into the song lyrics, such as references to nature, festivals, or mythology.

  Photos:
  {{#each photoUrls}}
    {{media url=this}}
  {{/each}}
  `,
});

const photoToSongFlow = ai.defineFlow<
  typeof PhotoToSongInputSchema,
  typeof PhotoToSongOutputSchema
>(
  {
    name: 'photoToSongFlow',
    inputSchema: PhotoToSongInputSchema,
    outputSchema: PhotoToSongOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
