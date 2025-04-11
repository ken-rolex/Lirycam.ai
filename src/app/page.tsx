
'use client';

import {useState} from 'react';
import {photoToPoem} from '@/ai/flows/photo-to-poem';
import {narratePoem} from '@/ai/flows/poem-narration';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';

export default function Home() {
  const [photoUrl, setPhotoUrl] = useState('');
  const [poem, setPoem] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [loadingPoem, setLoadingPoem] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In real production environment, upload file to storage like Firebase Storage or AWS S3 and get the URL.
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePoem = async () => {
    setLoadingPoem(true);
    try {
      const result = await photoToPoem({photoUrl});
      setPoem(result.poem);
    } catch (error) {
      console.error('Error generating poem:', error);
      setPoem('Failed to generate poem. Please try again.');
    } finally {
      setLoadingPoem(false);
    }
  };

  const narrateThePoem = async () => {
    setLoadingAudio(true);
    try {
      const result = await narratePoem({poem, voiceGender});
      setAudioUrl(result.audioUrl);
    } catch (error) {
      console.error('Error narrating poem:', error);
      setAudioUrl('');
    } finally {
      setLoadingAudio(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle>PhotoVerse</CardTitle>
          <CardDescription>
            Upload a photo and generate a poem inspired by the image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="mb-4"
            />
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Uploaded photo"
                className="max-w-full h-auto rounded-md shadow-md"
              />
            )}
          </div>

          <Button onClick={generatePoem} disabled={!photoUrl || loadingPoem}>
            {loadingPoem ? 'Generating Poem...' : 'Generate Poem'}
          </Button>

          {poem && (
            <div className="flex flex-col space-y-2">
              <Textarea
                readOnly
                value={poem}
                placeholder="Generated poem will appear here."
                className="min-h-[100px] rounded-md shadow-sm border border-muted-foreground"
              />
              <div className="flex items-center space-x-2">
                <Select value={voiceGender} onValueChange={(value) => setVoiceGender(value as 'male' | 'female' | 'neutral')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Voice Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={narrateThePoem} disabled={!poem || loadingAudio}>
                  {loadingAudio ? 'Narrating...' : 'Narrate Poem'}
                </Button>
              </div>

              {audioUrl && (
                <audio controls src={audioUrl} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
