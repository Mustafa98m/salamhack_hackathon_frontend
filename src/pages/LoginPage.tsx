// File: src/pages/LoginPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginComponent from '../auth/login'; // Your MUI login component
import { Box, Alert, Snackbar } from '@mui/material';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogin = async (email, password) => {
    try {
      // In a real application, you would make an API call here
      // This is just a mock example

      // Simulate API call
      const mockApiCall = () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // For preview: accept the specific email and password
            if (
              email === 'mustafa.omar@qaflab.com' &&
              password === '98191998'
            ) {
              resolve({
                user: {
                  id: 1,
                  name: 'Mustafa Omar',
                  email: email,
                },
                token: 'mock-jwt-token-123456789',
              });
            } else {
              reject(
                new Error(
                  'Invalid credentials. For preview, use mustafa.omar@qaflab.com with password 98191998'
                )
              );
            }
          }, 1000);
        });
      };

      // Call mock API
      const response = await mockApiCall();

      // Save auth data and redirect to dashboard
      login(response.user, response.token);

      // Add a slight delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);

      return true;
    } catch (err) {
      setError(err.message || 'Failed to login');
      setOpenSnackbar(true);
      return false;
    }
  };

  // Handle login form submission
  const handleLoginSubmit = async (e, { email, password }) => {
    e.preventDefault();
    return await handleLogin(email, password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      {/* Pass needed props to your login component */}
      <LoginComponent onSubmit={handleLoginSubmit} />

      {/* Error notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity='error'
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
