// screens/ThankYouScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ThankYouScreen() {
  return (
    <View style={styles.container}>
      {/* Small bed icon in top right */}
      <View style={styles.topRightIcon}>
        <MaterialCommunityIcons name="bed" size={28} color="#aaa" />
      </View>

      {/* Big green check */}
      <FontAwesome name="check-circle" size={100} color="#4CAF50" style={styles.checkIcon} />

      {/* Message */}
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>Your trip has been successfully booked.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  topRightIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  checkIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
