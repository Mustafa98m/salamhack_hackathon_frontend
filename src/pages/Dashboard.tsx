// File: src/pages/Dashboard.jsx
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/reactQuery';
import { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import OpenAI from 'openai';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Send as SendIcon,
  AudioFile as AudioFileIcon,
  Woman as WomanIcon,
  Man as ManIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

// Define interfaces for the data structures
interface PodcastData {
  podcast: {
    id: string;
    ai_generated_text?: string;
  };
  video: {
    id: string;
  };
  ai_generated_text?: string;
}

interface VideoSubmitData {
  url: string;
  keywords: {
    keyword: string;
    user_level: string;
  }[];
}

interface AudioUploadData {
  file: Blob;
  podcast_id: string;
}

// Define form input types
interface FormInputs {
  youtubeLink: string;
  languageLevel: string;
  language: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: For production, use a backend proxy
});

// Helper function to extract transcript text from the API response
const extractTranscriptFromResponse = (response) => {
  // Check if the response has transcripts array
  if (
    response.transcripts &&
    Array.isArray(response.transcripts) &&
    response.transcripts.length > 0
  ) {
    // Combine all transcript segments into a single string
    return response.transcripts.map((segment) => segment.text).join(' ');
  }

  // Check if the response has podcast.ai_generated_text
  if (response.podcast?.ai_generated_text) {
    return response.podcast.ai_generated_text;
  }

  // Fallback to JSON string if we can't find a better representation
  return typeof response === 'string'
    ? response
    : JSON.stringify(response, null, 2);
};

