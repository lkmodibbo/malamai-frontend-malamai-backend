import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a7c4f' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a7c4f" />

      {/* Top decorative bar */}
      <View style={{ height: 4, backgroundColor: '#f5a623' }} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

        {/* Logo circle */}
        <View style={{
          width: 100, height: 100, borderRadius: 50,
          backgroundColor: '#f5a623', alignItems: 'center',
          justifyContent: 'center', marginBottom: 24,
          shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10
        }}>
         <Text style={{ fontSize: 42 }}>🎓</Text>
        </View>

        {/* App name */}
        <Text style={{
          fontSize: 42, fontWeight: 'bold',
          color: '#ffffff', letterSpacing: 2, marginBottom: 8
        }}>
          MalamAI
        </Text>

        {/* English tagline */}
        <Text style={{
          fontSize: 16, color: '#d4f1e4',
          textAlign: 'center', marginBottom: 6
        }}>
          Your personal JAMB & WAEC tutor
        </Text>

        {/* Hausa tagline */}
        <Text style={{
          fontSize: 14, color: '#f5a623',
          textAlign: 'center', fontStyle: 'italic', marginBottom: 60
        }}>
          "Ilimi shine maɓallin nasara" — Knowledge is the key to success
        </Text>

        {/* Start button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Subjects')}
          style={{
            backgroundColor: '#f5a623', paddingVertical: 14,
            paddingHorizontal: 28, borderRadius: 30,
            shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8
          }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0a7c4f' }}>
            Fara Karatu — Start Studying
          </Text>
        </TouchableOpacity>

        {/* Subjects preview */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 40, gap: 8 }}>
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

      </View>

      {/* Bottom bar */}
      <View style={{ height: 4, backgroundColor: '#f5a623' }} />

    </SafeAreaView>
  );
}