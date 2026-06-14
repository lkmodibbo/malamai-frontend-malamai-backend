import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function getCardColors(percent) {
  if (percent >= 50) return { background: '#e6f6ea', border: '#0a7c4f', text: '#0a7c4f' };
  if (percent >= 30) return { background: '#fff4db', border: '#f5a623', text: '#7a4c09' };
  return { background: '#ffe5e5', border: '#b00020', text: '#b00020' };
}

function getMotivation(percent) {
  if (percent >= 50) return 'Nagode! Ka yi kyau sosai — keep the momentum going.';
  if (percent >= 30) return 'Sai haka! Ka na kan hanya, ci gaba da aiki.';
  return 'Kada ka damu. Ka sake nazari, kuma za ka samu mafi kyau nan gaba.';
}

export default function MockScoreScreen({ route, navigation }) {
  const { subjectScores = [], totalScore = 0, predictedScore = 0 } = route.params || {};
  const totalPossible = subjectScores.reduce((sum, item) => sum + item.total, 0);
  const percent = totalPossible ? Math.round((totalScore / totalPossible) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mock Exam Results</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Score</Text>
          <Text style={styles.cardValue}>{totalScore}/{totalPossible}</Text>
          <Text style={styles.cardPercent}>{percent}%</Text>
        </View>

        <View style={styles.predictedCard}>
          <Text style={styles.predictedLabel}>Predicted JAMB Score</Text>
          <Text style={styles.predictedValue}>{predictedScore}</Text>
        </View>

        <View style={styles.section}>
          {subjectScores.map((subject) => {
            const colors = getCardColors(subject.percent);
            return (
              <View key={subject.id} style={[styles.subjectCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                <View style={styles.subjectHeader}>
                  <Text style={[styles.subjectEmoji]}>{subject.emoji}</Text>
                  <Text style={[styles.subjectName, { color: colors.text }]}>{subject.name}</Text>
                </View>
                <Text style={[styles.subjectScore, { color: colors.text }]}>{subject.correct}/{subject.total}</Text>
                <Text style={[styles.subjectPercent, { color: colors.text }]}>{subject.percent}%</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.motivationBox}>
          <Text style={styles.motivationText}>{getMotivation(percent)}</Text>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Subjects')}>
          <Text style={styles.actionText}>Back to Subjects</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f8ff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0a7c4f',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#dbe9de',
    marginBottom: 18,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#666',
    fontWeight: '700',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0a7c4f',
  },
  cardPercent: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#0a7c4f',
  },
  predictedCard: {
    backgroundColor: '#fff7e0',
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#f5a623',
    alignItems: 'center',
    marginBottom: 20,
  },
  predictedLabel: {
    color: '#7a4c09',
    fontWeight: '800',
    marginBottom: 8,
  },
  predictedValue: {
    fontSize: 54,
    fontWeight: '900',
    color: '#7a4c09',
  },
  section: {
    marginBottom: 22,
  },
  subjectCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  subjectEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '800',
  },
  subjectScore: {
    fontSize: 20,
    fontWeight: '800',
  },
  subjectPercent: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  motivationBox: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d6d1ff',
    marginBottom: 24,
  },
  motivationText: {
    color: '#3d2d6d',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '700',
  },
  actionBtn: {
    backgroundColor: '#0a7c4f',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
