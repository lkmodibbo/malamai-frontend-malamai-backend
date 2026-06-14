import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { callGemini, normalizeQuestionList, parseQuestionJson } from '../src/utils/gemini';
import SUBJECTS from '../constants/subjects';

const EXAM_SECONDS = 90 * 60;
const QUESTION_COUNT = 40;

function getTimerText(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;
  return `${minutes}:${String(remSeconds).padStart(2, '0')}`;
}

function getSubjectPrompt(subjectName) {
  return `You are MalamAI, a patient JAMB tutor. Generate exactly ${QUESTION_COUNT} unique multiple choice 
          JAMB-style questions for the subject "${subjectName}". Each question must have four options labeled A, B, C, D 
          and exactly one correct answer. Return valid JSON only in this format:\n{\n  "questions": [\n    {\n      "question": "...",\n     
           "options": {"A": "...", "B": "...", "C": "...", "D": "..."},\n      "answer": "A",\n      "explanation": "..."\n    }\n  ]\n}`;
}

export default function MockExamScreen({ route, navigation }) {
  const { subjectIds = [] } = route.params || {};
  const [loadStatus, setLoadStatus] = useState(() => subjectIds.reduce((acc, id) => ({ ...acc, [id]: false }), {}));
  const [questionsBySubject, setQuestionsBySubject] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubjectId, setActiveSubjectId] = useState(subjectIds[0] || '');
  const [currentIndexes, setCurrentIndexes] = useState(() => subjectIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}));
  const [selectedAnswers, setSelectedAnswers] = useState(() => subjectIds.reduce((acc, id) => ({ ...acc, [id]: {} }), {}));
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [errorMessage, setErrorMessage] = useState('');
  const intervalRef = useRef(null);

  const subjects = useMemo(() => subjectIds.map((id) => SUBJECTS.find((subject) => subject.id === id)).filter(Boolean), [subjectIds]);

  useEffect(() => {
    let isMounted = true;
    const loadAllSubjects = async () => {
      const promises = subjects.map(async (subject) => {
        try {
          const prompt = getSubjectPrompt(subject.name);
          const raw = await callGemini(prompt);
          const parsed = parseQuestionJson(raw);
          const questions = normalizeQuestionList(parsed, QUESTION_COUNT);
          if (!isMounted) return;
          setQuestionsBySubject((prev) => ({ ...prev, [subject.id]: questions }));
          setLoadStatus((prev) => ({ ...prev, [subject.id]: true }));
        } catch (error) {
          if (!isMounted) return;
          setErrorMessage(`Failed to load ${subject.name}. Please try again.`);
          console.error('[MockExamScreen] load error', subject.id, error);
        }
      });

      await Promise.all(promises);
      if (isMounted) setIsLoading(false);
    };

    loadAllSubjects();
    return () => { isMounted = false; };
  }, [subjects]);

  useEffect(() => {
    if (!isLoading && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoading]);

  useEffect(() => {
    if (secondsLeft === 0 && !isLoading) {
      handleSubmit(true);
    }
  }, [secondsLeft, isLoading]);

  const currentQuestionIndex = currentIndexes[activeSubjectId] || 0;
  const questionsForActive = questionsBySubject[activeSubjectId] || [];
  const currentQuestion = questionsForActive[currentQuestionIndex] || null;
  const currentAnswer = selectedAnswers[activeSubjectId]?.[currentQuestionIndex];

  const answeredCount = useMemo(() => {
    return Object.values(selectedAnswers).reduce((sum, answers) => sum + Object.keys(answers).length, 0);
  }, [selectedAnswers]);

  const totalQuestions = subjectIds.length * QUESTION_COUNT;
  const remainingUnanswered = totalQuestions - answeredCount;
  const timerDanger = secondsLeft <= 600;

  const handleSelectAnswer = (choice) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeSubjectId]: {
        ...prev[activeSubjectId],
        [currentQuestionIndex]: choice,
      },
    }));
  };

  const changeSubject = (subjectId) => {
    setActiveSubjectId(subjectId);
  };

  const moveQuestion = (direction) => {
    setCurrentIndexes((prev) => {
      const current = prev[activeSubjectId] || 0;
      const nextIndex = direction === 'next'
        ? Math.min(current + 1, QUESTION_COUNT - 1)
        : Math.max(current - 1, 0);
      return {
        ...prev,
        [activeSubjectId]: nextIndex,
      };
    });
  };

  const handleSubmit = (forced = false) => {
    if (!forced && remainingUnanswered > 0) {
      Alert.alert(
        'Unanswered Questions',
        `You have ${remainingUnanswered} unanswered questions. Submit anyway?`,
        [
          { text: 'Continue exam', style: 'cancel' },
          { text: 'Submit', style: 'destructive', onPress: () => handleSubmit(true) },
        ],
      );
      return;
    }

    const subjectScores = subjects.map((subject) => {
      const answers = selectedAnswers[subject.id] || {};
      const questions = questionsBySubject[subject.id] || [];
      const correct = questions.reduce((count, question, index) => {
        const selected = String(answers[index] || '').trim().toUpperCase();
        return count + (selected === question.answer ? 1 : 0);
      }, 0);

      return {
        id: subject.id,
        emoji: subject.emoji,
        name: subject.name,
        correct,
        total: questions.length,
        percent: questions.length ? Math.round((correct / questions.length) * 100) : 0,
      };
    });

    const totalScore = subjectScores.reduce((sum, item) => sum + item.correct, 0);
    const predictedScore = Math.round((totalScore / (subjectIds.length * QUESTION_COUNT)) * 400);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    navigation.replace('MockScore', {
      subjectScores,
      totalScore,
      predictedScore,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <Text style={styles.loaderTitle}>Preparing Mock Exam</Text>
          <Text style={styles.loaderSubtitle}>Loading questions for all subjects in parallel...</Text>
          {subjects.map((subject) => (
            <View key={subject.id} style={styles.loaderRow}>
              <Text style={styles.loaderLabel}>{subject.emoji} {subject.name}</Text>
              {loadStatus[subject.id] ? (
                <Text style={styles.loaderStatus}>✓ Loaded</Text>
              ) : (
                <ActivityIndicator size="small" color="#0a7c4f" />
              )}
            </View>
          ))}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mock Exam</Text>
      </View>

      <View style={styles.timerRow}>
        <View style={styles.timerPill}>
          <Text style={[styles.timerText, timerDanger && styles.timerTextDanger]}>{getTimerText(secondsLeft)}</Text>
        </View>
        <Text style={styles.answerInfo}>{answeredCount}/{totalQuestions} answered</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {subjects.map((subject) => {
          const active = subject.id === activeSubjectId;
          return (
            <TouchableOpacity
              key={subject.id}
              onPress={() => changeSubject(subject.id)}
              style={[styles.tabItem, active && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{subject.emoji} {subject.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{subjects.find((subject) => subject.id === activeSubjectId)?.name}</Text>
        <Text style={styles.questionCount}>Question {currentQuestionIndex + 1}/{QUESTION_COUNT}</Text>
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>

        {currentQuestion && Object.entries(currentQuestion.options || {}).map(([key, option]) => {
          const selected = currentAnswer === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleSelectAnswer(key)}
              style={[styles.optionItem, selected && styles.optionSelected]}
            >
              <Text style={styles.optionLabel}>{key}. {option}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentQuestionIndex === 0 && styles.navBtnDisabled]}
            onPress={() => moveQuestion('prev')}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={styles.navBtnText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit(false)}>
            <Text style={styles.submitBtnText}>Submit Exam</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, currentQuestionIndex === QUESTION_COUNT - 1 && styles.navBtnDisabled]}
            onPress={() => moveQuestion('next')}
            disabled={currentQuestionIndex === QUESTION_COUNT - 1}
          >
            <Text style={styles.navBtnText}>Next</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}> 
          {Array.from({ length: QUESTION_COUNT }).map((_, index) => {
            const answered = Boolean(selectedAnswers[activeSubjectId]?.[index]);
            return (
              <View key={index} style={[styles.gridDot, answered && styles.gridDotFilled]} />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    marginRight: 14,
  },
  backText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0a7c4f',
  },
  timerRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerPill: {
    backgroundColor: '#f1fdf4',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  timerText: {
    color: '#0a7c4f',
    fontSize: 20,
    fontWeight: '800',
  },
  timerTextDanger: {
    color: '#b00020',
  },
  answerInfo: {
    color: '#555',
    fontWeight: '700',
  },
  tabRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f4f9f6',
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dbead7',
  },
  tabItemActive: {
    backgroundColor: '#0a7c4f',
    borderColor: '#0a7c4f',
  },
  tabText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a7c4f',
    marginBottom: 6,
  },
  questionCount: {
    color: '#555',
    marginBottom: 12,
    fontWeight: '700',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 18,
    lineHeight: 26,
  },
  optionItem: {
    backgroundColor: '#fff',
    borderColor: '#d8e7d8',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  optionSelected: {
    backgroundColor: '#eaf4ea',
    borderColor: '#0a7c4f',
  },
  optionLabel: {
    color: '#1d3e2f',
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  navBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0a7c4f',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  submitBtn: {
    flex: 1.7,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5a623',
  },
  submitBtnText: {
    color: '#0a7c4f',
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
    justifyContent: 'center',
  },
  gridDot: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#0a7c4f',
    margin: 4,
  },
  gridDotFilled: {
    backgroundColor: '#0a7c4f',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a7c4f',
    marginBottom: 10,
    textAlign: 'center',
  },
  loaderSubtitle: {
    textAlign: 'center',
    marginBottom: 22,
    color: '#555',
  },
  loaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f7faf7',
    borderRadius: 16,
    marginBottom: 10,
  },
  loaderLabel: {
    color: '#1b4f2b',
    fontWeight: '700',
  },
  loaderStatus: {
    color: '#0a7c4f',
    fontWeight: '800',
  },
  errorText: {
    color: '#b00020',
    marginTop: 16,
    textAlign: 'center',
  },
});
