'use client';

import {useState, useRef, useEffect} from 'react';
import {photoToPoem} from '@/ai/flows/photo-to-poem';
import {photoToSong} from '@/ai/flows/photo-to-song';
import {narratePoem} from '@/ai/flows/poem-narration';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {cn} from "@/lib/utils";
import {Loader2} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar";
import {toast} from "@/hooks/use-toast";

const languages = [
  {value: 'en-IN', label: 'English (India)'},
  {value: 'hi-IN', label: 'Hindi (India)'},
  {value: 'bn-IN', label: 'Bengali (India)'},
  {value: 'te-IN', label: 'Telugu (India)'},
  {value: 'mr-IN', label: 'Marathi (India)'},
  {value: 'ta-IN', label: 'Tamil (India)'},
  {value: 'gu-IN', label: 'Gujarati (India)'},
  {value: 'ur-IN', label: 'Urdu (India)'},
  {value: 'kn-IN', label: 'Kannada (India)'},
  {value: 'ml-IN', label: 'Malayalam (India)'},
  {value: 'pa-IN', label: 'Punjabi (India)'},
];

export default function Home() {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [poem, setPoem] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [language, setLanguage] = useState(languages[0].value);
  const [loadingPoem, setLoadingPoem] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generateType, setGenerateType] = useState<'poem' | 'song'>('poem');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'});
  };

  useEffect(() => {
    scrollToBottom();
  }, [poem, audioUrl]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const readers = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers)
        .then(results => {
          setPhotoUrls(prevUrls => [...prevUrls, ...results]);
        })
        .catch(error => {
          console.error('Error reading files:', error);
          setErrorMessage('Failed to read one or more files. Please try again.');
          toast({
            variant: 'destructive',
            title: 'Upload Error',
            description: 'Failed to read one or more files. Please try again.',
          });
        });
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const clearImages = () => {
    setPhotoUrls([]);
  };

  const generateContent = async () => {
    setLoadingPoem(true);
    setErrorMessage('');
    setPoem('');
    try {
      let result;
      const input = {photoUrls};
      if (generateType === 'poem') {
        result = await photoToPoem(input);
      } else {
        result = await photoToSong(input);
      }
      setPoem(result.poem || result.song); // Use poem or song based on generateType
    } catch (error: any) {
      console.error('Error generating content:', error);
      setErrorMessage(`Failed to generate ${generateType}. Please try again.`);
      setPoem('');
      toast({
        variant: 'destructive',
        title: 'Generation Error',
        description: `Failed to generate ${generateType}. Please try again.`,
      });
    } finally {
      setLoadingPoem(false);
    }
  };

  const narrateThePoem = async () => {
    setLoadingAudio(true);
    setErrorMessage('');
    setAudioUrl('');
    try {
      const result = await narratePoem({poem, voiceGender, language});
      setAudioUrl(result.audioUrl);
    } catch (error: any) {
      console.error('Error narrating poem:', error);
      setErrorMessage('Failed to narrate poem. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Narration Error',
        description: 'Failed to narrate poem. Please try again.',
      });
      setAudioUrl('');
    } finally {
      setLoadingAudio(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-background text-foreground">
      <Card className="w-full max-w-2xl space-y-4 rounded-lg shadow-md border border-border animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight animate-slide-in-from-top">
            PhotoVerse
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground animate-slide-in-from-bottom">
            Upload photos and generate a poem or song inspired by the images.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button
              variant="secondary"
              onClick={triggerImageUpload}
              className="rounded-md shadow-sm border border-input"
            >
              Upload Photos
            </Button>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              ref={fileInputRef}
            />

            <div className="flex flex-wrap gap-2">
              {photoUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Uploaded photo ${index + 1}`}
                    className="max-w-[75px] h-auto rounded-md shadow-md"
                  />
                </div>
              ))}
            </div>

            {photoUrls.length > 0 && (
              <Button
                variant="outline"
                onClick={clearImages}
                className="rounded-md shadow-sm border border-input"
              >
                Clear Images
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="default"
              onClick={() => {
                setGenerateType('poem');
                generateContent();
              }}
              disabled={photoUrls.length === 0 || loadingPoem}
              className="w-1/2"
            >
              {loadingPoem && generateType === 'poem' ? (
                <>
                  Generating Poem...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Generate Poem'
              )}
            </Button>
            <Button
              variant="secondary"
              size="default"
              onClick={() => {
                setGenerateType('song');
                generateContent();
              }}
              disabled={photoUrls.length === 0 || loadingPoem}
              className="w-1/2"
            >
              {loadingPoem && generateType === 'song' ? (
                <>
                  Generating Song...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Generate Song'
              )}
            </Button>
          </div>

          <div ref={chatContainerRef} className="flex flex-col space-y-4">
            {photoUrls.length > 0 && (
              <div className="flex items-start space-x-2">
                <Avatar>
                  <AvatarImage src={photoUrls[0]} alt="Uploaded Image"/>
                  <AvatarFallback>IMG</AvatarFallback>
                </Avatar>
                <div className="rounded-xl border border-border bg-secondary text-secondary-foreground p-3 w-fit max-w-[60%]">
                  <p className="text-sm">
                    Uploaded {photoUrls.length} images. Generating {generateType === 'poem' ? 'poem' : 'song'}...
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {photoUrls.slice(0, 3).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Uploaded photo ${index + 1}`}
                        className="w-16 h-16 rounded-md shadow-md"
                      />
                    ))}
                    {photoUrls.length > 3 && (
                      <span className="text-sm text-muted-foreground">+ {photoUrls.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {poem && (
              <div className="flex items-start space-x-2">
                <Avatar>
                  <AvatarImage src="/bot.png" alt="Bot Avatar"/>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-xl border border-border bg-primary text-primary-foreground p-4 w-fit max-w-[80%] font-serif">
                  <p className="text-lg whitespace-pre-line">{poem}</p>
                  <div className="mt-4 flex items-center space-x-2">
                    <Select
                      value={voiceGender}
                      onValueChange={(value) => setVoiceGender(value as 'male' | 'female' | 'neutral')}
                    >
                      <SelectTrigger className="w-[180px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                        <SelectValue placeholder="Select Voice Gender"/>
                      </SelectTrigger>
                      <SelectContent className="rounded-md shadow-md border border-border bg-popover text-popover-foreground">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={language} onValueChange={(value) => setLanguage(value)}>
                      <SelectTrigger className="w-[180px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                        <SelectValue placeholder="Select Language"/>
                      </SelectTrigger>
                      <SelectContent className="rounded-md shadow-md border border-border bg-popover text-popover-foreground">
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="secondary"
                      size="default"
                      onClick={narrateThePoem}
                      disabled={!poem || loadingAudio}
                    >
                      {loadingAudio ? (
                        <>
                          Narrating...
                          <Loader2 className="ml-2 h-4 w-4 animate-spin"/>
                        </>
                      ) : (
                        'Narrate Content'
                      )}
                    </Button>
                  </div>

                  {audioUrl && (
                    <audio controls src={audioUrl} className="w-full rounded-md mt-4">
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {errorMessage && (
        <Alert variant="destructive" className="mt-4 w-full max-w-2xl rounded-md shadow-sm animate-fade-in">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
