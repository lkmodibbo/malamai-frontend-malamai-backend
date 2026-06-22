import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your computer's actual IP address
// Do NOT use localhost — your phone/emulator cannot reach it
const BASE_URL = 'http://192.168.146.202/api';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function getToken() {
  return await AsyncStorage.getItem('auth_token');
}

async function request(endpoint, options = {}) {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function register(name, email, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  // Save token automatically after register
  await AsyncStorage.setItem('auth_token', data.token);
  await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
  return data;
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  // Save token automatically after login
  await AsyncStorage.setItem('auth_token', data.token);
  await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
  return data;
}

export async function logout() {
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('auth_user');
}

export async function getMe() {
  return await request('/auth/me');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBJECTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getSubjects() {
  return await request('/subjects');
}

export async function getTopics(subjectId) {
  return await request(`/subjects/${subjectId}/topics`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUESTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getQuestions(subjectId, topicId, count = 5) {
  return await request(
    `/questions?subject=${subjectId}&topic=${topicId}&count=${count}`
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUIZ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function saveQuizAttempt(attemptData) {
  return await request('/quiz/attempt', {
    method: 'POST',
    body: JSON.stringify(attemptData),
  });
}

export async function getQuizHistory() {
  return await request('/quiz/history');
}

export async function getQuizStats() {
  return await request('/quiz/stats');
}