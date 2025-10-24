// screens/FavoritesScreen.tsx

import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, useFavorites } from '../App';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth'; // ✅ Added

type Props = NativeStackScreenProps<RootStackParamList, 'FavoritesScreen'>;

const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const { favorites, removeFavorite } = useFavorites();
  const [selectedTab, setSelectedTab] = useState<
    "home" | "flights" | "favorites" | "profile"
  >("favorites");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ Added

  const auth = getAuth();

  useEffect(() => {
    // ✅ Watch Firebase Auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const confirmRemove = (id: string, isLocal?: boolean) => {
    Alert.alert('Remove favorite', 'Remove this package from favorites?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFavorite(id, isLocal),
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image
        source={
          typeof item.image === 'string'
            ? { uri: item.image }
            : item.image
        }
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.airline}>{item.isLocal ? item.name || 'Unknown Package' : item.airline || 'Unknown Airline'}</Text>
        <Text style={styles.destination}>{item.destination || 'Unknown Destination'}</Text>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => confirmRemove(item.id, item.isLocal)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <FontAwesome name="trash" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Black Curved Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {/* Content */}
      <View style={styles.container}>
        {!isLoggedIn ? (
          // ✅ Show message when logged out
          <View style={styles.emptyBox}>
            <FontAwesome name="user-o" size={48} color="#999" />
            <Text style={styles.emptyTitle}>You’re not logged in</Text>
            <Text style={styles.emptyText}>
              Log in to view your favorite packages.
            </Text>
            <TouchableOpacity
              style={styles.backToSearch}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backToSearchText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyBox}>
            <FontAwesome name="heart-o" size={48} color="#999" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart on a package to save it here.
            </Text>
            <TouchableOpacity
              style={styles.backToSearch}
              onPress={() =>
                navigation.navigate('SearchResults', {
                  origin: '',
                  destination: '',
                  user: 'Guest',
                })
              }
            >
              <Text style={styles.backToSearchText}>Browse packages</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab('home');
            navigation.navigate('SearchResults', {
              origin: '',
              destination: '',
              user: 'Guest',
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
            setSelectedTab("flights");
            navigation.navigate("AirlinePackageScreen");
          }}
        >
          <Ionicons
            name="airplane-outline"
            size={28}
            color={selectedTab === "flights" ? "#228B73" : "#999"}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelectedTab('favorites')}>
          <FontAwesome
            name={selectedTab === 'favorites' ? 'heart' : 'heart-o'}
            size={26}
            color={selectedTab === 'favorites' ? '#228B73' : '#999'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedTab('profile');
            navigation.navigate('ProfileScreen', { user: 'Guest' });
          }}
        >
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: "#228B73",
    paddingTop: 55,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '500', marginTop: -5 },
  container: { flex: 1, padding: 16, paddingBottom: 100 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 12, color: '#333' },
  emptyText: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  backToSearch: {
    marginTop: 16,
    backgroundColor: '#228B73',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  backToSearchText: { color: '#fff', fontWeight: '600' },
  listContent: { paddingBottom: 30 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: { width: 100, height: 90, backgroundColor: '#ddd' },
  cardContent: { flex: 1, padding: 12 },
  airline: { fontSize: 16, fontWeight: '600' },
  destination: { fontSize: 14, color: '#666', marginTop: 4 },
  removeButton: {
    backgroundColor: '#ff595e',
    padding: 10,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: 4,
  },
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

export default FavoritesScreen;
