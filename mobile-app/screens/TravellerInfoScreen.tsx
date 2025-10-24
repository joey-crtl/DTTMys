import React, { useState,useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, PackageType } from '../App';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { supabase } from '../supabaseClient';
import Constants from 'expo-constants';
import { getAuth } from 'firebase/auth';
const auth = getAuth();
const user = auth.currentUser;

type Props = NativeStackScreenProps<RootStackParamList, 'TravellerInfo'>;

type FormDataKeys =
  | 'lastName'
  | 'firstName'
  | 'middleName'
  | 'age'
  | 'dob'
  | 'birthPlace'
  | 'gender'
  | 'phone'
  | 'email'
  | 'passport'
  | 'documentType'
  | 'nationality'
  | 'adults'
  | 'children'
  | 'address';
  

const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

const TravellerInfoScreen: React.FC<Props> = ({ navigation, route }) => {
  const pkg: PackageType | undefined = route.params?.selectedPackage;

  const [showDetailsModal, setShowDetailsModal] = useState(true);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showPassportExpirationPicker, setShowPassportExpirationPicker] = useState(false);
  const [passportExpiration, setPassportExpiration] = useState('');

  const [formData, setFormData] = useState<Record<FormDataKeys, string>>({
    lastName: '',
    firstName: '',
    middleName: '',
    age: '',
    dob: '',
    birthPlace: '',
    gender: '',
    phone: '',
    email: user?.email || '',
    passport: '',
    documentType: '',
    nationality: '',
    adults: '',
    children: '',
    address: '',
  });

  useEffect(() => {
    const currentUser = auth.currentUser;
    setFormData((prev) => ({
      ...prev,
      email: currentUser?.email || '', // empty string if null/undefined
    }));
  }, []);

  const handleChange = (key: FormDataKeys, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === 'documentType' && value !== 'Passport') setPassportExpiration('');
  };

  const handleSubmit = async () => {
    if (!pkg) {
      Alert.alert('Error', 'Package not found.');
      return;
    }

    // Safe parse numbers
    const adults = parseInt(formData.adults) || 0;
    const children = parseInt(formData.children) || 0;
    const age = parseInt(formData.age) || 0;
    const totalPassengers = adults + children;

    if (totalPassengers < 1) {
      Alert.alert('Error', 'Add at least one passenger.');
      return;
    }

    if (formData.documentType === 'Passport' && !passportExpiration) {
      Alert.alert('Error', 'Please fill your passport expiration date.');
      return;
    }

    // Prepare booking data
    const bookingData = {
      full_name: `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.trim(),
      first_name: formData.firstName,
      middle_name: formData.middleName || null,
      last_name: formData.lastName,
      email: formData.email,
      package_id: pkg.isLocal ? null : pkg.id || null,
      local_package_id: pkg.isLocal ? pkg.id || null : null,
      status: 'Pending',
      travel_date: null,
      passengers: totalPassengers,
      adults,
      children,
      age,
      dob: formData.dob,
      birth_place: formData.birthPlace,
      gender: formData.gender,
      phone: formData.phone,
      passport: formData.passport || null,
      document_type: formData.documentType,
      nationality: formData.nationality,
      passport_expiration: passportExpiration || null,
      address: formData.address || null,
    };

    try {
      // Validate foreign keys
      if (!pkg.isLocal) {
        const { data: packageExists, error: packageError } = await supabase
          .from('package_info')
          .select('id')
          .eq('id', pkg.id)
          .single();
        if (packageError || !packageExists) throw new Error('Selected package does not exist.');
      } else {
        const { data: localExists, error: localError } = await supabase
          .from('local_package_info')
          .select('id')
          .eq('id', pkg.id)
          .single();
        if (localError || !localExists) throw new Error('Selected local package does not exist.');
      }

      // Insert booking
      const { data, error } = await supabase
        .from('booking_info')
        .insert([bookingData])
        .select();

      if (error) throw error;

      console.log('Booking Insert Response:', data);

      // Send email
      const response = await fetch(
        'https://sdayzkpfodzqbpugprwq.supabase.co/functions/v1/send_booking_email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(bookingData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Email Error ${response.status}: ${errorText}`);
      }

      Alert.alert('Success', 'Booking completed! A receipt has been sent to your email.');
      setShowDetailsModal(false);

      navigation.navigate('Confirmation', {
        bookingId: data[0].id,
        user: pkg.destination || 'Guest',
      });
    } catch (err: any) {
      console.error('Booking Error:', err);
      Alert.alert('Error', err.message || 'Failed to complete booking.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#228B73" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Enter your Details</Text>
          </View>

          {showDetailsModal && (
            <View style={styles.card}>
              {/* Text Inputs */}
              {['lastName','firstName','middleName','age','birthPlace','address','phone','nationality','adults','children'].map((field) => (
                <TextInput
                  key={field}
                  style={styles.input}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={(formData as any)[field]}
                  onChangeText={(val) => handleChange(field as FormDataKeys, val)}
                  keyboardType={['age','phone','adults','children'].includes(field) ? 'numeric' : 'default'}
                />
              ))}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                editable={false} // user cannot edit
              />


              {/* Date of Birth */}
              <TouchableOpacity style={styles.input} onPress={() => setShowDobPicker(true)}>
                <Text style={{ color: formData.dob ? '#111' : '#999' }}>
                  {formData.dob || 'Date of Birth'}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showDobPicker}
                mode="date"
                maximumDate={new Date()}
                onConfirm={(date) => { handleChange('dob', date.toISOString().split('T')[0]); setShowDobPicker(false); }}
                onCancel={() => setShowDobPicker(false)}
              />

              {/* Gender Picker */}
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(val) => handleChange('gender', val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              {/* Document Type */}
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.documentType}
                  onValueChange={(val) => handleChange('documentType', val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Document Type" value="" />
                  <Picker.Item label="Passport" value="Passport" />
                  <Picker.Item label="Driver's License" value="Driver's License" />
                  <Picker.Item label="National ID" value="National ID" />
                  <Picker.Item label="Visa" value="Visa" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              {/* Document Number */}
              <TextInput
                style={styles.input}
                placeholder={formData.documentType ? `${formData.documentType} Number` : 'Document Number'}
                value={formData.passport}
                onChangeText={(val) => handleChange('passport', val)}
              />

              {formData.documentType === 'Passport' && (
                <TouchableOpacity style={styles.input} onPress={() => setShowPassportExpirationPicker(true)}>
                  <Text style={{ color: passportExpiration ? '#111' : '#999' }}>
                    {passportExpiration || 'Passport Expiration'}
                  </Text>
                  <DateTimePickerModal
                    isVisible={showPassportExpirationPicker}
                    mode="date"
                    onConfirm={(date) => { setPassportExpiration(date.toISOString().split('T')[0]); setShowPassportExpirationPicker(false); }}
                    onCancel={() => setShowPassportExpirationPicker(false)}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit}>
                <Text style={styles.confirmText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f2f2f2' },
  header: { backgroundColor: '#228B73', paddingTop: Platform.OS === 'ios' ? 30 : 35, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 5 },
  headerBack: { position: 'absolute', left: 10, top: Platform.OS === 'ios' ? 30 : 30, padding: 8 },
  headerText: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 3 },
  input: { backgroundColor: '#e6e6e6', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, color: '#111', marginBottom: 12, fontSize: 16 },
  pickerWrapper: { backgroundColor: '#e6e6e6', borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  picker: { height: 50, color: '#111' },
  confirmBtn: { marginTop: 15, backgroundColor: '#228B73', paddingVertical: 14, borderRadius: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 3 },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default TravellerInfoScreen;
