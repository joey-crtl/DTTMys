// screens/AboutUsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const teamMembers = [
  {
    id: "1",
    name: "Kryshia Dean",
    role: "Manager",
    description:
      "With over 15 years of experience in global travel, Kryshia founded Horizon Travels to help others explore the world with ease and confidence.",
    image: require("../assets/profile.jpg"),
  },
  {
    id: "2",
    name: "Jose Enrique Soliman",
    role: "Team Leader",
    description:
      "With over 15 years of experience in global travel, Kryshia founded Horizon Travels to help others explore the world with ease and confidence.",
    image: require("../assets/profile.jpg"),
  },
  {
    id: "3",
    name: "Kathlyn Leal",
    role: "Designer",
    description:
      "With over 15 years of experience in global travel, Kryshia founded Horizon Travels to help others explore the world with ease and confidence.",
    image: require("../assets/profile.jpg"),
  },
  {
    id: "4",
    name: "Rogie Cabunas",
    role: "Documentation",
    description:
      "With over 15 years of experience in global travel, Kryshia founded Horizon Travels to help others explore the world with ease and confidence.",
    image: require("../assets/profile.jpg"),
  },
  {
    id: "5",
    name: "Jhon Lee Teofilo",
    role: "Developer",
    description:
      "With over 15 years of experience in global travel, Kryshia founded Horizon Travels to help others explore the world with ease and confidence.",
    image: require("../assets/profile.jpg"),
  },
];

const AboutUsScreen = ({ navigation }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Our Story */}
        <Text style={styles.sectionTitle}>Our Story</Text>

        <View style={styles.storyBlock}>
          <Image source={require("../assets/hp1.png")} style={styles.storyImage} />
          <View style={styles.storyText}>
            <Text style={styles.storyHeading}>Where It All Began</Text>
            <Text style={styles.storyDesc}>
              In 2018, I founded (Company Name) Travel Agency after a life
              changing solo trip across Southeast Asia. I realized how many
              people dreamed of traveling but felt overwhelmed by the planning.
              I wanted to create a company that made travel easy, personal, and
              unforgettable. That passion sparked the birth of (Company Name).
            </Text>
          </View>
        </View>

        <View style={[styles.storyBlock, styles.reverse]}>
          <Image source={require("../assets/hp2.png")} style={styles.storyImage} />
          <View style={styles.storyText}>
            <Text style={styles.storyHeading}>Growing with Passion</Text>
            <Text style={styles.storyDesc}>
              Now, we continue to grow adapting, exploring, and creating
              unforgettable travel experiences. But no matter how far we go, our
              heart remains in helping others see the world.
            </Text>
          </View>
        </View>

        <View style={styles.storyBlock}>
          <Image source={require("../assets/hp3.png")} style={styles.storyImage} />
          <View style={styles.storyText}>
            <Text style={styles.storyHeading}>Looking Ahead</Text>
            <Text style={styles.storyDesc}>
              We’re here to guide, support, and inspire every step of your
              journey. Whether it’s your first trip or your fiftieth, we treat
              every adventure like it’s our own.
            </Text>
          </View>
        </View>

        {/* Meet Our Team */}
        <Text style={styles.sectionTitle}>Meet Our Team</Text>
        {teamMembers.map((member) => (
        <TouchableOpacity
            key={member.id}
            style={styles.memberCardHorizontal}
            activeOpacity={0.8}
            onPress={() => toggleExpand(member.id)}
        >
            <Image source={member.image} style={styles.memberImageHorizontal} />
            <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
            {expandedId === member.id && (
                <Text style={styles.memberDesc}>{member.description}</Text>
            )}
            </View>
        </TouchableOpacity>
        ))}


        {/* Mission & Vision */}
        <Text style={styles.sectionTitle}>Mission & Vision</Text>
        <View style={styles.mvContainer}>
          <View style={styles.mvBox}>
            <Text style={styles.mvHeading}>Mission</Text>
            <Text style={styles.mvText}>
              To provide accessible, reliable, and comfortable travel
              experiences that connect people and cultures worldwide.
            </Text>
          </View>
          <View style={styles.mvBox}>
            <Text style={styles.mvHeading}>Vision</Text>
            <Text style={styles.mvText}>
              To become a global leader in air travel services, recognized for
              customer satisfaction, innovation, and excellence.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#228B73",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  scrollContent: { padding: 16 },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginVertical: 12, color: "#000" },

  // Story styles
  storyBlock: { flexDirection: "row", marginBottom: 20 },
  reverse: { flexDirection: "row-reverse" },
  storyImage: { width: 100, height: 100, borderRadius: 8 },
  storyText: { flex: 1, marginLeft: 12, marginRight: 12 },
  storyHeading: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  storyDesc: { fontSize: 14, color: "#444" },

    memberCardHorizontal: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "flex-start",
    },
    memberImageHorizontal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    },
    memberInfo: {
    flex: 1,
    },
    memberName: { fontSize: 14, fontWeight: "700" },
    memberRole: { fontSize: 12, color: "#777", marginBottom: 6 },
    memberDesc: { fontSize: 12, color: "#444" },


  // Mission & Vision
  mvContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  mvBox: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  mvHeading: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  mvText: { fontSize: 13, color: "#444" },
});
