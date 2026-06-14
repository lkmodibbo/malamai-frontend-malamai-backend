import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function HomeReviewCard({ dueCount = 0, onPress }) {
  if (dueCount <= 0) return null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.row}>
        <Text style={styles.icon}>🧠</Text>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Review Due</Text>
          <Text style={styles.subtitle}>You have {dueCount} questions to review today</Text>
        </View>
      </View>
      <View style={styles.badgeContainer}>
        <Text style={styles.badge}>{dueCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0a7c4f',
    padding: 18,
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: '#d7f7e2',
    fontSize: 14,
  },
  badgeContainer: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  badge: {
    backgroundColor: '#f5a623',
    color: '#0a7c4f',
    fontWeight: '800',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 14,
  },
});
