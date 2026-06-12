import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SUBJECTS from '../constants/subjects';
import SubjectCard from '../components/SubjectCard';

// Enable animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SubjectScreen({ navigation }) {
  const [openSubjectId, setOpenSubjectId] = useState(null);

  const toggleDropdown = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSubjectId(openSubjectId === id ? null : id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f5f3' }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Landing')}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Choose a Subject</Text>

        {/* Subject Cards Grid */}
        <View style={styles.grid}>
          {SUBJECTS.map((s) => (
            <SubjectCard
              key={s.id}
              name={s.name}
              emoji={s.emoji}
              color={s.color}
              onPress={() => navigation.navigate('Learn', { subject: s })}
            />
          ))}
        </View>

        {/* Preview Topics Dropdown */}
        <Text style={styles.subtitle}>Preview Topics</Text>

        {SUBJECTS.map((s) => {
          const isOpen = openSubjectId === s.id;
          return (
            <View key={s.id} style={styles.dropdownWrapper}>

              {/* Dropdown Header */}
              <TouchableOpacity
                style={[styles.dropdownHeader, isOpen && styles.dropdownHeaderOpen]}
                onPress={() => toggleDropdown(s.id)}
              >
                <Text style={styles.dropdownHeaderText}>{s.emoji} {s.name}</Text>
                <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Dropdown Body */}
              {isOpen && (
                <View style={styles.dropdownBody}>
                  {s.topics.map((topic, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.topicRow}
                      onPress={() => navigation.navigate('Learn', { subject: s, topic })}
                    >
                      <Text style={styles.topicDot}>•</Text>
                      <Text style={styles.topicText}>{topic}</Text>
                      <Text style={styles.topicArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#0a7c4f',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#fff',
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a7c4f',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a7c4f',
    marginBottom: 10,
    alignSelf: 'center',
  },

  // Dropdown
  dropdownWrapper: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d0e8dc',
  },
  dropdownHeader: {
    backgroundColor: '#f5a623',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownHeaderOpen: {
    backgroundColor: '#0a7c4f',
  },
  dropdownHeaderText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#fff',
  },
  arrow: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownBody: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topicDot: {
    color: '#f5a623',
    fontSize: 18,
    marginRight: 8,
  },
  topicText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  topicArrow: {
    color: '#0a7c4f',
    fontWeight: '700',
    fontSize: 16,
  },
});
