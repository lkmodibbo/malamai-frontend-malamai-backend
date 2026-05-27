import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScoreScreen({ route, navigation }) {
  const { score = 0, total = 0, weakTopics = [] } = route.params || {};

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  let message = 'Good effort! Keep practicing to improve.';
  if (percent >= 80) message = 'Excellent work — you are ready!';
  else if (percent >= 50) message = 'Nice progress — a bit more practice will help.';

  let hausa = 'Ka yi ƙoƙari! Ci gaba da yin nazari.';
  if (percent >= 80) hausa = 'Nagode — Ka yi kyau sosai!';
  else if (percent >= 50) hausa = 'Ka yi kyau — kada ka damu, ka ci gaba da karatu.';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f5f3' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Final Score</Text>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{score}/{total}</Text>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>

        <Text style={styles.message}>{message}</Text>
        <Text style={styles.hausa}>{hausa}</Text>

        {weakTopics && weakTopics.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={{ fontWeight: '700', color: '#0a7c4f' }}>Weak areas to review</Text>
            {weakTopics.map((t, i) => (
              <Text key={i} style={{ marginTop: 6 }}>• {t}</Text>
            ))}
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
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a7c4f'
  },
  scoreBox: {
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%'
  },
  scoreText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0a7c4f'
  },
  percentText: {
    marginTop: 8,
    fontSize: 18,
    color: '#666'
  },
  message: {
    marginTop: 18,
    fontSize: 16,
    textAlign: 'center'
  },
  hausa: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#f5a623'
  },
  btn: {
    marginTop: 24,
    backgroundColor: '#0a7c4f',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30
  },
  btnText: {
    color: '#fff',
    fontWeight: '800'
  }
});
