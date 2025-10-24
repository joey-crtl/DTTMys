import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { File } from 'expo-file-system';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { supabase } from '../supabaseClient';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileScreen'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [membership, setMembership] = useState<string>('');
  const [image, setImage] = useState<any>(require('../assets/nprofile.jpg'));
  const [selectedTab, setSelectedTab] = useState<'home' | 'flights' | 'favorites' | 'profile'>('profile');

  // ✅ Load Firebase Auth user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserInfo(firebaseUser.uid);
      } else {
        setUser(null);
        setMembership('');
        setImage(require('../assets/nprofile.jpg'));
      }
    });
    return unsubscribe;
  }, []);

  // ✅ Fetch user info from Supabase
  const fetchUserInfo = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_info')
        .select('membership_status, profile_photo')
        .eq('user_id', uid)
        .single();

      if (!error && data) {
        if (data.membership_status) setMembership(data.membership_status);
        if (data.profile_photo) setImage({ uri: data.profile_photo });
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
    }
  };

  // ✅ Pick profile image
  const pickImage = async () => {
    if (!user?.uid) {
      Alert.alert('Not logged in', 'You must be logged in to change your profile picture.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera roll permission is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        const ext = uri.split('.').pop();
        const fileName = `profile_${user.uid}.${ext}`;

        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, fileData, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('profile-images').getPublicUrl(fileName);
        const publicUrl = data.publicUrl;

        const { error: tableError } = await supabase
          .from('user_profiles')
          .upsert(
            {
              user_id: user.uid,
              profile_photo: publicUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

        if (tableError) throw tableError;

        setImage({ uri: publicUrl });
        Alert.alert('Success', 'Profile image updated!');
      } catch (err: any) {
        console.error('Upload error:', err);
        Alert.alert('Upload failed', err.message || 'An error occurred during upload.');
      }
    }
  };

  // ✅ Logout function
  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            const auth = getAuth();
            await firebaseSignOut(auth); // Firebase logout
            await supabase.auth.signOut(); // Supabase logout
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (err: any) {
            console.error('Logout error:', err.message);
            Alert.alert('Error', 'Failed to log out.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile */}
        <View style={styles.profileBox}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            <Image source={image} style={styles.avatar} />
            <View style={styles.editButton}>
              <Ionicons name="pencil" size={16} color="white" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user ? user.displayName || user.email : 'Guest'}</Text>
          <Text style={styles.membership}>{membership || 'Tap to set membership status'}</Text>
        </View>

        {/* Package Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Package</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate('PastBookingsScreen')}
            >
              <Ionicons name="cube-outline" size={20} color="#228B73" />
              <Text style={styles.cardText}>Purchased Packages</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 10 }]}>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() =>
                navigation.navigate('UpcomingFlightsScreen', {
                  user: user?.email || 'Guest',
                })
              }
            >
              <Ionicons name="albums-outline" size={20} color="#228B73" />
              <Text style={styles.cardText}>Upcoming Packages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Security</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate('ChangePasswordScreen')}
            >
              <Ionicons name="key-outline" size={20} color="#228B73" />
              <Text style={styles.cardText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Other Links */}
        <View style={styles.section}>
          <View style={[styles.card, { marginTop: -10 }]}>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate('FaqsScreen')}
            >
              <Ionicons name="help-circle-outline" size={20} color="#228B73" />
              <Text style={styles.cardText}>FAQ's</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 10 }]}>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate('FeedbackScreen')}
            >
              <Ionicons name="star-outline" size={20} color="#228B73" />
              <Text style={styles.cardText}>App Feedback</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 10 }]}>
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => navigation.navigate('AboutScreen')}
            >
              <Ionicons name="information-circle-outline" size={20} color="#228B73" />
              <Text style={styles.cardText}>About Us</Text>
            </TouchableOpacity>
          </View>

          {/* 🔴 Logout Button moved to bottom */}
          <View style={[styles.card, { marginTop: 20, backgroundColor: '#FCE8E6' }]}>
            <TouchableOpacity style={styles.cardRow} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#D14343" />
              <Text style={[styles.cardText, { color: '#D14343', fontWeight: '600' }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>


      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab('home');
            navigation.navigate('SearchResults', {
              origin: '',
              destination: '',
              user: user?.email || 'Guest',
            });
          }}
        >
          <Ionicons
            name="home-outline"
            size={28}
            color={selectedTab === 'home' ? '#228B73' : '#999'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedTab('flights');
            navigation.navigate('AirlinePackageScreen');
          }}
        >
          <Ionicons
            name="airplane-outline"
            size={28}
            color={selectedTab === 'flights' ? '#228B73' : '#999'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedTab('favorites');
            navigation.navigate('FavoritesScreen');
          }}
        >
          <FontAwesome
            name={selectedTab === 'favorites' ? 'heart' : 'heart-o'}
            size={26}
            color={selectedTab === 'favorites' ? '#228B73' : '#999'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelectedTab('profile')}>
          <Ionicons
            name="person-outline"
            size={28}
            color={selectedTab === 'profile' ? '#228B73' : '#999'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#228B73',
    paddingVertical: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '600' },
  scrollContent: { paddingBottom: 100 },
  profileBox: { alignItems: 'center', marginTop: 20, marginHorizontal: 20 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc' },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#228B73',
    padding: 4,
    borderRadius: 12,
  },
  name: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  membership: { fontSize: 14, color: '#888', marginTop: 4 },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  cardText: { marginLeft: 10, fontSize: 15, color: '#333' },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default ProfileScreen;
