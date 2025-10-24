// AirlinePackageScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useFavorites, PackageType, RootStackParamList } from "../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../supabaseClient";

type Props = NativeStackScreenProps<RootStackParamList, "AirlinePackageScreen">;

const AirlinePackageScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<
    "home" | "flights" | "favorites" | "profile"
  >("flights");

  const [localPackages, setLocalPackages] = useState<PackageType[]>([]);
  const [internationalPackages, setInternationalPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      // Fetch international packages
      const { data: internationalData, error: intError } = await supabase
        .from("package_info")
        .select("*");
      if (intError) throw intError;

      const internationalMapped: PackageType[] = (internationalData || []).map((item: any) => ({
        id: item.id,
        image: item.main_photo ? { uri: item.main_photo } : undefined,
        airline: item.name || "Unknown",
        destination: item.destination || "Unknown",
        location: item.destination || "Unknown",
        price: Number(item.price),
        available: Number(item.available ?? 0),
        itinerary: item.itinerary 
          ? typeof item.itinerary === 'string' 
            ? JSON.parse(item.itinerary) 
            : item.itinerary
          : [],
        departure: "N/A",
        arrival: item.destination || "N/A",
        duration: "N/A",
        stops: [],
        inclusions: item.inclusions ? item.inclusions.split("\n") : [],
        exclusions: item.exclusions ? item.exclusions.split("\n") : [],
        gallery: item.add_photo?.map((url: string) => ({ uri: url })) || [],
      }));

      // Fetch local/domestic packages
      const { data: localData, error: localError } = await supabase
        .from("local_package_info")
        .select("*")
        .gte("available", 1);
      if (localError) throw localError;

      const localMapped: PackageType[] = (localData || []).map((item: any) => ({
        id: item.id,
        image: item.main_photo ? { uri: item.main_photo } : undefined,
        airline: item.name || "Unknown",
        destination: item.destination || "Unknown",
        location: item.destination || "Unknown",
        price: Number(item.price),
        available: Number(item.available ?? 0),
        itinerary: item.itinerary 
          ? typeof item.itenerary ==="string" 
          ? JSON.parse(item.itinerary) 
          : item.itenerary
          :[],
        departure: "N/A",
        arrival: item.destination || "N/A",
        duration: "N/A",
        stops: [],
        inclusions: item.inclusions ? item.inclusions.split("\n") : [],
        exclusions: item.exclusions ? item.exclusions.split("\n") : [],
        gallery: item.add_photo?.map((url: string) => ({ uri: url })) || [],
      }));

      setInternationalPackages(internationalMapped);
      setLocalPackages(localMapped);
    } catch (error) {
      console.log("Fetch packages error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (pkg: PackageType) => {
    if (isFavorite(pkg.id)) removeFavorite(pkg.id);
    else addFavorite(pkg);
  };

  const renderPackageCard = (item: PackageType) => {
    const favorited = isFavorite(item.id);
    return (
      <View key={item.id} style={styles.cardHorizontal}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PackageDetails", { selectedPackage: item })
          }
        >
          {item.image && <Image source={item.image} style={styles.image} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleFavorite(item)}
        >
          <FontAwesome
            name={favorited ? "heart" : "heart-o"}
            size={22}
            color={favorited ? "#ff595e" : "#fff"}
          />
        </TouchableOpacity>

        <View style={styles.cardText}>
          <Text style={styles.destination}>{item.destination}</Text>
          <Text style={styles.airline}>{item.airline}</Text>
          <Text style={styles.price}>₱{item.price.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Packages</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#228B73" style={{ marginTop: 30 }} />
        ) : (
          <>
            {/* 🌍 International Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>🌍 International Packages</Text>
              <View style={styles.sectionDivider} />
              {internationalPackages.length === 0 ? (
                <Text style={{ textAlign: "center", color: "#888" }}>No international packages found.</Text>
              ) : (
                internationalPackages.map(renderPackageCard)
              )}
            </View>

            {/* 🇵🇭 Local/Domestic Section */}
            <View style={[styles.sectionContainer, { backgroundColor: "#f0faf7" }]}>
              <Text style={styles.sectionTitle}>🇵🇭 Domestic Packages</Text>
              <View style={styles.sectionDivider} />
              {localPackages.length === 0 ? (
                <Text style={{ textAlign: "center", color: "#888" }}>No Domestic packages found.</Text>
              ) : (
                localPackages.map(renderPackageCard)
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* ✅ Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => {
            setSelectedTab("home");
            navigation.navigate("SearchResults", { origin: "", destination: "", user: "Guest" });
          }}
        >
          <Ionicons
            name="home-outline"
            size={28}
            color={selectedTab === "home" ? "#228B73" : "#999"}
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

        <TouchableOpacity
          onPress={() => {
            setSelectedTab("favorites");
            navigation.navigate("FavoritesScreen");
          }}
        >
          <FontAwesome
            name={selectedTab === "favorites" ? "heart" : "heart-o"}
            size={26}
            color={selectedTab === "favorites" ? "#228B73" : "#999"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedTab("profile");
            navigation.navigate("ProfileScreen");
          }}
        >
          <Ionicons
            name="person-outline"
            size={28}
            color={selectedTab === "profile" ? "#228B73" : "#999"}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AirlinePackageScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#228B73",
    paddingVertical: 35,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },
  scrollContent: { padding: 16, paddingBottom: 80 },
  cardHorizontal: {
    backgroundColor: "#f8f8f8",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
  cardText: { padding: 12 },
  destination: { fontSize: 16, fontWeight: "bold", color: "#333" },
  airline: { fontSize: 14, color: "#666" },
  price: { fontSize: 16, fontWeight: "bold", color: "#228B73", marginTop: 4 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sectionContainer: {
    marginBottom: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#228B73",
    marginBottom: 8,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: "#228B73",
    width: 60,
    marginBottom: 15,
    borderRadius: 2,
  },
});
