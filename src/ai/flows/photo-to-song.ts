'use server';

/**
 * @fileOverview Generates a song from a photo.
 *
 * - photoToSong - A function that generates a song from a photo.
 * - PhotoToSongInput - The input type for the photoToSong function.
 * - PhotoToSongOutput - The return type for the PhotoToSong function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PhotoToSongInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the photo.'),
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
      photoUrl: z.string().describe('The URL of the photo.'),
    }),
  },
  output: {
    schema: z.object({
      song: z.string().describe('The generated song.'),
    }),
  },
  prompt: `You are a songwriter, skilled at creating songs inspired by images.

  Consider the visual elements, mood, and story suggested by the following photo, and compose a song that has at least two verses and a chorus. The song lyrics must have enough words to have an approximate read time of 2 minutes.  If appropriate for the photo, incorporate Indian cultural elements into the song lyrics, such as references to nature, festivals, or mythology.

  Photo: {{media url=photoUrl}}
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

