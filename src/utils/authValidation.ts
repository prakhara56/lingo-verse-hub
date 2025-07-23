export const validateSignInInput = (emailOrUsername: string, password: string) => {
  if (!emailOrUsername.trim()) {
    return 'Email or username is required';
  }

  if (!password.trim()) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  return null;
};

export const validateSignUpInput = (email: string, password: string, username: string) => {
  if (!email.trim()) {
    return 'Email is required';
  }

  if (!email.includes('@') || !email.includes('.')) {
    return 'Please enter a valid email address';
  }

  if (!password.trim()) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!username || username.trim() === '') {
    return 'Username is required';
  }

  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }

  return null;
};

export const isEmail = (input: string): boolean => {
  return input.includes('@') && input.includes('.');
};