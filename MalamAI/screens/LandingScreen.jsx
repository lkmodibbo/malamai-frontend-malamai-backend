import { View, Text, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a7c4f' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a7c4f" />

      {/* Top decorative bar */}
      <View style={{ height: 4, backgroundColor: '#f5a623' }} />

      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <View style={{
            width: 50, height: 50, borderRadius: 50,
            backgroundColor: '#f5a623', alignItems: 'center',
            justifyContent: 'center', marginBottom: 14,
            shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10
          }}>
            <Text style={{ fontSize: 14 }}>🎓</Text>
          </View>

          <Text style={{
            fontSize: 20, fontWeight: 'bold',
            color: '#ffffff', letterSpacing: 2, marginBottom: 8
          }}>
            CrackJAMB
          </Text>

          <Text style={{
            fontSize: 16, color: '#d4f1e4',
            textAlign: 'center', marginBottom: 6
          }}>
            Your personal JAMB Tutor
          </Text>

          <Text style={{
            fontSize: 14, color: '#f5a623',
            textAlign: 'center', fontStyle: 'italic', marginBottom: 24
          }}>
            "Ilimi shine maɓallin nasara" — Knowledge is the key to success
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Subjects')}
            style={{
              backgroundColor: '#f5a623', paddingVertical: 10,
              paddingHorizontal: 20, borderRadius: 20,
              shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8
            }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0a7c4f' }}>
              Fara Karatu — Start Studying
            </Text>
          </TouchableOpacity>
        </View>

        <ExamCountdownCard
          daysRemaining={daysRemaining}
          progressPercent={progressPercent}
          examDate={examDate}
          onSetDate={() => navigation.navigate('Settings')}
        />

        <TodaysPlanCard
          weakTopics={weakTopics}
          visitedTopics={[]}
          onStudyNow={handleStudyNow}
        />

        <HomeWeaknessCard navigation={navigation} />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 24 }}>
          {['📐 Maths', '📖 English', '⚗️ Chemistry', '⚡ Physics'].map((subject) => (
            <View key={subject} style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20,
              width: '48%',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>{subject}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={{ height: 4, backgroundColor: '#f5a623' }} />

    </SafeAreaView>
  );
}