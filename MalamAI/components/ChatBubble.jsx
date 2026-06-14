import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChatBubble({ message, isUser, onSaveNote }) {
  return (
    <View style={[styles.container, isUser ? styles.userRow : styles.aiRow]}>
      {!isUser && (
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>M</Text>
          </View>
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{message}</Text>
        {!isUser && onSaveNote ? (
          <TouchableOpacity style={styles.saveButton} onPress={onSaveNote} activeOpacity={0.7}>
            <Text style={styles.saveText}>📋 Save as note</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  avatarWrapper: {
    marginRight: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e9f3e9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c5d8c4',
  },
  avatarText: {
    color: '#0a7c4f',
    fontWeight: '900',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    padding: 14,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0e8dc',
  },
  userBubble: {
    backgroundColor: '#0a7c4f',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiText: {
    color: '#24352d',
  },
  userText: {
    color: '#ffffff',
  },
  saveButton: {
    marginTop: 12,
  },
  saveText: {
    color: '#0a7c4f',
    fontWeight: '700',
  },
});