const Dashboard = () => {
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [submissionError, setSubmissionError] = useState(null);
  const [youtubeTranscript, setYoutubeTranscript] = useState(null);
  const [generatedTranscript, setGeneratedTranscript] = useState(null);
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const [voiceType, setVoiceType] = useState('female'); // Default to female voice
  const [generatingMP3, setGeneratingMP3] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioUploaded, setAudioUploaded] = useState(false);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInputs>({
    defaultValues: {
      youtubeLink: '',
      languageLevel: '',
      language: '',
    },
  });

  // Mutation for extracting YouTube transcript
  const generatePodcast = useMutation({
    mutationFn: (podcastData: VideoSubmitData) => {
      console.log('Submitting data:', podcastData);
      return apiClient.post('/videos/related', podcastData);
    },
    onSuccess: (data) => {
      console.log('Transcript extraction successful:', data);
      // Store the extracted transcript
      setYoutubeTranscript(data);
      // Clear any previous AI transcript
      setGeneratedTranscript(null);
      setAudioUrl(null);
      setAudioBlob(null);
      setAudioUploaded(false);
      setSubmissionError(null);
    },
    onError: (error) => {
      console.error('Submission error:', error);
      setSubmissionError(
        error.message || 'Failed to extract transcript. Please try again.'
      );
    },
  });

  const patchAIGeneratedPodcast = useMutation({
    mutationFn: (podcastData: PodcastData) => {
      return apiClient.patch(`/podcasts/${podcastData.podcast.id}`, {
        ai_generated_text: podcastData.ai_generated_text,
        video_id: podcastData.video.id,
      });
    },
    onSuccess: (data) => {
      console.log('Podcast transcript patched successfully:', data);
      // You can add any success handling here if needed
    },
    onError: (error) => {
      console.error('Failed to patch podcast:', error);
      setSubmissionError(
        'Failed to save podcast transcript. Please try again.'
      );
    },
  });

  // New mutation for uploading the generated MP3 file
  const uploadAudioFile = useMutation({
    mutationFn: (audioData: AudioUploadData) => {
      // Create FormData object
      const formData = new FormData();
      formData.append('file', audioData.file, 'podcast.mp3');
      formData.append('podcast_id', audioData.podcast_id);

      // Use apiClient to make the POST request
      return apiClient.post('/audio-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (data) => {
      console.log('Audio file uploaded successfully:', data);
      setAudioUploaded(true);
      setUploadingAudio(false);
      setSubmissionError(null);
    },
    onError: (error) => {
      console.error('Failed to upload audio file:', error);
      setUploadingAudio(false);
      setSubmissionError(
        'Failed to upload podcast audio file. Please try again.'
      );
    },
  });

  // Function to generate enhanced transcript with OpenAI
  const generateWithOpenAI = async () => {
    if (!youtubeTranscript) {
      setSubmissionError('No YouTube transcript available');
      return;
    }

    try {
      setGeneratingWithAI(true);

      // Extract the transcript from the response based on the actual structure
      const transcriptText =
        youtubeTranscript.podcast?.ai_generated_text ||
        extractTranscriptFromResponse(youtubeTranscript);

      // Get the selected language from form
      const selectedLanguage = control._formValues.language || 'English';

      // Create prompt with transcript and keywords
      const prompt = `
        I have a YouTube video transcript that I want to turn into a better podcast transcript.
        You choose a suitable title for the podcast and a suitable name for the host of the podcast.
        
        Original Transcript:
        ${transcriptText}
        
        Keywords to focus on: ${keywords.join(', ')}
        
        Language: ${selectedLanguage}
        Proficiency level: ${getLanguageLevelLabel()}
        
        Please create an improved, more engaging podcast script from this content.
        The podcast should be in ${selectedLanguage} language.
        Focus on natural conversation flow, clear explanations of the keywords, and appropriate language for the specified proficiency level.
        Structure it with introduction, main content, conclusion sections and finally one speaker.
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const aiGeneratedContent = completion.choices[0].message.content;
      setGeneratedTranscript(aiGeneratedContent);

      // Pass the generated content directly to the mutation
      if (youtubeTranscript.podcast && youtubeTranscript.video) {
        const podcastData: PodcastData = {
          podcast: youtubeTranscript.podcast,
          video: youtubeTranscript.video,
          ai_generated_text: aiGeneratedContent,
        };
        patchAIGeneratedPodcast.mutate(podcastData);
      } else {
        console.error('Missing podcast or video data in youtubeTranscript');
        setSubmissionError('Unable to save transcript: missing required data');
      }
    } catch (error) {
      console.error('OpenAI error:', error);
      setSubmissionError(
        'Failed to generate enhanced transcript with AI. Please try again.'
      );
    } finally {
      setGeneratingWithAI(false);
    }
  };

  // Function to handle voice type change
  const handleVoiceTypeChange = (event, newVoiceType) => {
    if (newVoiceType !== null) {
      setVoiceType(newVoiceType);
    }
  };

  // Function to generate MP3 using OpenAI Text-to-Speech API
  const handleGeneratePodcastMP3 = async () => {
    if (!generatedTranscript) {
      setSubmissionError('No enhanced transcript available for TTS conversion');
      return;
    }

    try {
      setGeneratingMP3(true);
      setAudioUploaded(false);

      // Determine voice based on selection
      const voice = voiceType === 'female' ? 'nova' : 'onyx';

      // Call OpenAI TTS API
      const mp3Response = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: voice,
        input: generatedTranscript,
      });

      // Convert the response to an audio blob
      const blob = await mp3Response.blob();

      // Store the blob for later upload
      setAudioBlob(blob);

      // Create a URL for the audio blob
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      setSubmissionError(null);
    } catch (error) {
      console.error('TTS error:', error);
      setSubmissionError('Failed to generate podcast MP3. Please try again.');
    } finally {
      setGeneratingMP3(false);
    }
  };

  // Function to upload the generated MP3 to the server
  const handleUploadAudio = () => {
    if (!audioBlob || !youtubeTranscript?.podcast?.id) {
      setSubmissionError('Missing audio file or podcast ID for upload');
      return;
    }

    try {
      setUploadingAudio(true);

      // Prepare the data for upload
      const uploadData: AudioUploadData = {
        file: audioBlob,
        podcast_id: youtubeTranscript.podcast.id,
      };

      // Execute the upload mutation
      uploadAudioFile.mutate(uploadData);
    } catch (error) {
      console.error('Audio upload setup error:', error);
      setSubmissionError('Failed to prepare audio for upload');
      setUploadingAudio(false);
    }
  };

  // Get language level label from value
  const getLanguageLevelLabel = () => {
    const level = languageLevels.find(
      (l) => l.value === control._formValues.languageLevel
    );
    return level ? level.label : 'Not specified';
  };

  // Add keyword chip when Enter is pressed
  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' && keywordInput.trim() !== '') {
      e.preventDefault(); // Prevent form submission when pressing Enter in the input
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  // Delete keyword chip
  const handleDeleteKeyword = (keywordToDelete) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToDelete));
  };

  // Handle form submission
  const manualSubmit: SubmitHandler<FormInputs> = (formData) => {
    // Reset previous states
    setSubmissionError(null);
    setYoutubeTranscript(null);
    setGeneratedTranscript(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioUploaded(false);

    // Validation
    if (keywords.length === 0) {
      setSubmissionError('Please add at least one keyword');
      return;
    }

    if (!formData.language.trim()) {
      setSubmissionError('Please enter a language');
      return;
    }

    // Format the data for API submission
    const keywordsData = keywords.map((keyword) => ({
      keyword: keyword,
      user_level: formData.languageLevel,
    }));

    // Prepare the payload in the required format
    const payload: VideoSubmitData = {
      url: formData.youtubeLink,
      keywords: keywordsData,
    };

    console.log('Preparing to submit:', payload);

    // Submit using mutation
    generatePodcast.mutate(payload);
  };

  // Language proficiency levels
  const languageLevels = [
    { value: '1', label: 'A1 - Beginner' },
    { value: '2', label: 'A2 - Elementary' },
    { value: '3', label: 'B1 - Intermediate' },
    { value: '4', label: 'B2 - Upper Intermediate' },
    { value: '5', label: 'C1 - Advanced' },
    { value: '6', label: 'C2 - Proficient' },
  ];

  // Reset the form completely
  const handleReset = () => {
    reset();
    setKeywords([]);
    setYoutubeTranscript(null);
    setGeneratedTranscript(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioUploaded(false);
    setSubmissionError(null);
  };

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        YouTube Transcript Extractor
      </Typography>

      <Paper sx={{ p: 4, mt: 2 }} elevation={2}>
        {submissionError && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {submissionError}
          </Alert>
        )}

        {/* Form */}
        <Box component='div'>
          <Grid container spacing={3}>
            {/* YouTube Link Input */}
            <Grid item xs={12}>
              <Controller
                name='youtubeLink'
                control={control}
                rules={{
                  required: 'YouTube link is required',
                  pattern: {
                    value:
                      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
                    message: 'Please enter a valid YouTube URL',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='YouTube Video URL'
                    placeholder='https://www.youtube.com/watch?v=...'
                    fullWidth
                    variant='outlined'
                    error={!!errors.youtubeLink}
                    helperText={errors.youtubeLink?.message}
                    disabled={
                      generatePodcast.isPending ||
                      generatingWithAI ||
                      generatingMP3 ||
                      uploadingAudio
                    }
                  />
                )}
              />
            </Grid>

            {/* Keywords Input */}
            <Grid item xs={12}>
              <Typography variant='subtitle1' gutterBottom>
                Keywords (press Enter to add)
              </Typography>
              <Box sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  variant='outlined'
                  placeholder='Enter keywords and press Enter'
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  disabled={
                    generatePodcast.isPending ||
                    generatingWithAI ||
                    generatingMP3 ||
                    uploadingAudio
                  }
                />
              </Box>
              <Stack
                direction='row'
                spacing={1}
                flexWrap='wrap'
                sx={{ minHeight: '40px' }}
              >
                {keywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    onDelete={() => handleDeleteKeyword(keyword)}
                    color='primary'
                    variant='outlined'
                    sx={{ m: 0.5 }}
                    disabled={
                      generatePodcast.isPending ||
                      generatingWithAI ||
                      generatingMP3 ||
                      uploadingAudio
                    }
                  />
                ))}
                {keywords.length === 0 && (
                  <Typography variant='body2' color='text.secondary'>
                    No keywords added yet
                  </Typography>
                )}
              </Stack>
            </Grid>

            {/* Language Input */}
            <Grid item xs={12}>
              <Controller
                name='language'
                control={control}
                rules={{
                  required: 'Language is required',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Preferred Language'
                    placeholder='Enter language (e.g., English, Spanish, French)'
                    fullWidth
                    variant='outlined'
                    error={!!errors.language}
                    helperText={errors.language?.message}
                    disabled={
                      generatePodcast.isPending ||
                      generatingWithAI ||
                      generatingMP3 ||
                      uploadingAudio
                    }
                  />
                )}
              />
            </Grid>

            {/* Language Level Selection */}
            <Grid item xs={12}>
              <Controller
                name='languageLevel'
                control={control}
                rules={{
                  required: 'Please select the language proficiency level',
                }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.languageLevel}>
                    <InputLabel id='language-level-label'>
                      Language Proficiency Level
                    </InputLabel>
                    <Select
                      {...field}
                      labelId='language-level-label'
                      label='Language Proficiency Level'
                      disabled={
                        generatePodcast.isPending ||
                        generatingWithAI ||
                        generatingMP3 ||
                        uploadingAudio
                      }
                    >
                      {languageLevels.map((level) => (
                        <MenuItem key={level.value} value={level.value}>
                          {level.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {errors.languageLevel?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} container direction='column' spacing={2}>
              {/* Extract Transcript Button */}
              <Grid item>
                <Button
                  variant='contained'
                  endIcon={
                    generatePodcast.isPending ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <SendIcon />
                    )
                  }
                  size='large'
                  fullWidth
                  disabled={
                    generatePodcast.isPending ||
                    generatingWithAI ||
                    generatingMP3 ||
                    uploadingAudio
                  }
                  onClick={handleSubmit(manualSubmit)}
                >
                  {generatePodcast.isPending
                    ? 'Extracting Transcript...'
                    : 'Extract Transcript'}
                </Button>
              </Grid>

              {/* Generate with AI Button - Only show when transcript is available and not already generating */}
              {youtubeTranscript &&
                !generatingWithAI &&
                !generatedTranscript && (
                  <Grid item>
                    <Button
                      variant='contained'
                      color='secondary'
                      size='large'
                      fullWidth
                      onClick={generateWithOpenAI}
                      disabled={generatingMP3 || uploadingAudio}
                    >
                      Generate Podcast with AI
                    </Button>
                  </Grid>
                )}

              {/* Loading state for AI generation */}
              {generatingWithAI && (
                <Grid item>
                  <Button
                    variant='contained'
                    color='secondary'
                    size='large'
                    fullWidth
                    disabled
                    startIcon={<CircularProgress size={20} color='inherit' />}
                  >
                    Generating Podcast with AI...
                  </Button>
                </Grid>
              )}

              {/* Voice Type Selection - Only show when transcript is generated */}
              {generatedTranscript && !audioUrl && (
                <Grid item>
                  <Typography variant='subtitle1' gutterBottom>
                    Select Voice Type
                  </Typography>
                  <ToggleButtonGroup
                    value={voiceType}
                    exclusive
                    onChange={handleVoiceTypeChange}
                    aria-label='voice type'
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton
                      value='female'
                      aria-label='female voice'
                      disabled={generatingMP3 || uploadingAudio}
                    >
                      <WomanIcon sx={{ mr: 1 }} />
                      Female (Nova)
                    </ToggleButton>
                    <ToggleButton
                      value='male'
                      aria-label='male voice'
                      disabled={generatingMP3 || uploadingAudio}
                    >
                      <ManIcon sx={{ mr: 1 }} />
                      Male (Onyx)
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              )}

              {/* Generate MP3 Button - Only show when transcript is generated */}
              {generatedTranscript && !audioUrl && (
                <Grid item>
                  {generatingMP3 ? (
                    <Button
                      variant='contained'
                      color='success'
                      size='large'
                      fullWidth
                      disabled
                      startIcon={<CircularProgress size={20} color='inherit' />}
                    >
                      Generating MP3...
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      color='success'
                      endIcon={<AudioFileIcon />}
                      size='large'
                      fullWidth
                      onClick={handleGeneratePodcastMP3}
                      disabled={
                        patchAIGeneratedPodcast.isPending || uploadingAudio
                      }
                    >
                      Generate Podcast MP3
                    </Button>
                  )}
                </Grid>
              )}

              {/* Audio Player - Only show when MP3 is generated */}
              {audioUrl && (
                <Grid item>
                  <Typography variant='subtitle1' gutterBottom>
                    Your Generated Podcast
                  </Typography>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <audio controls src={audioUrl} style={{ width: '100%' }}>
                      Your browser does not support the audio element.
                    </audio>
                  </Box>
                  <Stack direction='row' spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant='outlined'
                      color='success'
                      size='medium'
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = audioUrl;
                        a.download = 'podcast.mp3';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      disabled={uploadingAudio}
                    >
                      Download MP3
                    </Button>

                    {/* Upload MP3 Button - Only show when MP3 is generated and not uploaded yet */}
                    {!audioUploaded ? (
                      uploadingAudio ? (
                        <Button
                          variant='contained'
                          color='info'
                          size='medium'
                          disabled
                          startIcon={
                            <CircularProgress size={20} color='inherit' />
                          }
                        >
                          Uploading to Server...
                        </Button>
                      ) : (
                        <Button
                          variant='contained'
                          color='info'
                          size='medium'
                          startIcon={<CloudUploadIcon />}
                          onClick={handleUploadAudio}
                        >
                          Upload to Server
                        </Button>
                      )
                    ) : (
                      <Button
                        variant='contained'
                        color='success'
                        size='medium'
                        disabled
                      >
                        Uploaded Successfully
                      </Button>
                    )}
                  </Stack>
                </Grid>
              )}

              {/* Reset Button */}
              <Grid item>
                <Button
                  variant='outlined'
                  size='medium'
                  fullWidth
                  onClick={handleReset}
                  disabled={
                    generatePodcast.isPending ||
                    generatingWithAI ||
                    generatingMP3 ||
                    uploadingAudio
                  }
                >
                  Reset Form
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Display YouTube Transcript */}
      {youtubeTranscript && (
        <Paper sx={{ p: 4, mt: 4 }} elevation={2}>
          <Typography variant='h5' gutterBottom>
            Original YouTube Transcript
          </Typography>
          <Box
            sx={{
              maxHeight: '300px',
              overflow: 'auto',
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
            }}
          >
            <Typography variant='body1' whiteSpace='pre-wrap'>
              {extractTranscriptFromResponse(youtubeTranscript)}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Display AI-Generated Transcript */}
      {generatedTranscript && (
        <Paper sx={{ p: 4, mt: 4 }} elevation={2}>
          <Typography variant='h5' gutterBottom>
            AI-Enhanced Podcast Transcript
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box
            sx={{
              maxHeight: '500px',
              overflow: 'auto',
              p: 2,
              position: 'relative',
            }}
          >
            {patchAIGeneratedPodcast.isPending && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant='body1'>
                  Finalizing your podcast transcript...
                </Typography>
              </Box>
            )}
            <Typography variant='body1' whiteSpace='pre-wrap'>
              {generatedTranscript}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;
