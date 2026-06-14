import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'student_profile';
const ONBOARDING_KEY = 'onboarding_complete';

function parseProfile(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    return {
      name: parsed.name || '',
      selectedSubjects: Array.isArray(parsed.selectedSubjects) && parsed.selectedSubjects.length > 0
        ? parsed.selectedSubjects
        : ['english'],
      examDate: parsed.examDate ? new Date(parsed.examDate) : null,
    };
  } catch (error) {
    console.warn('[useStudentProfile] parseProfile failed', error);
    return null;
  }
}

export async function getProfile() {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return parseProfile(raw) || { name: '', selectedSubjects: ['english'], examDate: null };
  } catch (error) {
    console.warn('[useStudentProfile] getProfile failed', error);
    return { name: '', selectedSubjects: ['english'], examDate: null };
  }
}

export async function saveProfile(profile) {
  try {
    const normalized = {
      name: (profile.name || '').trim(),
      selectedSubjects: Array.isArray(profile.selectedSubjects) && profile.selectedSubjects.length > 0
        ? profile.selectedSubjects
        : ['english'],
      examDate: profile.examDate instanceof Date ? profile.examDate.toISOString() : new Date(profile.examDate).toISOString(),
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(normalized));
    return {
      name: normalized.name,
      selectedSubjects: normalized.selectedSubjects,
      examDate: new Date(normalized.examDate),
    };
  } catch (error) {
    console.warn('[useStudentProfile] saveProfile failed', error);
    throw error;
  }
}

export async function isOnboardingComplete() {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
    return raw === 'true';
  } catch (error) {
    console.warn('[useStudentProfile] isOnboardingComplete failed', error);
    return false;
  }
}

export async function setOnboardingComplete(value = true) {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, value ? 'true' : 'false');
  } catch (error) {
    console.warn('[useStudentProfile] setOnboardingComplete failed', error);
  }
}

export default function useStudentProfile() {
  const [profile, setProfile] = useState({ name: '', selectedSubjects: ['english'], examDate: null });
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const nextProfile = await getProfile();
    setProfile(nextProfile);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfileState = useCallback(async (nextProfile) => {
    const saved = await saveProfile({ ...profile, ...nextProfile });
    setProfile(saved);
    return saved;
  }, [profile]);

  return {
    profile,
    loading,
    saveProfile: saveProfileState,
    reloadProfile: loadProfile,
  };
}
