import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, StatusBar, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'FaqsScreen'>;

const FaqsScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="light-content" backgroundColor="black" />
    
    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('ProfileScreen', { user: 'Guest' })}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>FAQs</Text>
    </View>

    {/* FAQ Content */}
    <ScrollView style={styles.content}>

      <View style={styles.card}>
        <Text style={styles.q}>Q: How do I contact customer support?</Text>
        <Text style={styles.a}>A: Use the "Help & Support" option in the app menu to chat or email us.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.q}>Q: How will I recieved my ticket??</Text>
        <Text style={styles.a}>A: Tickets are sent to your email address after successful booking. Make sure to check your spam folder as well.</Text>
      </View>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
 header: {
  backgroundColor: "#228B73",
  paddingTop: 55,   // dagdagan para bumaba lahat
  paddingBottom: 20,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  alignItems: "center",
},

  backButton: { 
    position: 'absolute', 
    left: 16, 
    top: 50 // align with header padding
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 22, 
    fontWeight: '700', 
    textAlign: 'center' 
  },
  content: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  q: { fontWeight: '700', fontSize: 16, color: '#000' },
  a: { marginTop: 6, color: '#555', fontSize: 15, lineHeight: 20 },
});

export default FaqsScreen;