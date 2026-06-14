import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import LandingScreen from './screens/LandingScreen';
import SubjectScreen from './screens/SubjectScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LearnScreen from './screens/LearnScreen';
import MockSetupScreen from './screens/MockSetupScreen';
import MockExamScreen from './screens/MockExamScreen';
import MockScoreScreen from './screens/MockScoreScreen';
import ReviewScreen from './screens/ReviewScreen';
import PastQuestionsScreen from './screens/PastQuestionsScreen';
import WeaknessScreen from './screens/WeaknessScreen';
import NotesScreen from './screens/NotesScreen';
import EditNoteScreen from './screens/EditNoteScreen';
import ScoreScreen from './screens/ScoreScreen';
import SettingsScreen from './screens/SettingsScreen';
import ChatScreen from './screens/ChatScreen';
import { isOnboardingComplete } from './src/hooks/useStudentProfile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0a7c4f', tabBarInactiveTintColor: '#6d8a70' }}>
      <Tab.Screen name="Home" component={LandingScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Subjects" component={SubjectScreen} options={{ tabBarLabel: 'Subjects' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      const complete = await isOnboardingComplete();
      setShowOnboarding(!complete);
      setReady(true);
    }

    checkOnboarding();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={showOnboarding ? 'Onboarding' : 'MainTabs'}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Learn" component={LearnScreen} />
        <Stack.Screen name="MockSetup" component={MockSetupScreen} />
        <Stack.Screen name="MockExam" component={MockExamScreen} />
        <Stack.Screen name="MockScore" component={MockScoreScreen} />
        <Stack.Screen name="PastQuestions" component={PastQuestionsScreen} />
        <Stack.Screen name="Weakness" component={WeaknessScreen} />
        <Stack.Screen name="Notes" component={NotesScreen} />
        <Stack.Screen name="EditNote" component={EditNoteScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Score" component={ScoreScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
