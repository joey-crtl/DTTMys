import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { getAuth } from 'firebase/auth';

// Supabase
const SUPABASE_URL = Constants.expoConfig?.extra?.SUPABASE_URL!;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const auth = getAuth();

type Props = NativeStackScreenProps<RootStackParamList, 'PastBookingsScreen'>;

type ScheduleInfo = {
  id: string;
  booking_id: string;
  reference_id: string | null;
  local_reference_id: string | null;
  travel_date: string;
  booking_info?: {
    email: string;
    status: string;
    full_name?: string;
    passengers?: number;
  };
};

export default function PastBookingsScreen({ navigation }: Props) {
  const [schedules, setSchedules] = useState<ScheduleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastSchedules = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;

        if (!user?.email) {
          Alert.alert('Error', 'You must be logged in to view past bookings.');
          setLoading(false);
          return;
        }

        const now = new Date().toISOString();

        const { data, error } = await supabase
          .from('schedule_info')
          .select(`
            id,
            booking_id,
            reference_id,
            local_reference_id,
            travel_date,
            booking_info!inner (
              email,
              status,
              full_name,
              passengers
            )
          `)
          .lt('travel_date', now) // only past dates
          .order('travel_date', { ascending: false });

        if (error) throw error;

        const filtered: ScheduleInfo[] = (data as any[])
          .map(item => ({
            ...item,
            booking_info: Array.isArray(item.booking_info) && item.booking_info.length > 0
              ? item.booking_info[0]
              : undefined,
          }))
          .filter(item =>
            item.booking_info?.email?.trim().toLowerCase() === user.email?.trim().toLowerCase()
          );

        setSchedules(filtered);
      } catch (err) {
        console.error('Fetch Past Error:', err);
        Alert.alert('Error', 'Failed to load past bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastSchedules();
  }, []);

  const renderItem = ({ item }: { item: ScheduleInfo }) => {
    const booking = item.booking_info;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="airplane-outline" size={22} color="#228B73" />
          <Text style={styles.date}>
            {new Date(item.travel_date).toLocaleDateString()} @ {new Date(item.travel_date).toLocaleTimeString()}
          </Text>
        </View>

        {booking && (
          <View style={styles.cardBody}>
            <Text style={styles.boldText}>{booking.full_name || 'Passenger'}</Text>
            <Text style={styles.label}>Email: <Text style={styles.value}>{booking.email}</Text></Text>
            <Text style={styles.label}>Passengers: <Text style={styles.value}>{booking.passengers ?? 'N/A'}</Text></Text>
            <Text style={[styles.statusBadge, booking.status === 'FullyPaid' ? styles.statusPaid : styles.statusPending]}>
              {booking.status}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>Booking ID: {item.booking_id}</Text>
          <Text style={styles.footerText}>Ref Package: {item.reference_id || 'N/A'}</Text>
          <Text style={styles.footerText}>Local Package: {item.local_reference_id || 'N/A'}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#228B73" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Bookings</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#228B73" style={{ marginTop: 30 }} />
        ) : schedules.length === 0 ? (
          <>
            <Image
              source={require('../assets/worldmap.png')}
              style={styles.mapImage}
              resizeMode="contain"
            />
            <Text style={styles.noFlightsText}>No past bookings yet.</Text>
          </>
        ) : (
          <FlatList
            data={schedules}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    backgroundColor: '#228B73',
    paddingTop: Platform.OS === 'ios' ? 50 : 36,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: { position: 'absolute', left: 20, top: Platform.OS === 'ios' ? 50 : 30, padding: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  noFlightsText: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 20 },
  mapImage: { width: 250, height: 180, alignSelf: 'center', marginBottom: 20 },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  date: { fontWeight: '700', fontSize: 16, marginLeft: 8 },
  cardBody: { marginBottom: 10 },
  boldText: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  label: { fontSize: 14, color: '#555', marginBottom: 2 },
  value: { fontWeight: '500', color: '#111' },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statusPaid: { backgroundColor: '#28a745' },
  statusPending: { backgroundColor: '#ff9800' },
  cardFooter: { borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 6 },
  footerText: { fontSize: 12, color: '#777', marginBottom: 2 },
});
