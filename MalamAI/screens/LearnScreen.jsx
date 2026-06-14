import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSRS from '../hooks/useSRS';
import useWeaknessTracker from '../src/hooks/useWeaknessTracker';
import useNotes from '../src/hooks/useNotes';
import FlashcardScreen from './FlashcardScreen';
import { callGemini, parseQuestionJson, normalizeQuestionList, isQuotaError } from '../src/utils/gemini';
import { getMode, getSystemPrompt } from '../src/hooks/useLanguageMode';

// FIX 1: Removed hardcoded GEMINI_ENDPOINT constant entirely.
// The endpoint must come from the environment variable only.
// If it's missing, callGemini will throw a clear error instead of silently
// falling back to the wrong model (gemini-2.0-flash vs gemini-2.5-flash).

const QUOTA_ERROR_MESSAGE = 'Gemini quota is exhausted right now. Please try fetching the questions again soon.';
const QUIZ_TIME_SECONDS = 5 * 60;
const QUESTION_COUNT = 5;

function getMotivation(score, total) {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  if (percent >= 80) return 'Excellent work. Ka yi kyau sosai! Keep revising and you will enter that exam with confidence.';
  if (percent >= 50) return 'Nice progress. Sai haka! Review the missed questions and you will improve fast.';
  return 'Good effort. Kada ka damu. Go through the corrections slowly, then try again with fresh energy.';
}

