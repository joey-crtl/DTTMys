import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Replace this Image source with your actual logo */}
      <Image source={require('../assets/logoo.png')} style={styles.logo} />
      <Text style={styles.text}>Doctor Travel & Tour</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee', // nice blue background
  },
  logo: {
    width: 170,
    height: 170,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default SplashScreen;