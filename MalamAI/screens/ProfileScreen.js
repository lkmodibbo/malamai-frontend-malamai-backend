import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import useStudentProfile from '../src/hooks/useStudentProfile';
import SUBJECTS from '../constants/subjects';

function getInitials(name) {
  if (!name) return 'MA';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ProfileScreen() {
  const { profile, loading, saveProfile } = useStudentProfile();
  const [editingName, setEditingName] = useState(false);
  const [editingSubjects, setEditingSubjects] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftSubjects, setDraftSubjects] = useState(['english']);
  const [draftExamDate, setDraftExamDate] = useState(new Date());
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && profile) {
      setDraftName(profile.name || '');
      setDraftSubjects(profile.selectedSubjects || ['english']);
      setDraftExamDate(profile.examDate || new Date());
    }
  }, [loading, profile]);

  const daysRemaining = useMemo(() => {
    if (!profile?.examDate) return null;
    const today = new Date();
    const target = new Date(profile.examDate);
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / 86400000));
  }, [profile]);

  const selectedTags = useMemo(() => {
    return SUBJECTS.filter((subject) => draftSubjects.includes(subject.id));
  }, [draftSubjects]);

  const handleSubjectToggle = (subjectId) => {
    if (subjectId === 'english') return;
    setDraftSubjects((current) => {
      if (current.includes(subjectId)) {
        return current.filter((id) => id !== subjectId);
      }
      return [...current, subjectId];
    });
  };

  const updateProfileField = async (field) => {
    try {
      if (!profile) return;
      const nextProfile = {
        ...profile,
        name: field === 'name' ? draftName.trim() : profile.name,
        selectedSubjects: field === 'subjects' ? draftSubjects : profile.selectedSubjects,
        examDate: field === 'date' ? draftExamDate : profile.examDate,
      };
      await saveProfile(nextProfile);
      setMessage('Profile updated');
      setEditingName(false);
      setEditingSubjects(false);
      setShowDatePicker(false);
      setTimeout(() => setMessage(''), 2200);
    } catch (error) {
      console.warn('[ProfileScreen] updateProfileField failed', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingRoot}>
        <Text style={styles.loadingText}>Loading profile…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(profile?.name)}</Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.nameLabel}>Student Name</Text>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Enter your name"
                placeholderTextColor="#8a9c8a"
              />
            ) : (
              <Text style={styles.nameValue}>{profile?.name || 'Your name'}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => {
            setEditingName(!editingName);
            setEditingSubjects(false);
            setShowDatePicker(false);
          }}>
            <Text style={styles.editButtonText}>{editingName ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {editingName && (
          <TouchableOpacity style={styles.saveButton} onPress={() => updateProfileField('name')}>
            <Text style={styles.saveButtonText}>Save Name</Text>
          </TouchableOpacity>
        )}

        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Exam countdown</Text>
          <View style={styles.countdownChip}>
            <Text style={styles.countdownText}>{daysRemaining !== null ? `${daysRemaining} days to go` : 'Set your exam date'}</Text>
          </View>
          <TouchableOpacity style={styles.editSmallButton} onPress={() => {
            setShowDatePicker(true);
            setEditingName(false);
            setEditingSubjects(false);
          }}>
            <Text style={styles.editSmallText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Selected Subjects</Text>
            <TouchableOpacity style={styles.editSmallButton} onPress={() => {
              setEditingSubjects(!editingSubjects);
              setEditingName(false);
              setShowDatePicker(false);
            }}>
              <Text style={styles.editSmallText}>{editingSubjects ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tagsRow}>
            {selectedTags.map((subject) => (
              <View key={subject.id} style={styles.tagChip}>
                <Text style={styles.tagText}>{subject.emoji} {subject.name}</Text>
              </View>
            ))}
          </View>

          {editingSubjects && (
            <View style={styles.subjectGrid}>
              {SUBJECTS.map((subject) => {
                const selected = draftSubjects.includes(subject.id);
                const locked = subject.id === 'english';
                return (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectItem,
                      selected ? styles.subjectItemSelected : styles.subjectItemDefault,
                      locked && styles.subjectItemLocked,
                    ]}
                    onPress={() => handleSubjectToggle(subject.id)}
                    activeOpacity={locked ? 1 : 0.7}
                  >
                    <Text style={[styles.subjectItemText, selected && styles.subjectItemTextSelected]}>
                      {subject.emoji} {subject.name}
                    </Text>
                    {locked && <Text style={styles.lockText}>🔒</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.editDateBlock}>
          <Text style={styles.sectionTitle}>Exam date</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateValue}>{profile?.examDate ? new Date(profile.examDate).toDateString() : 'Not set yet'}</Text>
            <TouchableOpacity style={styles.editSmallButton} onPress={() => {
              setShowDatePicker(true);
              setEditingName(false);
              setEditingSubjects(false);
            }}>
              <Text style={styles.editSmallText}>Edit</Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={draftExamDate || new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                if (Platform.OS !== 'ios') {
                  setShowDatePicker(false);
                }
                if (date) setDraftExamDate(date);
              }}
              minimumDate={new Date()}
            />
          )}
          {showDatePicker && (
            <TouchableOpacity style={styles.saveButton} onPress={() => updateProfileField('date')}>
              <Text style={styles.saveButtonText}>Save Exam Date</Text>
            </TouchableOpacity>
          )}
        </View>

        {editingSubjects && (
          <TouchableOpacity style={styles.saveButton} onPress={() => updateProfileField('subjects')}>
            <Text style={styles.saveButtonText}>Save Subjects</Text>
          </TouchableOpacity>
        )}

        {message ? <Text style={styles.messageText}>{message}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f7f1',
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7f1',
  },
  loadingText: {
    color: '#0a7c4f',
    fontWeight: '700',
    fontSize: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0a7c4f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  nameBlock: {
    flex: 1,
  },
  nameLabel: {
    color: '#6d8a70',
    fontSize: 13,
    marginBottom: 4,
  },
  nameValue: {
    color: '#173726',
    fontSize: 24,
    fontWeight: '800',
  },
  nameInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d6e4d7',
    padding: 14,
    fontSize: 16,
    color: '#1a382b',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  countdownCard: {
    backgroundColor: '#fdf2d1',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  countdownLabel: {
    color: '#7a6b29',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  countdownChip: {
    backgroundColor: '#f5a623',
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  countdownText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  editSmallButton: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  editSmallText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  sectionBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#0a7c4f',
    fontSize: 16,
    fontWeight: '800',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 14,
  },
  tagChip: {
    backgroundColor: '#eef7ed',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    margin: 6,
  },
  tagText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  subjectItem: {
    width: '48%',
    margin: 8,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  subjectItemDefault: {
    backgroundColor: '#f5f8f3',
    borderColor: '#d5e3d3',
  },
  subjectItemSelected: {
    backgroundColor: '#0a7c4f',
    borderColor: '#0a7c4f',
  },
  subjectItemText: {
    color: '#1b432d',
    fontWeight: '700',
    fontSize: 13,
  },
  subjectItemTextSelected: {
    color: '#ffffff',
  },
  subjectItemLocked: {
    opacity: 0.9,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dateValue: {
    color: '#314b36',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 16,
  },
  editDateBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#0a7c4f',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 14,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  messageText: {
    color: '#0a7c4f',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
});
