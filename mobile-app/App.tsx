// App.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './supabaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// ----- Screen Imports -----
import SplashScreen from './screens/SplashScreens';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import SearchResultsScreen from './screens/SearchResultScreen';
import ViewMoreScreen from './screens/ViewMoreScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import PackageDetailsScreen from './screens/PackageDetailsScreen';
import TravellerInfoScreen from './screens/TravellerInfoScreen';
import PastBookingsScreen from './screens/PastBookingsScreen';
import UpcomingFlightsScreen from './screens/UpcomingFlightsScreen';
import FaqsScreen from './screens/FaqsScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import AboutScreen from './screens/AboutScreen';
import AirlinePackageScreen from './screens/AirlinePackageScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import BookingScreen from './screens/BookingScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';

// ----- Types -----
export type PackageType = {
  id: string;
  image: any;
  airline: string;
  destination: string;
  location: string;
  price: number;
  itinerary?: { day: number; activities: string[] }[];
  description?: string;
  gallery?: any[];
  duration?: string;
  stops?: string[];
  inclusions?: string[];
  exclusions?: string[];
  departure?: string;
  arrival?: string;
  available?: number;
  isLocal?: boolean; // NEW consistent flag
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: { user: string };
  SearchResults: { origin: string; destination: string; user: string } | undefined;
  ViewMore: { searchTerm?: string };
  FavoritesScreen: undefined;
  ProfileScreen: { user: string } | undefined;
  PackageDetails: { selectedPackage: PackageType };
  TravellerInfo: { selectedPackage: PackageType; totalCost?: number };
  PastBookingsScreen: undefined;
  UpcomingFlightsScreen: { user: string };
  FaqsScreen: undefined;
  FeedbackScreen: undefined;
  AboutScreen: undefined;
  AirlinePackageScreen: undefined;
  Booking: { flightId: string; user: string };
  Confirmation: { bookingId: string; user: string };
  ChangePasswordScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ----- Favorites Context -----
type FavoritesContextType = {
  favorites: PackageType[];
  addFavorite: (pkg: PackageType) => void;
  removeFavorite: (id: string, isLocal?: boolean) => void;
  isFavorite: (id: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = (): FavoritesContextType => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};



const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<PackageType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
          fetchFavorites(user.uid);
        } else {
          setUserId(null);
          // Keep only local favorites
          setFavorites((prev) => prev.filter(p => p.isLocal));
        }
      });
      return unsubscribe;
    }, []);


  // ---- Fetch favorites from both tables ----
  const fetchFavorites = async (uid: string) => {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        package_info:package_id(*),
        local_package_info:local_package_id(*)
      `)
      .eq('user_id', uid);

    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    const mapped = data
      .map((d: any) => {
        // Determine if this is a local package
        const isLocal = !!d.local_package_info;
        const pkg = isLocal ? d.local_package_info : d.package_info;
        if (!pkg) return null;

        return {
          id: pkg.id,
          image: pkg.main_photo || '',
          name: pkg.name || 'Unknown Package',   // always use 'name' for display
          airline: isLocal ? undefined : pkg.name || 'Unknown Airline', // optional
          destination: pkg.destination || 'Unknown Destination',
          location: pkg.location || '',
          price: pkg.price || 0,
          description: pkg.description || '',
          isLocal: isLocal,
        };
      })
      .filter(Boolean);

    console.log('✅ Favorites fetched:', mapped);
    setFavorites(mapped.filter(Boolean) as PackageType[]);

  };

  // ---- Add favorite ----
  const addFavorite = async (pkg: PackageType) => {
    if (!userId) return;

    const insertData = {
      user_id: userId,
      package_id: pkg.isLocal ? null : pkg.id,
      local_package_id: pkg.isLocal ? pkg.id : null,
    };

    const { error } = await supabase.from('user_favorites').insert(insertData);
    if (error) {
      console.error('Error adding favorite:', error.message);
      return;
    }

    setFavorites((prev) => [...prev, pkg]);
  };

  // ---- Remove favorite ----
  const removeFavorite = async (pkgId: string, isLocal?: boolean) => {
    if (!userId) return;

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq(isLocal ? 'local_package_id' : 'package_id', pkgId);

    if (error) {
      console.error('Error removing favorite:', error);
      return;
    }

    setFavorites((prev) =>
      prev.filter((p) => !(p.id === pkgId && p.isLocal === isLocal))
    );
  };

  const isFavorite = (id: string) =>
    favorites.some((p) => p.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// ----- App Component -----
export default function App() {

useEffect(() => {
  const triggerGeocode = async () => {
    try {
      const res = await fetch(
        'https://sdayzkpfodzqbpugprwq.functions.supabase.co/geocode-itineraries',
        {
          method: 'POST', // or GET depending on your function
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
            'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      const text = await res.text();
      console.log('Geocode response:', text);
    } catch (err) {
      console.error('Error triggering geocode:', err);
    }
  };

  triggerGeocode();
}, []);



  return (
    <FavoritesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="SearchResults"
            component={SearchResultsScreen}
            initialParams={{ origin: 'string', destination: 'string', user: 'Guest' }}
          />
          <Stack.Screen name="PackageDetails" component={PackageDetailsScreen} />
          <Stack.Screen name="ViewMore" component={ViewMoreScreen} />
          <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="TravellerInfo" component={TravellerInfoScreen} />
          <Stack.Screen name="PastBookingsScreen" component={PastBookingsScreen} />
          <Stack.Screen name="UpcomingFlightsScreen" component={UpcomingFlightsScreen} />
          <Stack.Screen name="FaqsScreen" component={FaqsScreen} />
          <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
          <Stack.Screen name="AboutScreen" component={AboutScreen} />
          <Stack.Screen name="AirlinePackageScreen" component={AirlinePackageScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
          <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}
