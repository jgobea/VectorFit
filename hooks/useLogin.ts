import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

const REMEMBERED_EMAIL_KEY = 'vectorfit-remembered-email';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(REMEMBERED_EMAIL_KEY).then((saved) => {
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    });
  }, []);

  const emailError = emailTouched && !EMAIL_REGEX.test(email) ? 'Enter a valid email address' : undefined;
  const passwordError = passwordTouched && password.length === 0 ? 'Password is required' : undefined;
  const canSubmit = EMAIL_REGEX.test(email) && password.length > 0 && !isSubmitting;

  async function submit() {
    setEmailTouched(true);
    setPasswordTouched(true);
    setFormError(null);

    if (!EMAIL_REGEX.test(email) || password.length === 0) return;

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, rememberMe ? email : '');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    emailError,
    passwordError,
    formError,
    isSubmitting,
    canSubmit,
    onEmailBlur: () => setEmailTouched(true),
    onPasswordBlur: () => setPasswordTouched(true),
    submit,
  };
}
