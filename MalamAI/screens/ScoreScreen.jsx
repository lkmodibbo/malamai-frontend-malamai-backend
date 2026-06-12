import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScoreScreen({ route, navigation }) {
  const { score = 0, total = 0, weakTopics = [], review = [], motivation } = route.params || {};

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