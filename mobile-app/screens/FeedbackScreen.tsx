import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { getAuth } from "firebase/auth";
import { Modal } from "react-native";

// ✅ Supabase client
const SUPABASE_URL = Constants.expoConfig?.extra?.SUPABASE_URL!;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Firebase auth
const auth = getAuth();

type Props = NativeStackScreenProps<RootStackParamList, "FeedbackScreen">;

const FeedbackScreen: React.FC<Props> = ({ navigation }) => {
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert("Feedback Required", "Please enter your feedback before submitting.");
      return;
    }

    const user = auth.currentUser;

    try {
      setLoading(true);

      const { error } = await supabase.from("feedback_info").insert([
        {
          name: name.trim() || null,   // optional
          email: user?.email || "Guest",
          message: feedback.trim(),
        },
      ]);

      if (error) throw error;

      setShowModal(true);
      setFeedback("");
      setName("");
    } catch (err: any) {
      console.error("Feedback submission error:", err);
      Alert.alert("Error", err.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feedback</Text>
        </View>

        {/* Illustration */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/review.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.mainTitle}>We appreciate your feedback.</Text>
        <Text style={styles.subText}>
          We are always looking for ways to improve your experience. Please take a moment to tell us what you think.
        </Text>

        {/* Optional Name */}
        <Text style={styles.label}>Your Name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        {/* Message Box */}
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, { minHeight: 120 }]}
          placeholder="Type your feedback here..."
          placeholderTextColor="#999"
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={submitFeedback}
          disabled={loading}
        >
          <Text style={styles.submitText}>{loading ? "Submitting..." : "Submit Feedback"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Popup */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Image
              source={require("../assets/Pop.png")}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>Thanks for your feedback!</Text>
            <Text style={styles.modalText}>
              You’re helping us create even better adventures.
            </Text>

            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.modalBtnText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF5F5" },
  header: {
    backgroundColor: "#228B73",
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: { marginRight: 12 },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 90,
  },
  imageContainer: { alignItems: "center", marginTop: 20 },
  illustration: { width: 120, height: 120, borderRadius: 60 },
  mainTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginTop: 15, color: "#000" },
  subText: { fontSize: 14, textAlign: "center", marginHorizontal: 30, marginTop: 8, color: "#555" },
  label: { fontSize: 14, fontWeight: "600", marginTop: 20, marginHorizontal: 20, color: "#000" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 8,
    fontSize: 14,
    color: "#000",
  },
  submitBtn: {
    backgroundColor: "#228B73",
    marginTop: 25,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
  },
  submitText: { color: "white", fontWeight: "600", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalImage: { width: 120, height: 120, marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  modalText: { fontSize: 14, textAlign: "center", color: "#666", marginBottom: 20 },
  modalBtn: {
    backgroundColor: "#228B73",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  modalBtnText: { color: "white", fontWeight: "600", fontSize: 16 },
});

export default FeedbackScreen;