function getFallbackExplanation(subject, topic) {
  const subjectName = subject?.name || 'this subject';
  const focus = topic || subjectName;

  return `Gemini quota is exhausted right now, so here is a quick offline note.\n\n${focus} is an important part of ${subjectName}. Start by learning the key meaning, then practise one small example before answering questions. Read each question carefully, remove options that are clearly wrong, and choose the best answer.\n\nReady to test yourself?`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function LearnScreen({ route, navigation }) {
  const { subject, topic: initialTopic } = route.params || {};
  const topic = initialTopic || null;

  const [mode, setMode] = useState('learn');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const { saveMissedQuestions } = useSRS();
  const { logWrongAnswer } = useWeaknessTracker();
  const { saveNote, getNote } = useNotes();
  const [noteText, setNoteText] = useState('');
  const [noteStatus, setNoteStatus] = useState('');

  // FIX 2: loadingQuestion is now also used as the fetchQuestions guard (replaces the
  // questions.length check that prevented retrying after a failed fetch).
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState('');

  // FIX 3: Timer starts as null. It only becomes a number once questions have loaded,
  // so students don't lose time while the spinner is showing.
  const [timeRemaining, setTimeRemaining] = useState(null);
  const submittedRef = useRef(false);

  const maxQuestions = QUESTION_COUNT;
  const currentQuestion = questions[currentQuestionIndex] || null;
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const timerIsLow = timeRemaining !== null && timeRemaining <= 60;
  const timerRunning = mode === 'practice' && timeRemaining !== null && !submittedRef.current;

  // FIX 4: fetchExplanation is wrapped in useCallback so it can be safely listed in the
  // useEffect dependency array, preventing the stale-closure lint warning.
  const fetchExplanation = useCallback(async () => {
    setLoading(true);
    try {
      const subjectName = subject?.name || 'this subject';
      const learnTopic = topic || subjectName;
      const languageMode = await getMode();
      const systemPrompt = getSystemPrompt(languageMode);

      const learnPrompt = `
        ${systemPrompt}

        Explain the topic "${learnTopic}" in simple terms, using relatable Nigerian examples.
        Keep the language style appropriate for a JAMB student. End the explanation with the phrase:
        Ready to test yourself?

        - Use short paragraphs, not walls of text.
        - Use relatable Nigerian examples (markets, farms, local contexts, everyday life).
        - Teach at SS2/SS3 level, not university level. Keep it simple and clear.
        - End with "Ready to test yourself?" to encourage the student to practise.
      `;
      const text = await callGemini(learnPrompt);
      setExplanation(typeof text === 'string' ? text : JSON.stringify(text));
    } catch (err) {
      console.error('[fetchExplanation]', err);

      if (isQuotaError(err)) {
        const retryText = err.retryDelay
          ? ` You can retry Gemini in about ${err.retryDelay} seconds.`
          : '';
        setExplanation(`${getFallbackExplanation(subject, topic)}\n\n${retryText}`);
        return;
      }

      setExplanation('Sorry — could not get explanation. Please try again later.');
      Alert.alert('Error', err.message || 'Failed to fetch explanation.');
    } finally {
      setLoading(false);
    }
  }, [subject, topic]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    fetchExplanation();
  }, [fetchExplanation, navigation]);

  useEffect(() => {
    let mounted = true;
    async function loadNote() {
      if (!subject?.id || !topic) {
        setNoteText('');
        return;
      }

      try {
        const existing = await getNote(subject, topic);
        if (mounted) {
          setNoteText(existing?.note || '');
        }
      } catch (err) {
        console.warn('[LearnScreen] load note failed', err);
      }
    }

    loadNote();
    return () => { mounted = false; };
  }, [subject, topic, getNote]);

  // FIX 3 (continued): Timer only ticks when timeRemaining is a real number.
  useEffect(() => {
    if (!timerRunning) return undefined;

    const timer = setInterval(() => {
      setTimeRemaining((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    if (mode === 'practice' && timeRemaining === 0 && !submittedRef.current) {
      handleSubmitQuiz();
    }
  }, [mode, timeRemaining]);

  // FIX 2 (continued): Guard is now loadingQuestion instead of questions.length,
  // so retrying after a failed fetch works correctly.
  async function fetchQuestions() {
    if (loadingQuestion) return;

    setLoadingQuestion(true);
    setQuestionError('');
    try {
      const subjectName = subject?.name || 'this subject';
      const practiceTopic = topic || subjectName;
      const languageMode = await getMode();
      const systemPrompt = getSystemPrompt(languageMode);
      const practicePrompt = `
${systemPrompt}

You are Malam AI, a JAMB tutor. Generate exactly ${maxQuestions} unique multiple choice JAMB-style
questions on the topic "${practiceTopic}" in "${subjectName}".

Rules:
- Each question must have four options: A, B, C, and D.
- Each question must have exactly one correct answer.
- Do not repeat or closely rephrase any question.
- Keep language simple for a Nigerian SS3 student.
- Return valid JSON only. No markdown, no notes, no extra text.

Format your response EXACTLY like this JSON:
{
  "questions": [
    {
      "question": "The question here",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "answer": "A",
      "explanation": "Why this answer is correct, in simple terms a Nigerian SS3 student would understand"
    }
  ]
}
`;
      const text = await callGemini(practicePrompt);
      const parsed = parseQuestionJson(String(text));
      const nextQuestions = normalizeQuestionList(parsed, maxQuestions);

      setQuestions(nextQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});

      // FIX 3 (continued): Start the timer only after questions are successfully loaded.
      setTimeRemaining(QUIZ_TIME_SECONDS);
    } catch (err) {
      console.error('[fetchQuestions]', err);

      if (isQuotaError(err)) {
        setQuestionError(err.retryDelay
          ? `${QUOTA_ERROR_MESSAGE} You can retry Gemini in about ${err.retryDelay} seconds.`
          : QUOTA_ERROR_MESSAGE);
        return;
      }

      setQuestionError(err.message || 'Failed to fetch questions.');
      Alert.alert('Error', 'Failed to fetch questions. Please try again.');
    } finally {
      setLoadingQuestion(false);
    }
  }

  function startPractice() {
    if (questions.length === 0 && Object.keys(selectedAnswers).length === 0) {
      submittedRef.current = false;
      // FIX 3 (continued): Don't reset timer here; it resets inside fetchQuestions on success.
    }

    setMode('practice');
    if (questions.length !== maxQuestions) fetchQuestions();
  }

  function handleAnswer(choice) {
    setSelectedAnswers((answers) => ({
      ...answers,
      [currentQuestionIndex]: choice,
    }));
  }

  function handlePrevQuestion() {
    setCurrentQuestionIndex((index) => Math.max(index - 1, 0));
  }

  function handleNextQuestion() {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= maxQuestions) return;
    setCurrentQuestionIndex(nextIndex);
  }

  async function handleSubmitQuiz() {
    if (submittedRef.current) return;
    submittedRef.current = true;

    if (questions.length !== maxQuestions) {
      submittedRef.current = false;
      setQuestionError(`Please fetch all ${maxQuestions} AI questions before submitting.`);
      setMode('practice');
      return;
    }

    const review = questions.map((item, index) => {
      const selected = selectedAnswers[index] || '';
      const correct = item.answer?.trim().toUpperCase();

      return {
        question: item.question,
        options: item.options,
        answer: correct,
        selected,
        explanation: item.explanation,
        isCorrect: Boolean(correct) && selected.trim().toUpperCase() === correct,
      };
    });

    const finalScore = review.filter((item) => item.isCorrect).length;
    const weakTopics = review.some((item) => !item.isCorrect)
      ? [topic || subject?.name || 'Practice']
      : [];

    try {
      await saveMissedQuestions(questions, selectedAnswers, topic, subject?.id);
    } catch (err) {
      console.warn('[saveMissedQuestions]', err);
    }

    try {
      const wrongItems = review.filter((item) => !item.isCorrect);
      await Promise.all(
        wrongItems.map((item) =>
          logWrongAnswer(
            topic || subject?.name || 'Practice',
            { id: subject?.id, name: subject?.name },
            item.question
          )
        )
      );
    } catch (err) {
      console.warn('[logWrongAnswer]', err);
    }

    navigation.replace('Score', {
      score: finalScore,
      total: maxQuestions,
      weakTopics,
      review,
      motivation: getMotivation(finalScore, maxQuestions),
    });
  }

  async function handleSaveNote() {
    if (!subject?.id || !topic) {
      Alert.alert('Missing subject', 'Unable to save note because the subject or topic is missing.');
      return;
    }

    try {
      await saveNote(
        { id: subject.id, name: subject.name, emoji: subject.emoji },
        topic,
        noteText
      );
      setNoteStatus('Saved');
      setTimeout(() => setNoteStatus(''), 1500);
    } catch (error) {
      console.warn('[LearnScreen] save note failed', error);
      Alert.alert('Save failed', 'Unable to save your note. Please try again.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: '#0a7c4f' }}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subject?.emoji} {subject?.name}</Text>
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'learn' && styles.modeActive]}
          onPress={() => { setMode('learn'); fetchExplanation(); }}
        >
          <Text style={mode === 'learn' ? styles.modeActiveText : styles.modeText}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'flashcards' && styles.modeActive]}
          onPress={() => setMode('flashcards')}
        >
          <Text style={mode === 'flashcards' ? styles.modeActiveText : styles.modeText}>Flashcards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'practice' && styles.modeActive]}
          onPress={startPractice}
        >
          <Text style={mode === 'practice' ? styles.modeActiveText : styles.modeText}>Practice</Text>
        </TouchableOpacity>
      </View>

      {/* FIX 3 (continued): Only render the timer once it has a real value */}
      {mode === 'practice' && timeRemaining !== null ? (
        <View style={styles.timerRow}>
          <Text style={[styles.timerText, timerIsLow && styles.timerTextLow]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {mode === 'learn' && (
          <View>
            {loading
              ? <ActivityIndicator size="large" color="#0a7c4f" />
              : <Text style={styles.explanationText}>{explanation}</Text>
            }

            <View style={styles.notesCard}>
              <Text style={styles.notesHeader}>📝 My Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Write your own notes here…"
                placeholderTextColor="#9aa299"
                multiline
                textAlignVertical="top"
              />
              <View style={styles.notesFooter}>
                <Text style={styles.noteStatus}>{noteStatus}</Text>
                <TouchableOpacity style={styles.saveNoteBtn} onPress={handleSaveNote} activeOpacity={0.8}>
                  <Text style={styles.saveNoteText}>Save note</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.cta} onPress={startPractice}>
              <Text style={styles.ctaText}>Ready to test yourself? Start Practice</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'flashcards' && (
          <FlashcardScreen subject={subject} topic={topic} startPractice={startPractice} />
        )}

        {mode === 'practice' && (
          <View>
            {loadingQuestion ? (
              <ActivityIndicator size="large" color="#0a7c4f" />
            ) : questionError ? (
              <View>
                <Text style={styles.errorText}>{questionError}</Text>
                <TouchableOpacity style={styles.cta} onPress={fetchQuestions}>
                  <Text style={styles.ctaText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : currentQuestion ? (
              <View>
                <Text style={styles.progressText}>
                  Question {currentQuestionIndex + 1}/{maxQuestions}{'  '}Answered: {answeredCount}/{maxQuestions}
                </Text>
                <Text style={styles.qText}>{currentQuestion.question}</Text>
                {Object.entries(currentQuestion.options || {}).map(([key, val]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.option, selectedAnswer === key && styles.optionSelected]}
                    onPress={() => handleAnswer(key)}
                  >
                    <Text style={styles.optionText}>{key}. {val}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.navRow}>
                  <TouchableOpacity
                    style={[styles.navBtn, currentQuestionIndex === 0 && styles.navBtnDisabled]}
                    onPress={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <Text style={styles.navBtnText}>Prev</Text>
                  </TouchableOpacity>

                  {currentQuestionIndex === maxQuestions - 1 ? (
                    <TouchableOpacity style={[styles.navBtn, styles.submitBtn]} onPress={handleSubmitQuiz}>
                      <Text style={styles.submitBtnText}>Submit</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.navBtn} onPress={handleNextQuestion}>
                      <Text style={styles.navBtnText}>Next</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.questionGrid}>
                  {Array.from({ length: maxQuestions }, (_, index) => {
                    const isAnswered = Boolean(selectedAnswers[index]);
                    const isActive = index === currentQuestionIndex;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.questionBox,
                          isAnswered && styles.questionBoxAnswered,
                          isActive && styles.questionBoxActive,
                        ]}
                        onPress={() => setCurrentQuestionIndex(index)}
                      >
                        <Text style={[
                          styles.questionBoxText,
                          isAnswered && styles.questionBoxTextAnswered,
                          isActive && styles.questionBoxTextActive,
                        ]}>
                          {index + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Text>No questions yet. Tap Practice to start.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 48,
  },
  backBtn: {
    position: 'absolute',
    left: 12,
    top: 10,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a7c4f',
    textAlign: 'center',
    paddingHorizontal: 64,
  },
  timerRow: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  timerText: {
    color: '#0a7c4f',
    fontWeight: '900',
    backgroundColor: '#e4f5ec',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  timerTextLow: {
    color: '#b00020',
    backgroundColor: '#ffe8e8',
  },
  modeRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  modeActive: {
    backgroundColor: '#0a7c4f',
  },
  modeText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  modeActiveText: {
    color: '#fff',
    fontWeight: '700',
  },
  explanationText: {
    color: '#333',
    lineHeight: 22,
    fontSize: 16,
  },
  notesCard: {
    marginTop: 18,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    padding: 16,
  },
  notesHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a7c4f',
    marginBottom: 10,
  },
  notesInput: {
    minHeight: 110,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d7ded5',
    padding: 14,
    color: '#222',
    fontSize: 15,
    textAlignVertical: 'top',
  },
  notesFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteStatus: {
    color: '#4b6d4d',
    fontSize: 13,
  },
  saveNoteBtn: {
    backgroundColor: '#0a7c4f',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  saveNoteText: {
    color: '#fff',
    fontWeight: '800',
  },
  cta: {
    marginTop: 16,
    backgroundColor: '#f5a623',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  ctaText: {
    color: '#0a7c4f',
    fontWeight: '800',
  },
  qText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0a7c4f',
  },
  option: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionSelected: {
    backgroundColor: '#e4f5ec',
    borderColor: '#0a7c4f',
  },
  optionText: {
    color: '#0a7c4f',
    fontWeight: '600',
  },
  progressText: {
    color: '#666',
    fontWeight: '700',
    marginBottom: 10,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navBtn: {
    flex: 0.48,
    backgroundColor: '#0a7c4f',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  navBtnDisabled: {
    backgroundColor: '#c8d8cf',
  },
  navBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: '#f5a623',
  },
  submitBtnText: {
    color: '#0a7c4f',
    fontWeight: '900',
  },
  questionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    justifyContent: 'center',
  },
  questionBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0e8dc',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  questionBoxAnswered: {
    backgroundColor: '#0a7c4f',
    borderColor: '#0a7c4f',
  },
  questionBoxActive: {
    borderWidth: 2,
    borderColor: '#f5a623',
  },
  questionBoxText: {
    color: '#0a7c4f',
    fontWeight: '800',
  },
  questionBoxTextAnswered: {
    color: '#fff',
  },
  questionBoxTextActive: {
    color: '#f5a623',
  },
  errorText: {
    color: '#b00020',
    lineHeight: 20,
    marginBottom: 12,
  },
});