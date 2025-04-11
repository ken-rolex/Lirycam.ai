'use client';

import {useState} from 'react';
import {photoToPoem} from '@/ai/flows/photo-to-poem';
import {photoToSong} from '@/ai/flows/photo-to-song';
import {narratePoem} from '@/ai/flows/poem-narration';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

export default function Home() {
  const [photoUrl, setPhotoUrl] = useState('');
  const [poem, setPoem] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [language, setLanguage] = useState('en-IN');
  const [loadingPoem, setLoadingPoem] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generateType, setGenerateType] = useState<'poem' | 'song'>('poem');

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
    setErrorMessage('');
    try {
      let result;
      if (generateType === 'poem') {
        result = await photoToPoem({photoUrl});
      } else {
        result = await photoToSong({photoUrl});
      }
      setPoem(result.poem || result.song); // Use poem or song based on generateType
    } catch (error: any) {
      console.error('Error generating content:', error);
      setErrorMessage(`Failed to generate ${generateType}. Please try again.`);
      setPoem('');
    } finally {
      setLoadingPoem(false);
    }
  };


  const narrateThePoem = async () => {
    setLoadingAudio(true);
    setErrorMessage('');
    try {
      const result = await narratePoem({poem, voiceGender, language});
      setAudioUrl(result.audioUrl);
    } catch (error: any) {
      console.error('Error narrating poem:', error);
      setErrorMessage('Failed to narrate poem. Please try again.');
      setAudioUrl('');
    } finally {
      setLoadingAudio(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <Card className="w-full max-w-md space-y-4 rounded-lg shadow-md border border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">PhotoVerse</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Upload a photo and generate a poem or song inspired by the image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="rounded-md shadow-sm border border-input"
            />
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Uploaded photo"
                className="max-w-full h-auto rounded-md shadow-md"
              />
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="default"
              onClick={() => {
                setGenerateType('poem');
                generatePoem();
              }}
              disabled={!photoUrl || loadingPoem}
              className="w-1/2"
            >
              {loadingPoem && generateType === 'poem' ? 'Generating Poem...' : 'Generate Poem'}
            </Button>
            <Button
              variant="secondary"
              size="default"
              onClick={() => {
                setGenerateType('song');
                generatePoem();
              }}
              disabled={!photoUrl || loadingPoem}
              className="w-1/2"
            >
              {loadingPoem && generateType === 'song' ? 'Generating Song...' : 'Generate Song'}
            </Button>
          </div>


          {poem && (
            <div className="flex flex-col space-y-4">
              <Textarea
                readOnly
                value={poem}
                placeholder="Generated poem/song will appear here."
                className="min-h-[100px] rounded-md shadow-sm border border-input"
              />
              <div className="flex items-center space-x-2">
                <Select value={voiceGender} onValueChange={(value) => setVoiceGender(value as 'male' | 'female' | 'neutral')}>
                  <SelectTrigger className="w-[180px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                    <SelectValue placeholder="Select Voice Gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md shadow-md border border-border bg-popover text-popover-foreground">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={language} onValueChange={(value) => setLanguage(value)}>
                  <SelectTrigger className="w-[180px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md shadow-md border border-border bg-popover text-popover-foreground">
                    <SelectItem value="en-IN">English (India)</SelectItem>
                    <SelectItem value="hi-IN">Hindi</SelectItem>
                    {/* Add more Indian languages here */}
                  </SelectContent>
                </Select>

                <Button
                  variant="secondary"
                  size="default"
                  onClick={narrateThePoem}
                  disabled={!poem || loadingAudio}
                  className="w-full"
                >
                  {loadingAudio ? 'Narrating...' : 'Narrate Poem'}
                </Button>
              </div>

              {audioUrl && (
                <audio controls src={audioUrl} className="w-full rounded-md">
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {errorMessage && (
        <Alert variant="destructive" className="mt-4 w-full max-w-md rounded-md shadow-sm">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

