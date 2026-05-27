import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function QuestionCard({ question = '', options = {}, onSelect }) {
	return (
		<View style={styles.card}>
			<Text style={styles.question}>{question}</Text>
			{Object.entries(options).map(([key, text]) => (
				<TouchableOpacity key={key} style={styles.option} onPress={() => onSelect && onSelect(key)}>
					<Text style={styles.optionText}>{key}. {text}</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		padding: 12,
		borderRadius: 12,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 6,
		marginBottom: 12
	},
	question: {
		fontSize: 16,
		fontWeight: '700',
		color: '#0a7c4f',
		marginBottom: 10
	},
	option: {
		backgroundColor: '#f2f6f3',
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 10,
		marginBottom: 8
	},
	optionText: {
		color: '#0a7c4f',
		fontWeight: '600'
	}
});
