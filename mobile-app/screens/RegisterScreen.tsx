// RegisterScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  User,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { RootStackParamList } from '../App';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const redirectUri = makeRedirectUri({
  // @ts-ignore
  useProxy: true,
});

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ----------------------------
  // Google Auth setup
  // ----------------------------
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri,
  });

  // ----------------------------
  // Handle Google response
  // ----------------------------
  useEffect(() => {
    if (response?.type === 'success') {
      setGoogleLoading(true);
      const { id_token } = response.params;
      if (!id_token) {
        setGoogleLoading(false);
        return;
      }

      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          await saveUserToFirestore(userCredential.user);
          navigation.replace('Home', { user: userCredential.user.email! });
        })
        .catch((err) => {
          console.error(err);
          Alert.alert('Google Registration Failed', err.message);
        })
        .finally(() => setGoogleLoading(false));
    }
  }, [response]);

  // ----------------------------
  // Email & Password registration
  // ----------------------------
  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firestore with name
      await saveUserToFirestore({ ...user, displayName: name });

      navigation.replace('Home', { user: user.email! });
    } catch (err: any) {
      console.error(err);
      Alert.alert('Registration Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Save user to Firestore
  // ----------------------------
  const saveUserToFirestore = async (user: User) => {
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: user.displayName || '',
          email: user.email,
          lastLogin: new Date(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Error saving user to Firestore:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Image source={require('../assets/logoo.png')} style={styles.logo} />

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start your journey</Text>

          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.signUpButton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orText}>or continue with</Text>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => promptAsync()}
            disabled={!request || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
            ) : (
              <FontAwesome name="google" size={20} color="white" style={{ marginRight: 10 }} />
            )}
            <Text style={styles.googleText}>{googleLoading ? 'Signing up...' : 'Sign up with Google'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={{ fontWeight: '600', color: '#228B73' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' },
  container: { padding: 24, alignItems: 'center' },
  logo: { width: 140, height: 160, resizeMode: 'contain', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#222', marginBottom: 5 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 25 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  signUpButton: { backgroundColor: '#228B73', paddingVertical: 14, borderRadius: 10, width: '100%', marginBottom: 20 },
  signUpButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  orText: { color: '#666', fontSize: 14, marginBottom: 15 },
  googleButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DB4437', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginBottom: 25 },
  googleText: { color: '#fff', fontWeight: '500', fontSize: 16 },
  signInText: { fontSize: 15, color: '#444', marginTop: 5 },
});

export default RegisterScreen;
