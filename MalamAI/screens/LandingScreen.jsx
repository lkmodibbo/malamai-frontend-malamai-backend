import { View, Text, TouchableOpacity, StatusBar, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useRequireAuth from '../src/hooks/useRequireAuth';
import StudentIllustration from '../components/StudentIllustration';
import HeroCarousel from '../components/HeroCarousel';

const FEATURES = [
  {
    emoji: '🤖',
    title: 'AI-Powered Tutor',
    body: 'Ask any JAMB question and get a clear, step-by-step explanation — anytime, anywhere.',
  },
  {
    emoji: '📝',
    title: 'Practice Quizzes',
    body: 'Sharpen your skills with AI-generated questions across all 16 UTME subjects.',
  },
  {
    emoji: '🎓',
    title: 'Full Mock Exams',
    body: 'Simulate the real JAMB experience — 80 questions, 90 minutes, instant score breakdown.',
  },
  {
    emoji: '🗂️',
    title: 'Flashcards',
    body: 'Master key concepts fast with auto-generated flashcards for every topic.',
  },
  {
    emoji: '📊',
    title: 'Track Your Progress',
    body: 'See your weak areas, monitor improvement, and focus your study where it matters most.',
  },
  {
    emoji: '📓',
    title: 'Personal Notes',
    body: 'Save AI explanations as notes and review them anytime — even offline.',
  },
];

const SUBJECTS_PREVIEW = [
  { emoji: '📐', name: 'Mathematics' },
  { emoji: '📖', name: 'English' },
  { emoji: '⚡', name: 'Physics' },
  { emoji: '⚗️', name: 'Chemistry' },
  { emoji: '🧬', name: 'Biology' },
  { emoji: '💰', name: 'Economics' },
  { emoji: '🏛️', name: 'Government' },
  { emoji: '🌍', name: 'Geography' },
];

export default function LandingScreen({ navigation }) {
  const requireAuth = useRequireAuth(navigation);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🚀 AI-Powered JAMB Preparation</Text>
          </View>
          <Text style={styles.heroTitle}>Crack JAMB with{'\n'}AI by your side</Text>
          <Text style={styles.heroSub}>
            The smartest way to prepare for UTME.{'\n'}
            Study smarter, not harder — Ka yi kyau!
          </Text>

          {/* Image carousel */}
          <View style={styles.illustrationWrap}>
            <HeroCarousel />
          </View>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => requireAuth(() => navigation.navigate('Subjects'))}
            activeOpacity={0.88}
          >
            <Text style={styles.heroBtnText}>Start Studying Free →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroSecondaryBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.heroSecondaryText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          {[
            { val: '16', label: 'Subjects' },
            { val: '400+', label: 'Topics' },
            { val: 'AI', label: 'Powered' },
            { val: '24/7', label: 'Available' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Motivational side card */}
        <View style={styles.motivationCard}>
          <Image
            source={require('../assets/Images/JambImage-3.jpeg')}
            style={styles.motivationImage}
            resizeMode="cover"
          />
          <View style={styles.motivationContent}>
            <Text style={styles.motivationQuote}>
              "Every great scorer{'\n'}started exactly{'\n'}where you are."
            </Text>
            <Text style={styles.motivationSub}>
              Thousands of Nigerian students passed JAMB with the right preparation.{'\n'}
              Today is your day to start.
            </Text>
            <View style={styles.motivationTag}>
              <Text style={styles.motivationTagText}>💡 Start now</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>Everything you need to score high</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureBody}>{f.body}</Text>
            </View>
          ))}
        </View>

        {/* Subjects preview */}
        <Text style={styles.sectionTitle}>All major JAMB subjects covered</Text>
        <View style={styles.subjectsGrid}>
          {SUBJECTS_PREVIEW.map((s) => (
            <TouchableOpacity
              key={s.name}
              style={styles.subjectChip}
              onPress={() => requireAuth(() => navigation.navigate('Subjects'))}
              activeOpacity={0.8}
            >
              <Text style={styles.subjectEmoji}>{s.emoji}</Text>
              <Text style={styles.subjectName}>{s.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.subjectChip, styles.subjectChipMore]}
            onPress={() => requireAuth(() => navigation.navigate('Subjects'))}
          >
            <Text style={styles.subjectMoreText}>+8 more →</Text>
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepsCol}>
          {[
            { step: '1', title: 'Pick a subject', body: 'Choose from all 16 UTME subjects and select a topic.' },
            { step: '2', title: 'Learn with AI', body: 'Get a clear explanation with Nigerian examples you can relate to.' },
            { step: '3', title: 'Practice & test yourself', body: 'Answer AI-generated quiz questions and track your score.' },
            { step: '4', title: 'Review & improve', body: 'See corrections, save notes, and focus on your weak areas.' },
          ].map((s) => (
            <View key={s.step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{s.step}</Text>
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepBody}>{s.body}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Ilimi shine maɓallin nasara"
          </Text>
          <Text style={styles.quoteTranslation}>Knowledge is the key to success</Text>
        </View>

        {/* Final CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => requireAuth(() => navigation.navigate('Subjects'))}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaBtnText}>Get Started — It's Free</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  container: { padding: 16 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 28,
  },
  heroBadge: {
    backgroundColor: '#e6f0ff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c5d8ff',
  },
  heroBadgeText: { color: '#1b2a4a', fontWeight: '700', fontSize: 13 },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1b2a4a',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 15,
    color: '#6b7c9a',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  heroBtn: {
    backgroundColor: '#1b2a4a',
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  heroBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  heroSecondaryBtn: { paddingVertical: 6 },
  heroSecondaryText: { color: '#2e4a7a', fontWeight: '600', fontSize: 13 },

  illustrationWrap: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1b2a4a',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 28,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statVal: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#b0bfd8', fontSize: 11, marginTop: 3 },

  // Motivation card
  motivationCard: {
    flexDirection: 'row',
    backgroundColor: '#1b2a4a',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 28,
    minHeight: 180,
  },
  motivationImage: {
    width: '42%',
    height: '100%',
    minHeight: 180,
  },
  motivationContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  motivationQuote: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 21,
    marginBottom: 10,
  },
  motivationSub: {
    color: '#b0bfd8',
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 14,
  },
  motivationTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  motivationTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Section titles
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1b2a4a',
    marginBottom: 14,
  },

  // Features grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  featureCard: {
    width: '47.5%',
    backgroundColor: '#f4f6fb',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dde3ef',
  },
  featureEmoji: { fontSize: 26, marginBottom: 8 },
  featureTitle: { fontSize: 13, fontWeight: '800', color: '#1b2a4a', marginBottom: 4 },
  featureBody: { fontSize: 12, color: '#6b7c9a', lineHeight: 17 },

  // Subjects
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f4f6fb',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#dde3ef',
  },
  subjectChipMore: {
    backgroundColor: '#1b2a4a',
    borderColor: '#1b2a4a',
  },
  subjectEmoji: { fontSize: 15 },
  subjectName: { fontSize: 12, fontWeight: '700', color: '#1b2a4a' },
  subjectMoreText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },

  // Steps
  stepsCol: { gap: 12, marginBottom: 28 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#f4f6fb',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dde3ef',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1b2a4a',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: { color: '#ffffff', fontWeight: '900', fontSize: 14 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '800', color: '#1b2a4a', marginBottom: 3 },
  stepBody: { fontSize: 12, color: '#6b7c9a', lineHeight: 18 },

  // Quote
  quoteCard: {
    backgroundColor: '#1b2a4a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 6,
  },
  quoteTranslation: { color: '#b0bfd8', fontSize: 12, textAlign: 'center' },

  // CTA
  ctaBtn: {
    backgroundColor: '#1b2a4a',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
});
