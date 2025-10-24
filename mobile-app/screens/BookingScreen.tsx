import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { flightId, user } = route.params; // ✅ fix here
  const [name, setName] = useState('');

  const handleBook = () => {
    const bookingId = 'BKG-' + Math.floor(Math.random() * 10000);
    navigation.navigate('Confirmation', { bookingId, user }); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking for Flight {flightId}</Text>
      <TextInput
        placeholder="Your Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <Button
        title="Confirm Booking"
        onPress={handleBook}
        disabled={!name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default BookingScreen;

