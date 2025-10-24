// ViewMoreScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, PackageType, useFavorites } from '../App';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'ViewMore'>;

const morePackages: PackageType[] = [
  {
    id: '1',
    image: require('../assets/bali.png'),
    airline: 'Philippine Airlines',
    destination: 'Bali, Indonesia',
    price: 19500,
    itinerary: 'Day 1: Arrival\nDay 2: Beach\nDay 3: Temple visit',
    location: 'Indonesia',
  },
  {
    id: '2',
    image: require('../assets/hongkong.png'),
    airline: 'Philippine Airlines',
    destination: 'Hong Kong',
    price: 23400,
    itinerary: 'Day 1: Arrival\nDay 2: Disneyland\nDay 3: Victoria Peak',
    location: 'Hong Kong',
  },
  {
    id: '3',
    image: require('../assets/singapore.png'),
    airline: 'Philippine Airlines',
    destination: 'Singapore',
    price: 21800,
    itinerary: 'Day 1: Gardens by the Bay\nDay 2: Sentosa\nDay 3: Shopping',
    location: 'Singapore',
  },
  {
    id: '4',
    image: require('../assets/vietnam.png'),
    airline: 'Philippine Airlines',
    destination: 'Vietnam',
    price: 23400,
    itinerary: 'Day 1: Arrival\nDay 2: City Tour\nDay 3: Market Visit',
    location: 'Vietnam',
  },
  {
    id: '5',
    image: require('../assets/bangkok.png'),
    airline: 'Philippine Airlines',
    destination: 'Bangkok, Thailand',
    price: 21800,
    itinerary: 'Day 1: Temples\nDay 2: Floating Market\nDay 3: Shopping',
    location: 'Thailand',
  },
];



const ViewMoreScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<'home' | 'favorites' | 'profile'>('home');
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const toggleFavorite = (item: PackageType) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  const goToDetails = (item: PackageType) => {
    navigation.navigate('PackageDetails', { selectedPackage: item });
  };

  const user = 'Guest';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="black" barStyle="light-content" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Available Packages</Text>
        </View>

        {/* List */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {morePackages.map((item) => {
            const favorited = isFavorite(item.id);
            return (
              <View key={item.id} style={styles.card}>
                <View>
                  <Image source={item.image} style={styles.image} />
                  {/* Heart button */}
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => toggleFavorite(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <FontAwesome
                      name={favorited ? 'heart' : 'heart-o'}
                      size={20}
                      color={favorited ? '#ff595e' : '#fff'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.airline}>{item.airline}</Text>
                  <Text style={styles.destination}>{item.destination}</Text>

                  {/* Price + See More button */}
                 <View style={styles.priceRow}>
                                 <Text style={styles.price}>₱{item.price.toLocaleString()}</Text>
                                   <TouchableOpacity
                                       style={styles.seeMoreButton}
                                       onPress={() => goToDetails(item)}
                                    >
                                         <Text style={styles.seeMoreText}>See More</Text>
                                 </TouchableOpacity>
                              </View>

                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => {
              setSelectedTab('home');
              navigation.navigate('SearchResults', {
                origin: '',
                destination: '',
                user,
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

          <TouchableOpacity
            onPress={() => {
              setSelectedTab('profile');
              navigation.navigate('ProfileScreen', { user });
            }}
          >
            <Ionicons
              name="person-outline"
              size={28}
              color={selectedTab === 'profile' ? '#228B73' : '#999'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
     backgroundColor: "#228B73",
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    marginLeft: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 25,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 160,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 6,
    borderRadius: 20,
  },
  cardContent: {
    padding: 10,
  },
  airline: {
    fontSize: 16,
    fontWeight: '500',
  },
  destination: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  price: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  seeMoreButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#228B73',
  },
  seeMoreText: {
    color: '#228B73',
    fontWeight: '500',
    fontSize: 12,
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

export default ViewMoreScreen;
