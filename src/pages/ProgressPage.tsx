// File: src/pages/ProgressPage.jsx

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  DonutLarge,
  Schedule,
  Star,
  StarHalf,
  StarBorder,
} from '@mui/icons-material';

// Mock user progress data
const userProgress = {
  overallScore: 78,
  quizzesCompleted: 15,
  totalQuestions: 120,
  correctAnswers: 94,
  streakDays: 7,
  vocabularyLearned: 142,
  skillImprovements: [
    { skill: 'Listening', improvement: 68 },
    { skill: 'Vocabulary', improvement: 83 },
    { skill: 'Comprehension', improvement: 75 },
    { skill: 'Cultural Context', improvement: 62 },
  ],
  recentQuizzes: [
    {
      id: 1,
      podcastTitle: 'How Artificial Intelligence is Changing the World',
      date: '2025-03-12',
      score: 85,
      questionsCount: 8,
      correctCount: 7,
      timeSpent: '6:24',
    },
    {
      id: 2,
      podcastTitle: 'The Future of Web Development 2025',
      date: '2025-03-10',
      score: 75,
      questionsCount: 10,
      correctCount: 8,
      timeSpent: '8:15',
    },
    {
      id: 3,
      podcastTitle: 'Understanding Quantum Computing Basics',
      date: '2025-03-07',
      score: 70,
      questionsCount: 10,
      correctCount: 7,
      timeSpent: '9:30',
    },
    {
      id: 4,
      podcastTitle: 'How to Master English Pronunciation',
      date: '2025-03-05',
      score: 90,
      questionsCount: 8,
      correctCount: 7,
      timeSpent: '5:45',
    },
  ],
  weeklyActivity: [
    { day: 'Mon', minutes: 15 },
    { day: 'Tue', minutes: 25 },
    { day: 'Wed', minutes: 20 },
    { day: 'Thu', minutes: 30 },
    { day: 'Fri', minutes: 15 },
    { day: 'Sat', minutes: 45 },
    { day: 'Sun', minutes: 25 },
  ],
  levelProgress: {
    currentLevel: 'B1',
    progressToNextLevel: 65,
    nextLevel: 'B2',
  },
};

// Helper function to render stars based on score
const renderStars = (score) => {
  const stars = [];
  const fullStars = Math.floor(score / 20);
  const halfStar = score % 20 >= 10;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} color='primary' />);
    } else if (i === fullStars && halfStar) {
      stars.push(<StarHalf key={i} color='primary' />);
    } else {
      stars.push(<StarBorder key={i} color='primary' />);
    }
  }

  return stars;
};

const ProgressPage = () => {
  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Your Learning Progress
      </Typography>

      <Typography variant='body1' color='text.secondary' paragraph>
        Track your English learning journey through podcast quizzes
      </Typography>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
              <CircularProgress
                variant='determinate'
                value={userProgress.overallScore}
                size={80}
                thickness={5}
                sx={{ color: 'primary.main' }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant='h5' component='div'>
                  {userProgress.overallScore}%
                </Typography>
              </Box>
            </Box>
            <Typography variant='h6'>Overall Score</Typography>
            <Typography variant='body2' color='text.secondary'>
              Based on all quiz results
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant='h6'>
              {userProgress.quizzesCompleted} Quizzes
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {userProgress.correctAnswers} of {userProgress.totalQuestions}{' '}
              questions correct
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <DonutLarge sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant='h6'>
              {userProgress.vocabularyLearned} Words
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              New vocabulary mastered
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant='h6'>
              {userProgress.streakDays} Day Streak
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Keep it going!
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Level Progress */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant='h6' gutterBottom>
          English Level Progress
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip
            label={userProgress.levelProgress.currentLevel}
            color='primary'
            sx={{ mr: 2 }}
          />
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant='determinate'
              value={userProgress.levelProgress.progressToNextLevel}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Chip
            label={userProgress.levelProgress.nextLevel}
            variant='outlined'
            color='primary'
            sx={{ ml: 2 }}
          />
        </Box>

        <Typography variant='body2' color='text.secondary'>
          You're {userProgress.levelProgress.progressToNextLevel}% of the way to
          reaching {userProgress.levelProgress.nextLevel} level. Keep
          practicing!
        </Typography>
      </Paper>

      {/* Skills Improvement */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title='Skills Improvement'
              subheader='Based on quiz performance'
            />
            <Divider />
            <CardContent>
              {userProgress.skillImprovements.map((skill) => (
                <Box key={skill.skill} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant='body2'>{skill.skill}</Typography>
                    <Typography variant='body2'>
                      {skill.improvement}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={skill.improvement}
                    sx={{
                      height: 8,
                      borderRadius: 5,
                      bgcolor: 'grey.200',
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title='Weekly Activity'
              subheader='Minutes spent on quizzes'
            />
            <Divider />
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  height: 150,
                  pt: 2,
                }}
              >
                {userProgress.weeklyActivity.map((day) => (
                  <Box
                    key={day.day}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '12%',
                    }}
                  >
                    <Box
                      sx={{
                        height: `${(day.minutes / 45) * 100}%`,
                        width: '100%',
                        bgcolor: 'primary.main',
                        borderRadius: '4px 4px 0 0',
                        mt: 'auto',
                        minHeight: 5,
                      }}
                    />
                    <Typography variant='caption' sx={{ mt: 1 }}>
                      {day.day}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Quiz Results */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant='h6' gutterBottom>
            Recent Quiz Results
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Podcast</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userProgress.recentQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell sx={{ maxWidth: 250 }}>
                    <Typography variant='body2' noWrap>
                      {quiz.podcastTitle}
                    </Typography>
                  </TableCell>
                  <TableCell>{quiz.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${quiz.score}% (${quiz.correctCount}/${quiz.questionsCount})`}
                      color={
                        quiz.score >= 80
                          ? 'success'
                          : quiz.score >= 60
                          ? 'primary'
                          : 'warning'
                      }
                      size='small'
                    />
                  </TableCell>
                  <TableCell>{quiz.timeSpent}</TableCell>
                  <TableCell>
                    <Stack direction='row'>{renderStars(quiz.score)}</Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ProgressPage;
