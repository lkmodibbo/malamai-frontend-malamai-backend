import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SUBJECTS from '../constants/subjects';

function normalizeKey(subjectId, topic) {
  return `${String(subjectId || '').trim().toLowerCase()}|${String(topic || '').trim().toLowerCase()}`;
}

function getSubjectByIdOrName(subjectId, subjectName) {
  return SUBJECTS.find((subject) => subject.id === subjectId || subject.name === subjectName);
}

function buildSuggestions(weakTopics = [], visitedTopics = []) {
  const seenKeys = new Set();
  const visitedKeys = new Set(visitedTopics.map((item) => String(item || '').trim().toLowerCase()));
  const suggestions = [];

  function pushSuggestion(subjectId, subjectName, topic) {
    const key = normalizeKey(subjectId, topic);
    if (!topic || seenKeys.has(key)) return;
    if (visitedKeys.has(key)) return;
    const subject = getSubjectByIdOrName(subjectId, subjectName);
    suggestions.push({ subjectId, subjectName, topic, emoji: subject?.emoji || '📘' });
    seenKeys.add(key);
  }

  weakTopics.forEach((item) => {
    if (!item || !item.topic) return;
    pushSuggestion(item.subjectId, item.subjectName, item.topic);
  });

  if (suggestions.length >= 2) return suggestions.slice(0, 2);

  SUBJECTS.forEach((subject) => {
    subject.topics.forEach((topic) => {
      if (suggestions.length >= 2) return;
      pushSuggestion(subject.id, subject.name, topic);
    });
  });

  if (suggestions.length === 0) {
    SUBJECTS.slice(0, 2).forEach((subject) => {
      if (suggestions.length >= 2) return;
      pushSuggestion(subject.id, subject.name, subject.topics[0]);
    });
  }

  return suggestions.slice(0, 2);
}

export default function TodaysPlanCard({ weakTopics = [], visitedTopics = [], onStudyNow }) {
  const suggestions = useMemo(
    () => buildSuggestions(weakTopics, visitedTopics),
    [weakTopics, visitedTopics]
  );

  return (
    <View style={styles.card}>
      <Text style={styles.header}>📅 Today's Plan</Text>
      {suggestions.length === 0 ? (
        <Text style={styles.emptyText}>All topics are covered for today. Check your subjects and continue learning.</Text>
      ) : (
        suggestions.map((suggestion, index) => (
          <View key={`${suggestion.subjectId}-${suggestion.topic}-${index}`} style={styles.row}>
            <Text style={styles.topicLabel}>{suggestion.emoji} {suggestion.topic}</Text>
            <TouchableOpacity onPress={() => onStudyNow(suggestion)}>
              <Text style={styles.studyLink}>Study now →</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  header: {
    color: '#0a7c4f',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#edf1ea',
  },
  topicLabel: {
    color: '#0a7c4f',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  studyLink: {
    color: '#f5a623',
    fontWeight: '800',
    fontSize: 12,
  },
  emptyText: {
    color: '#556c58',
    fontSize: 12,
    lineHeight: 18,
  },
});
