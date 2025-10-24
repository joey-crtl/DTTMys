// LoginScreen.tsx

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
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { RootStackParamList } from '../App';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ----------------------------
  // Google Auth setup
  // ----------------------------
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: 'https://auth.expo.io/@mrjoey0125/mobile-app', // ✅ Web client redirect URI
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
          Alert.alert('Google Login Failed', err.message);
        })
        .finally(() => setGoogleLoading(false));
    }
  }, [response]);

  // ----------------------------
  // Email & Password login
  // ----------------------------
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(userCredential.user);
      navigation.replace('Home', { user: userCredential.user.email! });
    } catch (err: any) {
      console.error(err);
      Alert.alert('Login Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Persistent login
  // ----------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        navigation.replace('Home', { user: user.email! });
      }
    });
    return unsubscribe;
  }, []);

  // ----------------------------
  // Save user to Firestore
  // ----------------------------
  const saveUserToFirestore = async (user: User) => {
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          name: user.displayName || '',
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

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

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

          <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Reset password flow coming soon')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, loading && { opacity: 0.7 }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInButtonText}>Sign In</Text>}
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
            <Text style={styles.googleText}>{googleLoading ? 'Signing in...' : 'Sign in with Google'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpText}>
              Don’t have an account? <Text style={{ fontWeight: '600', color: '#228B73' }}>Sign Up</Text>
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
  forgotPassword: { color: '#007bff', alignSelf: 'flex-end', marginBottom: 20 },
  signInButton: { backgroundColor: '#228B73', paddingVertical: 14, borderRadius: 10, width: '100%', marginBottom: 20 },
  signInButtonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  orText: { color: '#666', fontSize: 14, marginBottom: 15 },
  googleButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DB4437', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginBottom: 25 },
  googleText: { color: '#fff', fontWeight: '500', fontSize: 16 },
  signUpText: { fontSize: 15, color: '#444', marginTop: 5 },
});

export default LoginScreen;
