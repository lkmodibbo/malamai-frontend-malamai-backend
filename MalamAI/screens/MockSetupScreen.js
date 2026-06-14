import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SUBJECTS from '../constants/subjects';

export default function MockSetupScreen({ navigation }) {
  const [selectedSubjects, setSelectedSubjects] = useState(SUBJECTS.slice(0, 4).map((subject) => subject.id));

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((current) => {
      const isSelected = current.includes(subjectId);
      if (isSelected) {
        return current.filter((id) => id !== subjectId);
      }

      if (current.length >= 4) {
        Alert.alert('Limit reached', 'You can only select 4 JAMB subjects for the mock exam.');
        return current;
      }

      return [...current, subjectId];
    });
  };

  const handleStart = () => {
    if (selectedSubjects.length !== 4) {
      Alert.alert('Select 4 subjects', 'Please choose exactly 4 subjects before starting the mock exam.');
      return;
    }

    navigation.navigate('MockExam', { subjectIds: selectedSubjects });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mock Exam Setup</Text>
        <Text style={styles.subtitle}>Select your 4 registered JAMB subjects.</Text>

        <View style={styles.list}> 
          {SUBJECTS.map((subject) => {
            const selected = selectedSubjects.includes(subject.id);
            return (
              <TouchableOpacity
                key={subject.id}
                style={[styles.item, selected && styles.itemSelected]}
                onPress={() => toggleSubject(subject.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  <Text style={[styles.checkboxLabel, selected && styles.checkboxLabelActive]}>{selected ? '✓' : ''}</Text>
                </View>
                <View>
                  <Text style={[styles.itemTitle, selected && styles.itemTitleSelected]}>{subject.emoji} {subject.name}</Text>
                  <Text style={styles.itemSubtitle}>{subject.topics[0]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>Start Mock Exam</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0a7c4f',
    marginBottom: 8,
  },
  subtitle: {
    color: '#555',
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  list: {
    marginBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6faf6',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e8e2',
  },
  itemSelected: {
    borderColor: '#0a7c4f',
    backgroundColor: '#e8f4ea',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0a7c4f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxSelected: {
    backgroundColor: '#0a7c4f',
  },
  checkboxLabel: {
    color: '#0a7c4f',
    fontWeight: '900',
  },
  checkboxLabelActive: {
    color: '#fff',
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0a7c4f',
  },
  itemTitleSelected: {
    color: '#0a7c4f',
  },
  itemSubtitle: {
    color: '#5d5d5d',
    marginTop: 4,
    fontSize: 13,
  },
  startBtn: {
    marginTop: 12,
    backgroundColor: '#0a7c4f',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
