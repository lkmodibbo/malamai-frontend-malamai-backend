import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SUBJECTS from '../constants/subjects';
import SubjectCard from '../components/SubjectCard';
import TopicList from '../components/TopicList';

export default function SubjectScreen({ navigation }) {
	const [previewSubject, setPreviewSubject] = useState(null);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#f2f5f3' }}>
			<ScrollView contentContainerStyle={styles.container}>
				<TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Landing')}>
					<Text style={styles.backText}>← Back to Home</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Choose a subject</Text>

				<View style={styles.grid}>
					{SUBJECTS.map((s) => (
						<SubjectCard
							key={s.id}
							name={s.name}
							emoji={s.emoji}
							color={s.color}
							onPress={() => navigation.navigate('Learn', { subject: s })}
						/>
					))}
				</View>

				<Text style={styles.subtitle}>Or preview topics</Text>
				<View style={styles.chipsRow}>
					{SUBJECTS.map((s) => (
						<TouchableOpacity key={s.id} style={styles.chip} onPress={() => setPreviewSubject(s)}>
							<Text style={styles.chipText}>{s.emoji} {s.name.split(' ')[0]}</Text>
						</TouchableOpacity>
					))}
				</View>

				{previewSubject && (
					<TopicList
						subjectName={previewSubject.name}
						topics={previewSubject.topics}
						onSelectTopic={(topic) => navigation.navigate('Learn', { subject: previewSubject, topic })}
					/>
				)}

			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
		color: '#0a7c4f',
		marginBottom: 12
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between'
	},
	subtitle: {
		marginTop: 18,
		color: '#0a7c4f',
		fontWeight: '700',
		textAlign: 'center',
		alignSelf: 'center'
	},
	chipsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginTop: 8
	},
	chip: {
		backgroundColor: '#f5a623',
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 20,
		width: '48%',
		alignItems: 'center',
		marginBottom: 8,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 6,
	},
	chipText: {
		color: '#0a7c4f',
		fontWeight: '700'
	},
	backButton: {
		marginBottom: 16,
		paddingVertical: 10,
		paddingHorizontal: 14,
		backgroundColor: '#0a7c4f',
		borderRadius: 20,
		alignSelf: 'flex-start',
		shadowColor: '#000',
		shadowOpacity: 0.16,
		shadowRadius: 6,
	},
	backText: {
		color: '#fff',
		fontWeight: '700'
	}
});
