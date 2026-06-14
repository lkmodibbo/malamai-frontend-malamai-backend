import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXAM_DATE_KEY = 'exam_date';
const EXAM_START_KEY = 'exam_start_date';
const MS_PER_DAY = 86400000;

async function getStoredDate(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn('[useExamCountdown] failed to read date', error);
    return null;
  }
}

async function persistDate(key, date) {
  try {
    await AsyncStorage.setItem(key, date.toISOString());
  } catch (error) {
    console.warn('[useExamCountdown] failed to save date', error);
  }
}

export default function useExamCountdown() {
  const [examDate, setExamDateState] = useState(null);
  const [startDate, setStartDateState] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDates = useCallback(async () => {
    const storedExam = await getStoredDate(EXAM_DATE_KEY);
    const storedStart = await getStoredDate(EXAM_START_KEY);
    setExamDateState(storedExam);
    setStartDateState(storedStart);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  const setExamDate = useCallback(async (date) => {
    const parsed = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid date provided.');
    }

    const existingStart = startDate || new Date();
    await persistDate(EXAM_DATE_KEY, parsed);
    if (!startDate) {
      await persistDate(EXAM_START_KEY, existingStart);
    }
    setExamDateState(parsed);
    setStartDateState(existingStart);
    return parsed;
  }, [startDate]);

  const daysRemaining = useMemo(() => {
    if (!examDate) return null;
    const now = new Date();
    const diff = examDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
    return Math.ceil(diff / MS_PER_DAY);
  }, [examDate]);

  const progressPercent = useMemo(() => {
    if (!examDate || !startDate) return 0;
    const now = new Date().getTime();
    const startMs = startDate.getTime();
    const endMs = examDate.getTime();
    if (endMs <= startMs) return 100;
    const elapsed = Math.min(Math.max(now - startMs, 0), endMs - startMs);
    return Math.round((elapsed / (endMs - startMs)) * 100);
  }, [examDate, startDate]);

  return {
    examDate,
    startDate,
    daysRemaining,
    progressPercent,
    setExamDate,
    loading,
  };
}
