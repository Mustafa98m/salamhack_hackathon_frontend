import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import { useAuth } from '../context/AuthContext'; // Update with your actual path
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Avatar,
  Container,
  Paper,
  Alert, // Add Alert for error messages
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // Added error state

  const navigate = useNavigate(); // Hook for navigation after login
  const { login, loginIsLoading } = useAuth(); // Get auth functions and state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors

    try {
      // Call the login function from auth context
      const success = await login({
        email,
        password,
        rememberMe,
      });

      if (success) {
        // If login was successful, navigate to dashboard or home
        navigate('/dashboard'); // Update with your target route
      }
    } catch (error) {
      // Handle login errors
      console.error('Login failed:', error);
      setError(
        error.response?.data?.message ||
          'Login failed. Please check your credentials and try again.'
      );
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component='main' maxWidth='xs'>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <EmailIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography component='h1' variant='h5' sx={{ mt: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Enter your credentials to access your account
          </Typography>

          {/* Error message display */}
          {error && (
            <Alert severity='error' sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component='form'
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <EmailIcon color='action' />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type={showPassword ? 'text' : 'password'}
              id='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <LockIcon color='action' />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleClickShowPassword}
                      edge='end'
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value='remember'
                  color='primary'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label='Remember me'
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loginIsLoading}
            >
              {loginIsLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            {/* Optional: Add password recovery link or signup link */}
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
              <Typography variant='body2'>
                <a
                  href='/forgot-password'
                  style={{ textDecoration: 'none', color: 'primary.main' }}
                >
                  Forgot password?
                </a>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginComponent;
