import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, ToastAndroid } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import useExamCountdown from '../src/hooks/useExamCountdown';
import LanguageModeSelector from '../components/LanguageModeSelector';
import { getMode, setMode } from '../src/hooks/useLanguageMode';

export default function SettingsScreen({ navigation }) {
  const { examDate, setExamDate, loading } = useExamCountdown();
  const [selectedDate, setSelectedDate] = useState(examDate || new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [languageMode, setLanguageMode] = useState('english-hausa');

  useEffect(() => {
    if (examDate) {
      setSelectedDate(examDate);
    }
  }, [examDate]);

  useEffect(() => {
    async function loadLanguageMode() {
      const mode = await getMode();
      setLanguageMode(mode);
      setLanguageLoading(false);
    }

    loadLanguageMode();
  }, []);

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const handleLanguageChange = async (nextMode) => {
    try {
      const saved = await setMode(nextMode);
      setLanguageMode(saved);
      setSavedMessage('Language updated! Ka yi kyau!');
      showToast('Language updated! Ka yi kyau!');
      setTimeout(() => setSavedMessage(''), 2200);
    } catch (error) {
      console.warn('[SettingsScreen] set language mode failed', error);
      Alert.alert('Save failed', 'Could not update language mode. Try again.');
    }
  };

  const handleDateChange = (_, date) => {
    if (Platform.OS !== 'ios') {
      setShowPicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = async () => {
    try {
      await setExamDate(selectedDate);
      setSavedMessage('Exam date saved');
      setTimeout(() => setSavedMessage(''), 1800);
    } catch (error) {
      console.warn('[SettingsScreen] save exam date failed', error);
      Alert.alert('Save failed', 'Could not save the exam date. Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Exam Date</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Content Language</Text>
        <LanguageModeSelector value={languageMode} onChange={handleLanguageChange} />
        <Text style={styles.label}>Choose your JAMB exam date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateButtonText}>{selectedDate ? selectedDate.toDateString() : 'Select date'}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Loading…' : 'Save exam date'}</Text>
        </TouchableOpacity>

        {savedMessage ? <Text style={styles.savedText}>{savedMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f1',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  backText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0a7c4f',
  },
  body: {
    padding: 20,
  },
  label: {
    color: '#4b6d4d',
    fontSize: 16,
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d7ded5',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#0a7c4f',
    fontWeight: '700',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#0a7c4f',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  savedText: {
    marginTop: 16,
    color: '#0a7c4f',
    fontWeight: '700',
  },
});
