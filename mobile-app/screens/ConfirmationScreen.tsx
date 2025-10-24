import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

const ConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, user } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Check image */}
      <Image
        source={require('../assets/check.png')}
        style={styles.checkImage}
      />

      {/* Success message */}
      <Text style={styles.message}>
        Congratulations, your Package purchase was successfully completed.{"\n"}
        A receipt will be sent to your email.
      </Text>

      {/* Back to Home button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('SearchResults', {
            origin: '',
            destination: '',
            user,
          })
        }
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  checkImage: {
    width: 120,
    height: 120,
    marginBottom: 25,
    resizeMode: 'contain',
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#228B73',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ConfirmationScreen;
