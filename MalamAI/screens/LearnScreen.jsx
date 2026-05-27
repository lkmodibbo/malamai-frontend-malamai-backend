import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

function buildSystemPrompt() {
  return `You are Malam AI, a patient and encouraging JAMB tutor for northern Nigerian secondary school students. Speak simply and kindly, use relatable Nigerian examples, and occasionally include short Hausa encouragements like "Sai haka!", "Nagode", "Ka yi kyau", "Kada ka damu". Be concise and end every explanation with the phrase: Ready to test yourself?`;
}

async function callClaude(messages) {
  try {
    const res = await fetch(CLAUDE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_CLAUDE_API_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: 1024 }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error: ${res.status} ${text}`);
    }

    const data = await res.json();

    // Try common locations for completion text
    if (data?.completion) return data.completion;
    if (data?.choices && data.choices[0]) {
      return data.choices[0].message?.content ?? data.choices[0].text ?? JSON.stringify(data);
    }
    if (data?.message) return data.message;
    return JSON.stringify(data);
  } catch (err) {
    throw err;
  }
}

export default function LearnScreen({ route, navigation }) {
  const { subject, topic: initialTopic } = route.params || {};
  const topic = initialTopic || null;

  const [mode, setMode] = useState('learn');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [qCount, setQCount] = useState(0);
  const [score, setScore] = useState(0);
  const [weakTopics, setWeakTopics] = useState([]);

  const maxQuestions = 10;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    // auto-fetch explanation when screen opens in learn mode
    if (mode === 'learn') fetchExplanation();
  }, []);

  async function fetchExplanation() {
    setLoading(true);
    try {
      const system = buildSystemPrompt();
      const user = topic
        ? `Explain the topic "${topic}" from ${subject?.name || ''} simply for a northern Nigerian secondary school student. Use a short relatable Nigerian example and finish the explanation with 'Ready to test yourself?'. Keep it friendly and encouraging.`
        : `Give a concise overview of ${subject?.name || 'this subject'} suitable for secondary students. End with 'Ready to test yourself?'.`;

      const messages = [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];

      const text = await callClaude(messages);
      // text may be object or string; coerce
      setExplanation(typeof text === 'string' ? text : JSON.stringify(text));
    } catch (err) {
      setExplanation('Sorry — could not get explanation. Please try again later.');
      console.error(err);
      Alert.alert('Error', 'Failed to fetch explanation.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuestion() {
    setLoadingQuestion(true);
    try {
      const system = buildSystemPrompt();
      const user = `Generate a single JAMB-style multiple choice question (one correct answer) about the topic: ${topic || subject?.name}. Respond ONLY with JSON in this exact shape: {"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A","explanation":"..."}. Keep language simple and include a short Nigerian-context example if helpful.`;

      const messages = [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];

      const text = await callClaude(messages);

      // Try to extract JSON from response
      const jsonStringMatch = String(text).match(/\{[\s\S]*\}$/);
      let parsed = null;
      if (jsonStringMatch) {
        try {
          parsed = JSON.parse(jsonStringMatch[0]);
        } catch (e) {
          parsed = null;
        }
      }
      if (!parsed) {
        // Fallback: try full parse
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          // give user friendly error
          throw new Error('Unable to parse question from AI response.');
        }
      }

      setQuestion(parsed);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch question. Please try again.');
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function handleAnswer(choice) {
    if (!question) return;
    const correct = question.answer?.trim().toUpperCase();
    const selected = choice.trim().toUpperCase();
    const isCorrect = selected === correct;
    setQCount((c) => c + 1);
    if (isCorrect) setScore((s) => s + 1);
    else setWeakTopics((w) => Array.from(new Set([...w, topic || subject?.name])));

    // Show brief feedback then fetch next or finish
    Alert.alert(isCorrect ? 'Correct' : 'Incorrect', question.explanation || 'Good try — review and continue.');

    if (qCount + 1 >= maxQuestions) {
      navigation.replace('Score', { score: isCorrect ? score + 1 : score, total: maxQuestions, weakTopics });
    } else {
      // fetch next question
      fetchQuestion();
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
        <TouchableOpacity style={[styles.modeBtn, mode === 'learn' && styles.modeActive]} onPress={() => { setMode('learn'); fetchExplanation(); }}>
          <Text style={mode === 'learn' ? styles.modeActiveText : styles.modeText}>Learn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeBtn, mode === 'practice' && styles.modeActive]} onPress={() => { setMode('practice'); fetchQuestion(); }}>
          <Text style={mode === 'practice' ? styles.modeActiveText : styles.modeText}>Practice</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {mode === 'learn' && (
          <View>
            {loading ? <ActivityIndicator size="large" color="#0a7c4f" /> : <Text style={styles.explanationText}>{explanation}</Text>}
            <TouchableOpacity style={styles.cta} onPress={() => { setMode('practice'); fetchQuestion(); }}>
              <Text style={styles.ctaText}>Ready to test yourself? Start Practice</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'practice' && (
          <View>
            {loadingQuestion ? (
              <ActivityIndicator size="large" color="#0a7c4f" />
            ) : question ? (
              <View>
                <Text style={styles.qText}>{question.question}</Text>
                {Object.entries(question.options || {}).map(([key, val]) => (
                  <TouchableOpacity key={key} style={styles.option} onPress={() => handleAnswer(key)}>
                    <Text style={styles.optionText}>{key}. {val}</Text>
                  </TouchableOpacity>
                ))}
                <Text style={{ marginTop: 12 }}>Progress: {qCount}/{maxQuestions}  Score: {score}</Text>
              </View>
            ) : (
              <Text>No question yet. Tap Practice to start.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: {
    marginRight: 12
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a7c4f'
  },
  modeRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center'
  },
  modeActive: {
    backgroundColor: '#0a7c4f'
  },
  modeText: {
    color: '#0a7c4f',
    fontWeight: '700'
  },
  modeActiveText: {
    color: '#fff',
    fontWeight: '700'
  },
  explanationText: {
    color: '#333',
    lineHeight: 22,
    fontSize: 16
  },
  cta: {
    marginTop: 16,
    backgroundColor: '#f5a623',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center'
  },
  ctaText: {
    color: '#0a7c4f',
    fontWeight: '800'
  },
  qText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0a7c4f'
  },
  option: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  optionText: {
    color: '#0a7c4f',
    fontWeight: '600'
  }
});
