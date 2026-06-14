import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ExamCountdownCard({ daysRemaining, progressPercent, examDate, onSetDate }) {
  const hasDate = Boolean(examDate);
  const examText = hasDate
    ? daysRemaining < 0
      ? 'JAMB day has arrived! Ka shirya? Good luck!'
      : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} to JAMB`
    : 'Set your exam date';

  const progressValue = hasDate ? progressPercent : 0;
  const progressWidth = `${Math.min(Math.max(progressValue, 0), 100)}%`;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.countdownText}>{examText}</Text>
        {!hasDate && (
          <TouchableOpacity onPress={onSetDate}>
            <Text style={styles.linkText}>Set exam date</Text>
          </TouchableOpacity>
        )}
      </View>
      {hasDate && daysRemaining >= 0 && (
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      )}
      {hasDate && daysRemaining < 0 && (
        <Text style={styles.arrivedText}>Your exam date is today or has passed.</Text>
      )}
      {!hasDate && (
        <Text style={styles.helpText}>Add your JAMB date so MalamAI can build a daily study plan.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#0a7c4f',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  countdownText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
    marginRight: 10,
  },
  linkText: {
    color: '#f5a623',
    fontWeight: '800',
    fontSize: 12,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#174b35',
    borderRadius: 999,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#f5a623',
    borderRadius: 999,
  },
  arrivedText: {
    color: '#d7f1dc',
    marginTop: 12,
    fontSize: 12,
  },
  helpText: {
    color: '#d7f1dc',
    marginTop: 12,
    fontSize: 12,
  },
});
