import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const HomeScreen = ({ route, navigation }: any) => {
  const { user = 'Guest' } = route?.params || {};
  const [agree, setAgree] = useState<boolean | null>(null);

  const handleBook = () => {
    if (agree) {
      navigation.navigate('SearchResults', {
        origin: 'Manila',
        destination: 'Cebu',
        user,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#228B73" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Welcome to{'\n'}Doctor Travel & Tours
          </Text>
        </View>

        <Image
          source={require('../assets/pic.png')}
          style={styles.doctorImage}
          resizeMode="contain"
        />

        <View style={styles.termsBox}>
          <Text style={styles.termsText}>
            By booking a flight with Doctor Travel and Tours, you agree to our terms and conditions. All destinations are carefully vetted for your safety.
          </Text>

          <View style={styles.circleGroup}>
            <TouchableOpacity style={styles.circleOption} onPress={() => setAgree(true)}>
              <View style={[styles.circle, agree === true && styles.circleActive]}>
                {agree === true && <View style={styles.circleFilled} />}
              </View>
              <Text style={styles.circleLabel}>I agree to the terms and conditions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.circleOption} onPress={() => setAgree(false)}>
              <View style={[styles.circle, agree === false && styles.circleActiveRed]}>
                {agree === false && <View style={styles.circleFilledRed} />}
              </View>
              <Text style={styles.circleLabel}>I do not agree</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { opacity: agree ? 1 : 0.5 }]}
          disabled={!agree}
          onPress={handleBook}
        >
          <Text style={styles.buttonText}>Book Now!</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flexGrow: 1, alignItems: 'center', paddingBottom: 40 },
  header: {
    backgroundColor: '#228B73',
    width: '100%',
    paddingVertical: 50,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  headerText: { color: 'white', fontSize: 24, textAlign: 'center', fontWeight: '700' },
  doctorImage: { width: 220, height: 250, marginTop: -50, marginBottom: 10, zIndex: 1 },
  termsBox: {
    borderWidth: 0,
    padding: 20,
    marginTop: 10,
    width: '90%',
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  termsText: { fontSize: 15, color: '#555', textAlign: 'left', marginBottom: 15, lineHeight: 20 },
  circleGroup: { marginTop: 5, width: '100%' },
  circleOption: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  circleActive: { borderColor: '#228B73' },
  circleActiveRed: { borderColor: '#e74c3c' },
  circleFilled: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#228B73' },
  circleFilledRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#e74c3c' },
  circleLabel: { fontSize: 14, color: '#333', flexShrink: 1 },
  button: {
    backgroundColor: '#228B73',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 12,
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});

export default HomeScreen;
