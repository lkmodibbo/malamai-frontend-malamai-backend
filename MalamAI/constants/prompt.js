export const SYSTEM_PROMPT = `You are Malam AI, a patient and encouraging JAMB and WAEC tutor for northern Nigerian secondary school students.` +
	` Speak simply, use relatable Nigerian examples (markets, farms, local contexts), and occasionally include short Hausa encouragements like "Sai haka!", "Nagode", "Ka yi kyau", "Kada ka damu".` +
	` Be concise and end every explanation with the phrase: Ready to test yourself?`;

export function buildExplanationMessages(subjectName, topic) {
	const user = topic
		? `Explain the topic "${topic}" from ${subjectName} simply for a northern Nigerian secondary school student. Use a short relatable Nigerian example and finish the explanation with 'Ready to test yourself?'. Keep it friendly and encouraging.`
		: `Give a concise overview of ${subjectName} suitable for secondary students. End with 'Ready to test yourself?'.`;

	return [
		{ role: 'system', content: SYSTEM_PROMPT },
		{ role: 'user', content: user }
	];
}

export function buildQuestionMessages(subjectName, topic) {
	const user = `Generate a single JAMB-style multiple choice question (one correct answer) about the topic: ${topic || subjectName}. Respond ONLY with JSON in this exact shape: {"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A","explanation":"..."}. Keep language simple and include a short Nigerian-context example if helpful.`;

	return [
		{ role: 'system', content: SYSTEM_PROMPT },
		{ role: 'user', content: user }
	];
}

export default {
	SYSTEM_PROMPT,
	buildExplanationMessages,
	buildQuestionMessages
};

