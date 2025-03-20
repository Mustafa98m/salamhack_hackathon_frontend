import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Grid,
  Divider,
  Paper,
  Slider,
  Chip,
  LinearProgress,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  MoreVert,
  VolumeUp,
  VolumeOff,
  YouTube,
  Download,
  Quiz as QuizIcon,
  ExpandMore,
  ArticleOutlined,
} from '@mui/icons-material';

const PodcastsPage = () => {
  const { data: allPodcasts } = useQuery({
    queryKey: ['podcasts'],
    queryFn: () => apiClient.get('/podcasts'),
  });

  const { data: allPodcastsAudio } = useQuery({
    queryKey: ['audio-files'],
    queryFn: () => apiClient.get('/audio-files'),
  });

  const navigate = useNavigate();
  const audioRef = useRef(null);

  // State for the active podcast and player
  const [activePodcast, setActivePodcast] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Find the audio file for a specific podcast
  const findAudioForPodcast = (podcastId) => {
    if (!allPodcastsAudio?.data?.array) return null;
    return (
      allPodcastsAudio.data.array.find(
        (audio) => audio.podcast_id === podcastId
      ) || null
    );
  };

  // Set up audio element when active podcast changes
  useEffect(() => {
    if (!activePodcast) return;

    const audioFile = findAudioForPodcast(activePodcast.id);
    if (!audioFile) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Use the specific backend URL where audio files are served
    const backendUrl = 'http://localhost:4321'; // Your backend URL
    const audioPath = audioFile.file_path;

    // Create the audio with the full backend URL path
    audioRef.current = new Audio(`${backendUrl}/${audioPath}`);

    console.log('Attempting to play audio from:', `${backendUrl}/${audioPath}`);

    // Set initial volume
    audioRef.current.volume = volume / 100;
    audioRef.current.muted = isMuted;

    // Add event listeners for the audio element
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', handleMetadataLoaded);
    audioRef.current.addEventListener('ended', handleAudioEnded);

    // Add error handling
    audioRef.current.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Error code:', audioRef.current.error?.code);
      console.error('Error message:', audioRef.current.error?.message);
    });

    // Play audio if isPlaying is true
    if (isPlaying) {
      const playPromise = audioRef.current.play();

      // Handle play promise (required for modern browsers)
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
          })
          .catch((error) => {
            console.error('Playback failed:', error);
            // Reset the playing state if autoplay fails
            setIsPlaying(false);
          });
      }
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener(
          'loadedmetadata',
          handleMetadataLoaded
        );
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current.pause();
      }
    };
  }, [activePodcast, allPodcastsAudio]);

  // Update audio element when isPlaying changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();

      // Handle play promise (required for modern browsers)
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Playback failed:', error);
          // This could be due to browser autoplay policy or other issues
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Update volume when volume state changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  // Update muted state when isMuted changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  // Format time for display (mm:ss)
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  // Handle metadata loaded
  const handleMetadataLoaded = () => {
    if (!audioRef.current) return;
    setAudioDuration(audioRef.current.duration);
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Handle play/pause
  const togglePlay = (podcast) => {
    const audioFile = findAudioForPodcast(podcast.id);

    // If there's no audio file, don't do anything
    if (!audioFile) return;

    if (activePodcast?.id === podcast.id) {
      setIsPlaying(!isPlaying);
    } else {
      // Stop the current playing audio if any
      if (audioRef.current) {
        audioRef.current.pause();
      }

      setActivePodcast(podcast);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  // Handle time slider change
  const handleTimeChange = (event, newValue) => {
    setCurrentTime(newValue);
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
    }
  };

  // Handle volume slider change
  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (newValue === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Handle download
  const handleDownload = (podcast) => {
    const audioFile = findAudioForPodcast(podcast.id);
    if (!audioFile) return;

    // Use the specific backend URL
    const backendUrl = 'http://localhost:4321';
    const audioPath = audioFile.file_path;
    const fullUrl = `${backendUrl}/${audioPath}`;

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = fullUrl;
    a.download = `${podcast.video.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Navigate to quiz
  const handleQuizClick = (podcastId) => {
    navigate(`/quiz/${podcastId}`);
  };

  // Check if podcasts exist
  const hasPodcasts = allPodcasts?.data?.array?.length > 0;

  // Debug audio availability
  const debugAudioState = () => {
    if (!allPodcastsAudio?.data?.array || !allPodcasts?.data?.array) {
      return 'Loading data...';
    }

    const audioFiles = allPodcastsAudio.data.array;
    const podcasts = allPodcasts.data.array;

    return {
      totalPodcasts: podcasts.length,
      totalAudioFiles: audioFiles.length,
      matchedPairs: podcasts.filter((p) =>
        audioFiles.some((a) => a.podcast_id === p.id)
      ).length,
      audioFileIds: audioFiles.map((a) => a.podcast_id),
      podcastIds: podcasts.map((p) => p.id),
    };
  };

  console.log('Debug - Audio State:', debugAudioState());

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Your Generated Podcasts
      </Typography>

      <Typography variant='body1' color='text.secondary' paragraph>
        Listen to AI-generated podcasts from YouTube video transcripts
      </Typography>

      <Grid container spacing={3}>
        {hasPodcasts &&
          allPodcasts.data.array.map((podcast) => {
            const audioFile = findAudioForPodcast(podcast.id);
            const hasAudio = !!audioFile;

            return (
              <Grid item xs={12} md={6} key={podcast.id}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    bgcolor:
                      activePodcast?.id === podcast.id
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'background.paper',
                    '&:hover': {
                      boxShadow: 3,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', p: 2 }}>
                    <CardMedia
                      component='img'
                      sx={{ width: 120, height: 68, borderRadius: 1 }}
                      image={podcast.video.image_path}
                      alt={podcast.video.title}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        pl: 2,
                        flex: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Tooltip title={podcast.video.title} placement='top'>
                        <Typography
                          component='div'
                          variant='h6'
                          noWrap
                          sx={{
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {podcast.video.title}
                        </Typography>
                      </Tooltip>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <YouTube fontSize='small' color='error' />
                        <Typography variant='body2' color='text.secondary'>
                          YouTube
                        </Typography>
                        {hasAudio && (
                          <Typography variant='body2' color='text.secondary'>
                            {audioFile && formatTime(audioDuration)}
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 0.5,
                          mt: 1,
                        }}
                      >
                        {podcast.video.keywords.map((topic, index) => (
                          <Chip
                            key={index}
                            label={topic.keyword}
                            size='small'
                            variant='outlined'
                          />
                        ))}
                        {podcast.video.keywords[0]?.user_level && (
                          <Chip
                            label={`Level: ${
                              podcast.video.keywords[0].user_level === 1
                                ? 'A1'
                                : podcast.video.keywords[0].user_level === 2
                                ? 'A2'
                                : podcast.video.keywords[0].user_level === 3
                                ? 'B1'
                                : podcast.video.keywords[0].user_level === 4
                                ? 'B2'
                                : podcast.video.keywords[0].user_level === 5
                                ? 'C1'
                                : 'C2'
                            }`}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  <CardActions
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {hasAudio ? (
                        <IconButton
                          aria-label={
                            isPlaying && activePodcast?.id === podcast.id
                              ? 'pause'
                              : 'play'
                          }
                          onClick={() => togglePlay(podcast)}
                          color='primary'
                          disabled={!hasAudio}
                        >
                          {isPlaying && activePodcast?.id === podcast.id ? (
                            <Pause />
                          ) : (
                            <PlayArrow />
                          )}
                        </IconButton>
                      ) : (
                        <Tooltip title='No audio available'>
                          <span>
                            <IconButton
                              aria-label='no audio'
                              color='disabled'
                              disabled
                            >
                              <PlayArrow />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      <Typography variant='body2' color='text.secondary'>
                        {new Date(podcast.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        startIcon={<QuizIcon />}
                        size='small'
                        variant='outlined'
                        color='primary'
                        onClick={() => handleQuizClick(podcast.id)}
                        sx={{ mr: 1 }}
                      >
                        Take Quiz
                      </Button>

                      {hasAudio && (
                        <IconButton
                          aria-label='download'
                          onClick={() => handleDownload(podcast)}
                        >
                          <Download />
                        </IconButton>
                      )}
                      <IconButton aria-label='more options'>
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </CardActions>

                  {activePodcast?.id === podcast.id && hasAudio && (
                    <Box sx={{ p: 2, pt: 0 }}>
                      <LinearProgress
                        variant='determinate'
                        value={(currentTime / audioDuration) * 100 || 0}
                        sx={{ height: 4, borderRadius: 1 }}
                      />
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
                      >
                        <Typography variant='caption' color='text.secondary'>
                          {formatTime(currentTime)}
                        </Typography>
                        <Slider
                          size='small'
                          value={currentTime}
                          max={audioDuration || 100}
                          onChange={handleTimeChange}
                          aria-label='time'
                          sx={{ mx: 2 }}
                        />
                        <Typography variant='caption' color='text.secondary'>
                          {formatTime(audioDuration)}
                        </Typography>
                        <IconButton size='small' onClick={toggleMute}>
                          {isMuted ? (
                            <VolumeOff fontSize='small' />
                          ) : (
                            <VolumeUp fontSize='small' />
                          )}
                        </IconButton>
                        <Slider
                          size='small'
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          aria-label='volume'
                          sx={{ width: 80, ml: 1 }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Accordion for AI Generated Text */}
                  {podcast.ai_generated_text && (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls={`podcast-${podcast.id}-content`}
                        id={`podcast-${podcast.id}-header`}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ArticleOutlined sx={{ mr: 1 }} />
                          <Typography>AI Generated Text</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          variant='body2'
                          sx={{
                            whiteSpace: 'pre-line',
                            maxHeight: '300px',
                            overflow: 'auto',
                          }}
                        >
                          {podcast.ai_generated_text}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Card>
              </Grid>
            );
          })}
      </Grid>

      {!hasPodcasts && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant='h6'>No podcasts generated yet</Typography>
          <Typography variant='body1' color='text.secondary'>
            Go to the dashboard to generate your first podcast from a YouTube
            video
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default PodcastsPage;
