import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SubjectCard({ name, emoji, color = '#0a7c4f', onPress }) {
	return (
		<TouchableOpacity style={[styles.card, { backgroundColor: color }]} onPress={onPress}>
			<Text style={styles.emoji}>{emoji}</Text>
			<Text style={styles.name}>{name}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		width: '48%',
		aspectRatio: 1,
		borderRadius: 16,
		padding: 16,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
		shadowColor: '#000',
		shadowOpacity: 0.12,
		shadowRadius: 6,
	},
	emoji: {
		fontSize: 36,
		marginBottom: 8,
	},
	name: {
		color: '#fff',
		fontWeight: '700',
		textAlign: 'center'
	}
});
