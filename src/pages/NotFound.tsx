import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Container maxWidth='md'>
        <Paper
          elevation={3}
          sx={{
            py: 5,
            px: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography variant='h1' sx={{ fontWeight: 'bold', mb: 2 }}>
            404
          </Typography>

          <Typography variant='h4' sx={{ mb: 2 }}>
            Page Not Found
          </Typography>

          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ mb: 4, maxWidth: '60%' }}
          >
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </Typography>

          <Button
            variant='contained'
            startIcon={<HomeIcon />}
            component={RouterLink}
            to='/'
            size='large'
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;
