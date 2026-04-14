import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ModalScreen() {
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  
  const timerOptions = [15, 30, 45, 60];

  const setTimer = (mins: number) => {
    setActiveTimer(mins);
    // Logic to start native background countdown
    setTimeout(() => {
      router.back();
    }, 500);
  };

  const cancelTimer = () => {
    setActiveTimer(null);
    // Logic to clear native background countdown
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="nights-stay" size={60} color="#1DB954" style={styles.icon} />
      <Text style={styles.title}>Sleep Timer</Text>
      <Text style={styles.subtitle}>Stop audio playing after a set amount of time.</Text>

      <View style={styles.optionsContainer}>
        {timerOptions.map((mins) => (
          <TouchableOpacity
            key={mins}
            style={[styles.optionButton, activeTimer === mins && styles.optionButtonActive]}
            onPress={() => setTimer(mins)}
          >
            <Text style={[styles.optionText, activeTimer === mins && styles.optionTextActive]}>
              {mins} minutes
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity style={styles.cancelButton} onPress={cancelTimer}>
        <Text style={styles.cancelText}>Turn off timer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
    gap: 15,
  },
  optionButton: {
    backgroundColor: '#222',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  optionButtonActive: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    borderColor: '#1DB954',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#1DB954',
  },
  cancelButton: {
    marginBottom: 40,
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
