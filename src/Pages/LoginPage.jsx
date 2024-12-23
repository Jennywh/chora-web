import React, { useState } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// MUI Components
import {
  Container,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // "login" or "signup"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleToggle = (event, newMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  async function handleSignUp(e) {
    e.preventDefault();
    try {
      // Create the user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email: user.email,
        groupId: '',
      });

      navigate('/home');
    } catch (error) {
      console.error('Sign up error:', error.message);
    }
  }

  async function handleSignIn(e) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      console.error('Sign in error:', error.message);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ marginTop: 8 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Welcome! Please {mode === 'login' ? 'Sign In' : 'Sign Up'}
        </Typography>

        {/* Tabs for Toggle */}
        <Tabs
          value={mode}
          onChange={handleToggle}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Sign In" value="login" />
          <Tab label="Sign Up" value="signup" />
        </Tabs>

        <Box
          component="form"
          onSubmit={mode === 'login' ? handleSignIn : handleSignUp}
          sx={{ marginTop: 2 }}
        >
          {/* Username Field for Sign Up */}
          {mode === 'signup' && (
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
            />
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
          >
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
