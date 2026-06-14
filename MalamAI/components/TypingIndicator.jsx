import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function TypingIndicator() {
  const dotOne = useRef(new Animated.Value(0.35)).current;
  const dotTwo = useRef(new Animated.Value(0.35)).current;
  const dotThree = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const createPulse = (animatedValue, delay) => (
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.35,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(120),
        ]),
      )
    );

    const animations = [
      createPulse(dotOne, 0),
      createPulse(dotTwo, 120),
      createPulse(dotThree, 240),
    ];

    Animated.stagger(80, animations).start();
  }, [dotOne, dotTwo, dotThree]);

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, { transform: [{ scale: dotOne }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ scale: dotTwo }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ scale: dotThree }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#d0e8dc',
  },
  dot: {
    width: 9,
    height: 9,
    marginHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#0a7c4f',
  },
});
