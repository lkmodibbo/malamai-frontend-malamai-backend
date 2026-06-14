import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useWeaknessTracker from '../src/hooks/useWeaknessTracker';
import SUBJECTS from '../constants/subjects';

const getSubjectEmoji = (subjectId, subjectName) => {
  const subject = SUBJECTS.find((item) => item.id === subjectId || item.name === subjectName);
  return subject?.emoji || '📘';
};

export default function HomeWeaknessCard({ navigation }) {
  const { getWeakTopics } = useWeaknessTracker();
  const [topWeakTopic, setTopWeakTopic] = useState(null);

  useEffect(() => {
    let mounted = true;
    getWeakTopics().then((topics) => {
      if (mounted) setTopWeakTopic(topics[0] || null);
    }).catch((err) => {
      console.warn('[HomeWeaknessCard] failed to load weak topics', err);
    });
    return () => { mounted = false; };
  }, [getWeakTopics]);

  if (!topWeakTopic) return null;

  const emoji = getSubjectEmoji(topWeakTopic.subjectId, topWeakTopic.subjectName);
  const subject = {
    id: topWeakTopic.subjectId,
    name: topWeakTopic.subjectName,
    emoji,
  };

  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.title}>Focus Area</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>{emoji} {topWeakTopic.topic}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.studyBtn}
            onPress={() => navigation.navigate('Learn', { subject, topic: topWeakTopic.topic })}
            activeOpacity={0.8}
          >
            <Text style={styles.studyBtnText}>Study Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Weakness')}
            activeOpacity={0.8}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
    width: '100%',
  },
  accent: {
    width: 10,
    backgroundColor: '#f5a623',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  title: {
    color: '#0a7c4f',
    fontSize: 14,
    fontWeight: '800',
  },
  body: {
    color: '#0f5d30',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studyBtn: {
    backgroundColor: '#0a7c4f',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  studyBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  viewAllText: {
    color: '#0a7c4f',
    fontSize: 14,
    fontWeight: '700',
  },
});
