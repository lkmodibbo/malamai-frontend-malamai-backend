import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { login, register } from '../src/utils/apiService';
import { COLORS } from '../src/constants/colors';
import { isOnboardingComplete } from '../src/hooks/useStudentProfile';

const loginSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const registerSchema = Yup.object({
  name: Yup.string().min(2, 'Name is too short').required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

function Field({ label, error, touched, ...props }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, touched && error && styles.inputError]}
        placeholderTextColor={COLORS.textLight}
        {...props}
      />
      {touched && error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError('');
    try {
      if (isLogin) {
        await login(values.email.trim(), values.password);
      } else {
        await register(values.name.trim(), values.email.trim(), values.password);
      }
      const onboardingDone = await isOnboardingComplete();
      navigation.replace(onboardingDone ? 'MainTabs' : 'Onboarding');
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setServerError('');
    setIsLogin((v) => !v);
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.appName}>CrackJAMB</Text>
            <Text style={styles.tagline}>
              {isLogin ? 'Welcome back! Ka yi kyau!' : 'Create your free account'}
            </Text>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => { setIsLogin(true); setServerError(''); }}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => { setIsLogin(false); setServerError(''); }}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <Formik
            key={isLogin ? 'login' : 'register'}
            initialValues={
              isLogin
                ? { email: '', password: '' }
                : { name: '', email: '', password: '', confirmPassword: '' }
            }
            validationSchema={isLogin ? loginSchema : registerSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit: submit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                {!isLogin && (
                  <Field
                    label="Full name"
                    placeholder="Your full name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={errors.name}
                    touched={touched.name}
                    autoCapitalize="words"
                  />
                )}

                <Field
                  label="Email address"
                  placeholder="you@example.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={errors.email}
                  touched={touched.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Field
                  label="Password"
                  placeholder="Min. 6 characters"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={errors.password}
                  touched={touched.password}
                  secureTextEntry
                />

                {!isLogin && (
                  <Field
                    label="Confirm password"
                    placeholder="Re-enter your password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                    secureTextEntry
                  />
                )}

                {serverError ? (
                  <View style={styles.serverError}>
                    <Text style={styles.serverErrorText}>{serverError}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                  onPress={submit}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting
                    ? <ActivityIndicator color="#ffffff" />
                    : <Text style={styles.submitBtnText}>
                        {isLogin ? 'Login →' : 'Create Account →'}
                      </Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchBtn} onPress={switchMode}>
                  <Text style={styles.switchText}>
                    {isLogin
                      ? "Don't have an account? Register"
                      : 'Already have an account? Login'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  flex: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },

  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  backText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 14,
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 28 },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontWeight: '700', color: COLORS.textMuted, fontSize: 14 },
  tabTextActive: { color: '#ffffff' },

  form: { gap: 4 },

  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf0f0',
  },
  fieldError: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  serverError: {
    backgroundColor: '#fdf0f0',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f5c6cb',
    marginBottom: 4,
  },
  serverErrorText: {
    color: '#c0392b',
    fontSize: 13,
    textAlign: 'center',
  },

  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { backgroundColor: COLORS.disabled },
  submitBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },

  switchBtn: { alignItems: 'center', marginTop: 18 },
  switchText: { color: COLORS.secondary, fontWeight: '600', fontSize: 13 },
});
