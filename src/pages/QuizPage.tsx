import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  NavigateNext,
  NavigateBefore,
  Flag,
  Headset,
  YouTube,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/reactQuery';

const QuizPage = () => {
  const navigate = useNavigate();
  const { podcastId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch quiz data
  const {
    data: quizData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['quiz', podcastId],
    queryFn: () => apiClient.get(`/exercises/podcast/${podcastId}`),
  });

  // State for quiz
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [questionStatuses, setQuestionStatuses] = useState([]); // Track status from server

  // If questions have statuses, show their saved state
  useEffect(() => {
    // Initialize from the API data if it exists
    if (quizData?.array && quizData.array.length > 0) {
      const questions = quizData.array;

      // Check if questions already have responses
      const existingAnswers = Array(questions.length).fill(null);
      const existingStatuses = [];
      let hasSubmittedAnswers = false;

      questions.forEach((question, index) => {
        existingStatuses[index] = {
          status: question.status || '',
          user_answer: question.user_answer || '',
        };

        // If there's a user_answer, find its index
        if (question.user_answer) {
          const answerIndex = question.answer_choices.findIndex(
            (choice) => choice === question.user_answer
          );
          if (answerIndex !== -1) {
            existingAnswers[index] = answerIndex;
            hasSubmittedAnswers = true;
          }
        }
      });

      setAnswers(existingAnswers);
      setQuestionStatuses(existingStatuses);

      // If they've answered questions previously, set as submitted
      if (hasSubmittedAnswers) {
        setQuizSubmitted(true);
      }
    }
  }, [quizData]);

  if (isLoading)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>
          <AlertTitle>Error</AlertTitle>
          Error loading quiz: {error.message}
        </Alert>
      </Box>
    );

  if (!quizData?.array || quizData.array.length === 0)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='info'>
          <AlertTitle>No Quiz Available</AlertTitle>
          There are no questions available for this podcast.
        </Alert>
      </Box>
    );

  const questions = quizData.array;

  // Get podcast title from the first question
  const podcastTitle =
    questions[0]?.podcast?.ai_generated_text
      ?.split('\n')[0]
      ?.replace('**Title:** "', '')
      ?.replace('"', '') || 'Quiz';
  const videoUrl = questions[0]?.podcast?.video?.youtube_url || '';

  // Handle option selection
  const handleOptionSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[activeStep] = optionIndex;
    setAnswers(newAnswers);
  };

  // Navigate to next question
  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, questions.length - 1));
  };

  // Navigate to previous question
  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  // Jump to specific question
  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  // Submit quiz, save user answers to server, and calculate score
  const handleSubmit = async () => {
    let correctCount = 0;
    const statusResults = [];

    try {
      // Save each answer to the server
      const savePromises = questions.map((question, index) => {
        const userSelectedOption = question.answer_choices[answers[index]];

        // Send the user's answer to the server
        return apiClient.patch(`/exercises/${question.id}`, {
          user_answer: userSelectedOption,
        });
      });

      // Wait for all answers to be saved
      const responses = await Promise.all(savePromises);

      // Process responses to get statuses and correct count
      responses.forEach((response, index) => {
        const questionResult = response.data;
        statusResults[index] = questionResult;

        if (questionResult.status === 'Correct') {
          correctCount++;
        }
      });

      // Save the status results
      setQuestionStatuses(statusResults);

      const calculatedScore = Math.round(
        (correctCount / questions.length) * 100
      );
      setScore(calculatedScore);
      setQuizSubmitted(true);
      setResultDialogOpen(true);
    } catch (error) {
      console.error('Error saving quiz answers:', error);
      // Show error message to user
      alert('There was an error saving your answers. Please try again.');
    }
  };

  // Check if all questions are answered
  const isQuizComplete = answers.length > 0 && !answers.includes(null);

  // Get current question
  const currentQuestion = questions[activeStep];

  // Find correct answer index for current question
  const correctAnswerIndex = currentQuestion.answer_choices.findIndex(
    (choice) => choice === currentQuestion.correct_answer
  );

  // Check if current answer is correct (only shown after submission)
  const isCurrentAnswerCorrect =
    quizSubmitted &&
    questionStatuses[activeStep] &&
    questionStatuses[activeStep].status === 'Correct';

  // Open YouTube video in new tab
  const handleOpenVideo = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  // For responsive stepper, group questions into chunks for mobile
  const renderStepper = () => {
    // If mobile, show only a range of steps around the active step
    if (isMobile) {
      const visibleSteps = 5; // Number of steps to show on mobile
      const halfVisible = Math.floor(visibleSteps / 2);

      let startStep = Math.max(0, activeStep - halfVisible);
      let endStep = Math.min(
        questions.length - 1,
        startStep + visibleSteps - 1
      );

      // Adjust start if we're near the end
      if (endStep === questions.length - 1) {
        startStep = Math.max(0, endStep - visibleSteps + 1);
      }

      return (
        <Box sx={{ mb: 3 }}>
          <Typography variant='body2' sx={{ mb: 1, textAlign: 'center' }}>
            Question {activeStep + 1} of {questions.length}
          </Typography>
          <Stepper
            alternativeLabel
            nonLinear
            activeStep={activeStep}
            sx={{ overflowX: 'hidden' }}
          >
            {questions.slice(startStep, endStep + 1).map((question, index) => (
              <Step
                key={startStep + index}
                completed={answers[startStep + index] !== null}
              >
                <StepButton onClick={() => handleStepClick(startStep + index)}>
                  {startStep + index + 1}
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>
      );
    }

    // For desktop, show all steps but with numbers instead of "Question X"
    return (
      <Box sx={{ mb: 3, overflowX: 'auto', py: 1 }}>
        <Stepper
          alternativeLabel
          nonLinear
          activeStep={activeStep}
          sx={{ minWidth: questions.length * 80 }}
        >
          {questions.map((question, index) => (
            <Step key={question.id} completed={answers[index] !== null}>
              <StepButton onClick={() => handleStepClick(index)}>
                {index + 1}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant='h5' gutterBottom>
        {podcastTitle}
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Headset sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant='body1' noWrap>
                {podcastTitle}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              }}
            >
              {videoUrl && (
                <Chip
                  icon={<YouTube />}
                  label='Watch Original Video'
                  clickable
                  color='error'
                  variant='outlined'
                  onClick={handleOpenVideo}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Question Stepper */}
      {renderStepper()}

      {/* Current Question */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={`Question ${activeStep + 1} of ${questions.length}`}
          action={
            quizSubmitted &&
            (isCurrentAnswerCorrect ? (
              <Chip icon={<CheckCircle />} label='Correct' color='success' />
            ) : (
              <Chip icon={<Cancel />} label='Incorrect' color='error' />
            ))
          }
        />
        <Divider />
        <CardContent>
          <Typography variant='h6' paragraph>
            {currentQuestion.question}
          </Typography>

          <FormControl component='fieldset' fullWidth>
            {/* We need to use a key that changes with the activeStep to force RadioGroup to re-render */}
            <RadioGroup
              key={`question-${activeStep}`}
              value={
                answers[activeStep] !== null
                  ? answers[activeStep]?.toString()
                  : ''
              }
              onChange={(e) => handleOptionSelect(parseInt(e.target.value))}
            >
              {currentQuestion.answer_choices.map((option, index) => (
                <FormControlLabel
                  key={`option-${activeStep}-${index}`}
                  value={index?.toString()}
                  control={
                    <Radio
                      checked={answers[activeStep] === index}
                      color={
                        quizSubmitted
                          ? index === correctAnswerIndex
                            ? 'success'
                            : answers[activeStep] === index
                            ? 'error'
                            : 'primary'
                          : 'primary'
                      }
                      disabled={quizSubmitted}
                    />
                  }
                  label={option}
                  sx={{
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    ...(quizSubmitted &&
                      index === correctAnswerIndex && {
                        bgcolor: 'success.light',
                        color: 'success.contrastText',
                        borderColor: 'success.main',
                      }),
                    ...(quizSubmitted &&
                      answers[activeStep] === index &&
                      index !== correctAnswerIndex && {
                        bgcolor: 'error.light',
                        color: 'error.contrastText',
                        borderColor: 'error.main',
                      }),
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {quizSubmitted && (
            <Alert
              severity={isCurrentAnswerCorrect ? 'success' : 'error'}
              sx={{ mt: 3 }}
            >
              <AlertTitle>
                {isCurrentAnswerCorrect ? 'Correct!' : 'Incorrect'}
              </AlertTitle>
              {isCurrentAnswerCorrect
                ? 'Great job! Your answer is correct.'
                : questionStatuses[activeStep]
                ? `The correct answer is: ${currentQuestion.correct_answer}. You answered: ${questionStatuses[activeStep].user_answer}`
                : `The correct answer is: ${currentQuestion.correct_answer}`}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Button
          variant='outlined'
          startIcon={<NavigateBefore />}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Previous
        </Button>

        <Box>
          {!quizSubmitted && (
            <Button
              variant='contained'
              color='primary'
              endIcon={<Flag />}
              onClick={handleSubmit}
              disabled={!isQuizComplete}
            >
              Submit Quiz
            </Button>
          )}

          {quizSubmitted && (
            <Button
              variant='outlined'
              color='primary'
              onClick={() => navigate('/podcasts')}
            >
              Back to Podcasts
            </Button>
          )}
        </Box>

        <Button
          variant='outlined'
          endIcon={<NavigateNext />}
          onClick={handleNext}
          disabled={activeStep === questions.length - 1}
        >
          Next
        </Button>
      </Box>

      {/* Results Dialog */}
      <Dialog
        open={resultDialogOpen}
        onClose={() => setResultDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Quiz Results</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress
                variant='determinate'
                value={score || 0}
                size={120}
                thickness={5}
                sx={{ color: score >= 70 ? 'success.main' : 'warning.main' }}
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
                <Typography variant='h4' component='div'>
                  {score}%
                </Typography>
              </Box>
            </Box>

            <Typography variant='h6' gutterBottom>
              {score >= 80
                ? 'Excellent!'
                : score >= 60
                ? 'Good Job!'
                : 'Keep Practicing!'}
            </Typography>

            <Typography variant='body1' paragraph>
              You answered{' '}
              {
                answers.filter((answer, index) => {
                  return (
                    questionStatuses[index] &&
                    questionStatuses[index].status === 'Correct'
                  );
                }).length
              }{' '}
              out of {questions.length} questions correctly.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Alert severity={score >= 70 ? 'success' : 'info'}>
                <AlertTitle>Recommendation</AlertTitle>
                {score >= 80
                  ? 'You have a great understanding of this topic. Ready for more advanced content!'
                  : score >= 60
                  ? "You're doing well! Review the explanations for questions you missed."
                  : 'Consider reviewing the podcast again to strengthen your understanding.'}
              </Alert>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialogOpen(false)}>
            Review Answers
          </Button>
          <Button variant='contained' onClick={() => navigate('/progress')}>
            See Progress
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizPage;
