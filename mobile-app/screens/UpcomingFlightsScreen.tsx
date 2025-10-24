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
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { getAuth } from 'firebase/auth';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

// Supabase
const SUPABASE_URL = Constants.expoConfig?.extra?.SUPABASE_URL!;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const auth = getAuth();

type Props = NativeStackScreenProps<RootStackParamList, 'UpcomingFlightsScreen'>;

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
  package?: any;       // package_info
  localPackage?: any;  // local_package_info
};

export default function UpcomingFlightsScreen({ navigation }: Props) {
  const [schedules, setSchedules] = useState<ScheduleInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  useEffect(() => {
const fetchSchedules = async () => {
  try {
    setLoading(true);
    const user = auth.currentUser;
    if (!user?.email) {
      Alert.alert('Error', 'You must be logged in to view upcoming travels.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('schedule_info')
      .select(`
        *,
        booking_info!inner (
          email,
          status,
          full_name,
          passengers
        )
      `)
      .eq('booking_info.email', user.email.toLowerCase())
      .order('travel_date', { ascending: true });

    if (error) throw error;

    const validBookings = (data || []).filter(item =>
      ['fullypaid', 'paid', 'confirmed'].includes(item.booking_info?.status?.toLowerCase())
    );

    // fetch packages
    const refIds = validBookings.map(f => f.reference_id).filter(Boolean);
    const localRefIds = validBookings.map(f => f.local_reference_id).filter(Boolean);

    const { data: packages } = await supabase
      .from('package_info')
      .select('id,name,itinerary')
      .in('id', refIds);

    const { data: localPackages } = await supabase
      .from('local_package_info')
      .select('id,name,itinerary')
      .in('id', localRefIds);

    const schedulesWithPackages = validBookings.map(item => ({
      ...item,
      package: packages?.find(p => p.id === item.reference_id),
      localPackage: localPackages?.find(p => p.id === item.local_reference_id),
    }));

    setSchedules(schedulesWithPackages);
  } catch (err) {
    console.error('Fetch Error:', err);
    Alert.alert('Error', 'Failed to load upcoming travels.');
  } finally {
    setLoading(false);
  }
};


    fetchSchedules();
  }, []);

  const renderItem = ({ item }: { item: ScheduleInfo }) => {
    const booking = item.booking_info;

    // Collect all locations
    const allLocations: { name: string; coords: { lat: number; lon: number } }[] = [];
    [item.package, item.localPackage].forEach((pkg: any) => {
      if (!pkg?.itinerary) return;
      const itinerary = typeof pkg.itinerary === 'string' ? JSON.parse(pkg.itinerary) : pkg.itinerary;
      itinerary.forEach((day: any) => {
        if (day.locations) allLocations.push(...day.locations);
      });
    });

    return (
      <>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            setSelectedPackage(item.package || item.localPackage);
            setModalVisible(true);
          }}
        >
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
        </TouchableOpacity>

{/* Itinerary Modal */}
<Modal
  visible={modalVisible && (selectedPackage?.id === item.package?.id || selectedPackage?.id === item.localPackage?.id)}
  animationType="slide"
  transparent
>
  <View style={styles.modalBackdrop}>
    <View style={styles.modalSheet}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{selectedPackage?.name}</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {selectedPackage?.itinerary &&
          (typeof selectedPackage.itinerary === 'string'
            ? JSON.parse(selectedPackage.itinerary)
            : selectedPackage.itinerary
          ).map((day: any) => (
            <View key={day.day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Ionicons name="sunny-outline" size={18} color="#fff" />
                <Text style={styles.dayTitle}>Day {day.day}</Text>
              </View>

              {day.activities.map((act: string, idx: number) => (
                <View key={`act-${idx}`} style={styles.activityCard}>
                  <Ionicons name="walk-outline" size={18} color="#228B73" style={{ marginRight: 6 }} />
                  <Text style={styles.activityText}>{act}</Text>
                </View>
              ))}

              {/* Locations */}
              {day.locations && day.locations.length > 0 && (
                <View style={styles.locationList}>
                  {day.locations.map((loc: any, locIdx: number) => (
                    <TouchableOpacity
                      key={`loc-${locIdx}`}
                      style={styles.locationButton}
                      onPress={() => setSelectedLocation(loc)}
                    >
                      <Ionicons name="location-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.locationName}>{loc.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
      </ScrollView>
    </View>
  </View>
</Modal>

        {/* Map Modal */}
        <Modal visible={!!selectedLocation} animationType="slide">
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={{ padding: 16 }} onPress={() => setSelectedLocation(null)}>
              <Ionicons name="close" size={28} color="#228B73" />
            </TouchableOpacity>
            {selectedLocation && (
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: selectedLocation.coords.lat,
                  longitude: selectedLocation.coords.lon,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation
              >
                <Marker
                  coordinate={{
                    latitude: selectedLocation.coords.lat,
                    longitude: selectedLocation.coords.lon,
                  }}
                  title={selectedLocation.name}
                />
              </MapView>
            )}
          </View>
        </Modal>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#228B73" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upcoming Travels</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#228B73" style={{ marginTop: 30 }} />
        ) : schedules.length === 0 ? (
          <Text style={styles.noFlightsText}>No upcoming travels yet.</Text>
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
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 10 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  noFlightsText: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 40 },
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

  modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'flex-end',
},
modalSheet: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  maxHeight: '85%',
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: -3 },
  shadowRadius: 6,
  elevation: 10,
},
modalHeader: {
  backgroundColor: '#228B73',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  paddingHorizontal: 18,
  paddingVertical: 14,
},
modalTitle: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 18,
},
closeBtn: {
  backgroundColor: 'rgba(255,255,255,0.2)',
  borderRadius: 20,
  padding: 6,
},
dayCard: {
  backgroundColor: '#f9f9f9',
  borderRadius: 12,
  marginBottom: 16,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#eaeaea',
},
dayHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#228B73',
  paddingVertical: 8,
  paddingHorizontal: 12,
},
dayTitle: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 15,
  marginLeft: 6,
},
activityCard: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
activityText: {
  flex: 1,
  fontSize: 14,
  color: '#333',
},
pinButton: {
  backgroundColor: '#228B73',
  padding: 6,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
locationList: {
  backgroundColor: '#eef8f5',
  borderTopWidth: 1,
  borderTopColor: '#e0e0e0',
  paddingVertical: 8,
  paddingHorizontal: 12,
},
locationButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#228B73',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  marginVertical: 5,
},
locationName: {
  color: '#fff',
  fontSize: 14,
  flexShrink: 1,
},


});
