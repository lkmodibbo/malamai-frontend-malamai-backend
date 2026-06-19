import { View, Text, TouchableOpacity, StatusBar, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeWeaknessCard from '../components/HomeWeaknessCard';
import ExamCountdownCard from '../components/ExamCountdownCard';
import TodaysPlanCard from '../components/TodaysPlanCard';
import useExamCountdown from '../src/hooks/useExamCountdown';
import useWeaknessTracker from '../src/hooks/useWeaknessTracker';

export default function LandingScreen({ navigation }) {
  const { examDate, daysRemaining, progressPercent } = useExamCountdown();
  const { weakTopics } = useWeaknessTracker();

  const handleStudyNow = (suggestion) => {
    navigation.navigate('Learn', {
      subject: {
        id: suggestion.subjectId,
        name: suggestion.subjectName,
        emoji: suggestion.emoji,
      },
      topic: suggestion.topic,
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>CrackJAMB</Text>
          <Text style={styles.appSub}>Your personal JAMB tutor</Text>
        </View>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🎓</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Quote */}
        <Text style={styles.quote}>
          "Ilimi shine maɓallin nasara" — Knowledge is the key to success
        </Text>

        {/* Start studying CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Subjects')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>Fara Karatu — Start Studying</Text>
        </TouchableOpacity>

        {/* Exam countdown */}
        <ExamCountdownCard
          daysRemaining={daysRemaining}
          progressPercent={progressPercent}
          examDate={examDate}
          onSetDate={() => navigation.navigate('Settings')}
        />

        {/* Today's plan */}
        <TodaysPlanCard
          weakTopics={weakTopics}
          visitedTopics={[]}
          onStudyNow={handleStudyNow}
        />

        {/* Weakness focus */}
        <HomeWeaknessCard navigation={navigation} />

        {/* Quick subject tiles */}
        <Text style={styles.quickLabel}>Quick access</Text>
        <View style={styles.quickGrid}>
          {[
            { label: 'Maths', emoji: '📐', id: 'mathematics' },
            { label: 'English', emoji: '📖', id: 'english' },
            { label: 'Chemistry', emoji: '⚗️', id: 'chemistry' },
            { label: 'Physics', emoji: '⚡', id: 'physics' },
          ].map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.quickTile}
              onPress={() => navigation.navigate('Learn', {
                subject: { id: s.id, name: s.label, emoji: s.emoji },
              })}
              activeOpacity={0.8}
            >
              <Text style={styles.quickEmoji}>{s.emoji}</Text>
              <Text style={styles.quickTileText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeef6',
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1b2a4a',
    letterSpacing: 0.5,
  },
  appSub: {
    fontSize: 13,
    color: '#6b7c9a',
    marginTop: 2,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1b2a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  container: {
    padding: 16,
  },
  quote: {
    fontSize: 13,
    color: '#6b7c9a',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  ctaBtn: {
    backgroundColor: '#1b2a4a',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  ctaBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7c9a',
    marginBottom: 10,
    marginTop: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickTile: {
    width: '47%',
    backgroundColor: '#f4f6fb',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#dde3ef',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickEmoji: {
    fontSize: 20,
  },
  quickTileText: {
    color: '#1b2a4a',
    fontWeight: '700',
    fontSize: 13,
  },
});
