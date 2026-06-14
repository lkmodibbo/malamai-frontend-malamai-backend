import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { callGemini, buildWhyWrongPrompt } from '../src/utils/gemini';

export default function ScoreScreen({ route, navigation }) {
  const { score = 0, total = 0, weakTopics = [], review = [], motivation } = route.params || {};
  const [whyWrongResponses, setWhyWrongResponses] = useState({});
  const [loadingWhyWrong, setLoadingWhyWrong] = useState({});
  const [whyWrongErrors, setWhyWrongErrors] = useState({});
  const [expandedWhyWrong, setExpandedWhyWrong] = useState({});

  const getFeedbackKey = (item, index) => `${item.question}-${index}`;

  const toggleWhyWrong = async (item, index) => {
    const key = getFeedbackKey(item, index);
    const isExpanded = expandedWhyWrong[key];

    if (isExpanded) {
      setExpandedWhyWrong((prev) => ({ ...prev, [key]: false }));
      return;
    }

    setExpandedWhyWrong((prev) => ({ ...prev, [key]: true }));

    if (whyWrongResponses[key] || loadingWhyWrong[key]) {
      return;
    }

    setLoadingWhyWrong((prev) => ({ ...prev, [key]: true }));
    setWhyWrongErrors((prev) => ({ ...prev, [key]: null }));

    try {
      const selectedOption = item.selected || '';
      const correctOption = item.answer || '';
      const selectedText = selectedOption ? `${selectedOption}. ${item.options?.[selectedOption] || ''}` : 'Not answered';
      const correctText = correctOption ? `${correctOption}. ${item.options?.[correctOption] || ''}` : 'Not available';

      const prompt = buildWhyWrongPrompt(
        item.question,
        selectedOption,
        selectedText,
        correctOption,
        correctText,
      );

      const text = await callGemini(prompt);
      setWhyWrongResponses((prev) => ({ ...prev, [key]: text }));
    } catch (err) {
      console.warn('[ScoreScreen] fetch why-wrong failed', err);
      setWhyWrongErrors((prev) => ({ ...prev, [key]: 'Could not load feedback. Tap to retry.' }));
    } finally {
      setLoadingWhyWrong((prev) => ({ ...prev, [key]: false }));
    }
  };

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  // FIX 6: The original code computed `message` and `hausa` separately, then built
  // `motivationText` from them — but then rendered all three independently, so the
  // score card showed both the raw `message`/`hausa` strings AND `motivationText`
  // (which already contained both). Now message and hausa are only used to build
  // motivationText; they are not rendered on their own.
  let message = 'Good effort! Keep practicing to improve.';
  let hausa = 'Ka yi ƙoƙari! Ci gaba da yin nazari.';

  if (percent >= 80) {
    message = 'Excellent work — you are ready!';
    hausa = 'Nagode — Ka yi kyau sosai!';
  } else if (percent >= 50) {
    message = 'Nice progress — a bit more practice will help.';
    hausa = 'Ka yi kyau — kada ka damu, ka ci gaba da karatu.';
  }

  // Use the motivation passed from LearnScreen if available; otherwise fall back to
  // the locally computed strings.
  const motivationText = motivation || `${message} ${hausa}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f5f3' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Final Score</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{score}/{total}</Text>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>

        {/* FIX 6 (continued): Render motivationText once instead of three overlapping strings */}
        <Text style={styles.motivation}>{motivationText}</Text>

        {weakTopics && weakTopics.length > 0 && (
          <View style={styles.weakBox}>
            <Text style={styles.sectionTitle}>Weak areas to review</Text>
            {weakTopics.map((t, i) => (
              <Text key={i} style={styles.weakText}>• {t}</Text>
            ))}
          </View>
        )}

        {review.length > 0 && (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Corrections</Text>
            {review.map((item, index) => {
              const selectedText = item.selected
                ? `${item.selected}. ${item.options?.[item.selected] || ''}`
                : 'Not answered';
              const answerText = item.answer
                ? `${item.answer}. ${item.options?.[item.answer] || ''}`
                : 'Not available';

              return (
                <View key={`${item.question}-${index}`} style={styles.reviewCard}>
                  <Text style={styles.reviewNumber}>Question {index + 1}</Text>
                  <Text style={styles.reviewQuestion}>{item.question}</Text>
                  <Text style={item.isCorrect ? styles.correctText : styles.wrongText}>
                    Your answer: {selectedText}
                  </Text>
                  <Text style={styles.correctText}>Correct answer: {answerText}</Text>
                  {item.explanation ? (
                    <Text style={styles.explanation}>{item.explanation}</Text>
                  ) : null}

                  {!item.isCorrect && (
                    <TouchableOpacity
                      style={styles.showWorkingBtn}
                      onPress={() => toggleWhyWrong(item, index)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.showWorkingText}>
                        {expandedWhyWrong[getFeedbackKey(item, index)] ? 'Close ▲' : 'Why did I get this wrong? →'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {expandedWhyWrong[getFeedbackKey(item, index)] && (
                    <View style={styles.feedbackContainer}>
                      {loadingWhyWrong[getFeedbackKey(item, index)] ? (
                        <View style={styles.feedbackLoadingRow}>
                          <ActivityIndicator size="small" color="#0a7c4f" style={styles.feedbackLoader} />
                          <Text style={styles.feedbackLoadingText}>Malam AI is thinking…</Text>
                        </View>
                      ) : whyWrongErrors[getFeedbackKey(item, index)] ? (
                        <Text style={styles.workingError}>{whyWrongErrors[getFeedbackKey(item, index)]}</Text>
                      ) : (
                        whyWrongResponses[getFeedbackKey(item, index)]?.split('\n').map((line, idx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;
                          let dotStyle = styles.feedbackDotAmber;
                          if (/trap|tempting|wrong/i.test(trimmed)) dotStyle = styles.feedbackDotRed;
                          if (/correct|key|because/i.test(trimmed)) dotStyle = styles.feedbackDotGreen;
                          if (/remember|memory|trick/i.test(trimmed)) dotStyle = styles.feedbackDotAmber;
                          return (
                            <View key={idx} style={styles.feedbackRow}>
                              <View style={[styles.feedbackDot, dotStyle]} />
                              <Text style={styles.feedbackText}>{trimmed}</Text>
                            </View>
                          );
                        })
                      )}
                      <TouchableOpacity
                        style={styles.collapseBtn}
                        onPress={() => setExpandedWhyWrong((prev) => ({ ...prev, [getFeedbackKey(item, index)]: false }))}
                      >
                        <Text style={styles.collapseText}>Close ▲</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Subjects')}>
          <Text style={styles.btnText}>Study Another Topic</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a7c4f',
  },
  scoreBox: {
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  scoreText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0a7c4f',
  },
  percentText: {
    marginTop: 8,
    fontSize: 18,
    color: '#666',
  },
  motivation: {
    marginTop: 18,
    color: '#333',
    lineHeight: 22,
    textAlign: 'center',
    fontSize: 15,
  },
  weakBox: {
    marginTop: 18,
    width: '100%',
  },
  weakText: {
    marginTop: 6,
    color: '#333',
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#0a7c4f',
    fontSize: 16,
    marginBottom: 8,
  },
  reviewSection: {
    width: '100%',
    marginTop: 22,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d0e8dc',
  },
  reviewNumber: {
    color: '#0a7c4f',
    fontWeight: '800',
    marginBottom: 6,
  },
  reviewQuestion: {
    color: '#222',
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 10,
  },
  correctText: {
    color: '#0a7c4f',
    fontWeight: '700',
    marginTop: 4,
  },
  wrongText: {
    color: '#b00020',
    fontWeight: '700',
    marginTop: 4,
  },
  explanation: {
    color: '#555',
    lineHeight: 20,
    marginTop: 8,
  },
  showWorkingBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  showWorkingText: {
    color: '#0a7c4f',
    fontWeight: '700',
    fontSize: 14,
  },
  feedbackContainer: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0e6bb',
  },
  feedbackLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackLoader: {
    marginRight: 10,
  },
  feedbackLoadingText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  feedbackDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginTop: 6,
    marginRight: 10,
  },
  feedbackDotRed: {
    backgroundColor: '#d63447',
  },
  feedbackDotGreen: {
    backgroundColor: '#1d7d34',
  },
  feedbackDotAmber: {
    backgroundColor: '#f5a623',
  },
  feedbackText: {
    color: '#333',
    lineHeight: 20,
    flex: 1,
  },
  collapseBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  collapseText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  workingContainer: {
    marginTop: 12,
    backgroundColor: '#e4f5ec',
    borderRadius: 14,
    padding: 14,
  },
  workingLoader: {
    marginTop: 8,
  },
  workingText: {
    color: '#1f3c2b',
    lineHeight: 22,
  },
  workingError: {
    color: '#b00020',
    fontWeight: '700',
    lineHeight: 20,
  },
  btn: {
    marginTop: 24,
    backgroundColor: '#0a7c4f',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
  },
});