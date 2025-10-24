import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'PackageDetails'>;

const toPHP = (val: unknown): number => {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
};
const peso = (n: number) => `₱${Number(n || 0).toLocaleString('en-PH')}`;

const PackageDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { selectedPackage } = route.params;
  const basePrice = toPHP(selectedPackage?.price);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeImage, setActiveImage] = useState<any>(null);
  const [packageData, setPackageData] = useState<any>(null);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [warningModalVisible, setWarningModalVisible] = useState(false);

  const openImage = (img: any) => {
    setActiveImage(img);
    setModalVisible(true);
  };
  const closeImage = () => {
    setModalVisible(false);
    setActiveImage(null);
  };

  // 🔹 Fetch data from Supabase (local_package_info or package_info)
  useEffect(() => {
    const fetchPackageDetails = async () => {
      const table = selectedPackage.isLocal ? 'local_package_info' : 'package_info';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', selectedPackage.id)
        .single();

      if (error) {
        console.error('Error fetching package details:', error);
        return;
      }
      setPackageData(data);
    };
    fetchPackageDetails();
  }, [selectedPackage]);

  const toggleDay = (day: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  if (!packageData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading package details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#228B73" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Image */}
        <TouchableOpacity onPress={() => openImage({ uri: packageData.main_photo })} activeOpacity={0.9}>
          <Image source={{ uri: packageData.main_photo }} style={styles.topImage} />
        </TouchableOpacity>

        {/* Title & Price */}
        <View style={styles.titleContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {packageData.destination || packageData.name || 'Unknown Package'}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText}>{packageData.location || 'Unknown'}</Text>
            </View>
            <Text style={styles.available}>Available Slots: {packageData.available ?? 0}</Text>
          </View>
          <Text style={styles.price}>{peso(basePrice)}</Text>
        </View>

        {/* Photo Gallery */}
        <Text style={styles.sectionHeader}>Photo Gallery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {(packageData.add_photo || []).map((img: string, index: number) => (
            <TouchableOpacity key={index} onPress={() => openImage({ uri: img })} activeOpacity={0.8}>
              <Image source={{ uri: img }} style={styles.galleryImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Itinerary */}
        {packageData.itinerary && Array.isArray(packageData.itinerary) && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Itinerary</Text>
            {packageData.itinerary.map((dayItem: any, index: number) => (
              <View key={index}>
                <TouchableOpacity
                  onPress={() => toggleDay(index)}
                  style={styles.itineraryHeader}
                  activeOpacity={0.7}
                >
                  <Text style={styles.itineraryTitle}>Day {dayItem.day}</Text>
                  <Ionicons
                    name={expandedDays.includes(index) ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#228B73"
                  />
                </TouchableOpacity>

                {expandedDays.includes(index) && (
                  <View style={styles.itineraryContent}>
                    {dayItem.activities?.map((act: string, actIndex: number) => (
                      <Text key={actIndex} style={styles.listItem}>
                        • {act}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Inclusions */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Inclusions</Text>
          {packageData.inclusions ? (
            packageData.inclusions.split('\n').map((item: string, index: number) => (
              <Text key={index} style={styles.listItem}>
                • {item.trim()}
              </Text>
            ))
          ) : (
            <Text style={styles.listItem}>No inclusions listed.</Text>
          )}
        </View>

        {/* Exclusions */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Exclusions</Text>
          {packageData.exclusions ? (
            packageData.exclusions.split('\n').map((item: string, index: number) => (
              <Text key={index} style={[styles.listItem, { color: '#D14343' }]}>
                • {item.trim()}
              </Text>
            ))
          ) : (
            <Text style={[styles.listItem, { color: '#D14343' }]}>No exclusions listed.</Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Book Now Button */}
      <TouchableOpacity
        style={styles.bookNowButton}
        activeOpacity={0.8}
        onPress={() => setWarningModalVisible(true)} // show warning modal first
      >
        <Text style={styles.bookNowText}>Book Now</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Full-Screen Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={closeImage}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={activeImage} style={styles.modalImage} resizeMode="contain" />
        </View>
      </Modal>

      <Modal visible={warningModalVisible} transparent animationType="fade">
        <View style={styles.warningModalBackground}>
          <View style={styles.warningModalContainer}>
            <Text style={styles.warningText}>
              ⚠️ Price may vary depending on the number of passengers.
            </Text>

            <View style={styles.warningButtons}>
              <TouchableOpacity
                style={[styles.warningButton, { backgroundColor: '#228B73' }]}
                onPress={() => {
                  setWarningModalVisible(false);
                  navigation.navigate('TravellerInfo', { selectedPackage, totalCost: basePrice });
                }}
              >
                <Text style={styles.warningButtonText}>Proceed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.warningButton, { backgroundColor: '#ccc' }]}
                onPress={() => setWarningModalVisible(false)}
              >
                <Text style={styles.warningButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  topImage: { width: '100%', height: 270, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E3A3A' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { marginLeft: 4, fontSize: 14, color: '#666' },
  available: { fontSize: 14, color: '#228B73', marginTop: 4 },
  price: { fontSize: 20, fontWeight: '700', color: '#228B73' },
  sectionHeader: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 10, paddingHorizontal: 20, color: '#228B73' },
  gallery: { paddingHorizontal: 20, marginBottom: 16 },
  galleryImage: { width: 140, height: 100, borderRadius: 12, marginRight: 12, elevation: 3 },
  card: {
    marginHorizontal: 20,
    backgroundColor: '#F2FAF7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#1E3A3A' },
  listItem: { fontSize: 14, color: '#228B22', marginBottom: 6 },
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itineraryTitle: { fontSize: 15, fontWeight: '600', color: '#228B73' },
  itineraryContent: { paddingVertical: 6, paddingLeft: 8 },
  bookNowButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#228B73',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
  },
  bookNowText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 8,
    borderRadius: 22,
  },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '95%', height: '80%' },
  modalClose: { position: 'absolute', top: 50, right: 20 },
  warningModalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
warningModalContainer: {
  width: '80%',
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  alignItems: 'center',
},
warningText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
warningButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
warningButton: {
  flex: 1,
  padding: 12,
  marginHorizontal: 5,
  borderRadius: 12,
  alignItems: 'center',
},
warningButtonText: { color: '#fff', fontWeight: 'bold' },

});

export default PackageDetailsScreen;
