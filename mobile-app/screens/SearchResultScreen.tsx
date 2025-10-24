// SearchResultsScreen.tsx
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
  TextInput,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, PackageType, useFavorites } from "../App";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { supabase } from "../supabaseClient";

type Props = NativeStackScreenProps<RootStackParamList, "SearchResults">;

const SearchResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const user = route.params?.user ?? "Guest";
  const [destination, setDestination] = useState("");
  const [selectedTab, setSelectedTab] = useState<"home" | "flights" | "favorites" | "profile">("home");

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [packages, setPackages] = useState<PackageType[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch packages from both tables
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data: localData } = await supabase.from("local_package_info").select("*");
      const { data: packageData } = await supabase.from("package_info").select("*");

      const combined = [
        ...(localData || []).map((item: any) => ({
          id: item.id,
          image: item.main_photo
            ? { uri: item.main_photo }
            : { uri: "https://via.placeholder.com/300x200.png?text=No+Image" },
          airline: item.name || item.destination || "Unknown Package",
          destination: item.destination || "Unknown",
          location: item.destination || "Unknown",
          price: Number(item.price),
          available: Number(item.available ?? 0),
          itinerary: item.itinerary || "",
          departure: "N/A",
          arrival: item.destination || "N/A",
          duration: "N/A",
          stops: [],
          inclusions: item.inclusions ? item.inclusions.split("\n") : [],
          exclusions: item.exclusions ? item.exclusions.split("\n") : [],
          gallery: item.add_photo?.map((url: string) => ({ uri: url })) || [],
          isLocal: true, // 👈 IMPORTANT
        })),
        ...(packageData || []).map((item: any) => ({
          id: item.id,
          image: item.main_photo
            ? { uri: item.main_photo }
            : { uri: "https://via.placeholder.com/300x200.png?text=No+Image" },
          airline: item.name || item.destination || "Unknown Package",
          destination: item.destination || "Unknown",
          location: item.destination || "Unknown",
          price: Number(item.price),
          available: Number(item.available ?? 0),
          itinerary: item.itinerary || "",
          departure: "N/A",
          arrival: item.destination || "N/A",
          duration: "N/A",
          stops: [],
          inclusions: item.inclusions ? item.inclusions.split("\n") : [],
          exclusions: item.exclusions ? item.exclusions.split("\n") : [],
          gallery: item.add_photo?.map((url: string) => ({ uri: url })) || [],
          isLocal: false, // 👈 IMPORTANT
        })),
      ];

      setPackages(combined);
      setFilteredPackages(combined);
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Live filtering
  useEffect(() => {
    const searchTerm = destination.trim().toLowerCase();
    if (!searchTerm) {
      setFilteredPackages(packages);
    } else {
      setFilteredPackages(packages.filter(pkg =>
        pkg.destination?.toLowerCase().includes(searchTerm)
      ));
    }
  }, [destination, packages]);

  const toggleFavorite = (item: PackageType) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id, item.isLocal); // ✅ Pass isLocal
    } else {
      addFavorite(item);
    }
  };

  const goToDetails = (item: PackageType) => {
    navigation.navigate("PackageDetails", { selectedPackage: item });
  };

  const renderCard = (item: PackageType, isGrid: boolean = false) => {
    const favorited = isFavorite(item.id);

    return (
      <View key={item.id} style={isGrid ? styles.cardGrid : styles.cardHorizontal}>
        {item.image && <Image source={item.image} style={isGrid ? styles.imageGrid : styles.image} />}
        <TouchableOpacity style={styles.heartButton} onPress={() => toggleFavorite(item)}>
          <FontAwesome name={favorited ? "heart" : "heart-o"} size={isGrid ? 20 : 22} color={favorited ? "#ff595e" : "#fff"} />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text style={isGrid ? styles.destinationTextReco : styles.airline}>
            {isGrid ? item.destination : item.airline}
          </Text>
          <Text style={isGrid ? styles.priceReco : styles.destinationText}>
            ₱{item.price.toLocaleString()} /head
          </Text>
          <TouchableOpacity style={isGrid ? styles.seeMoreButtonReco : styles.seeMoreButton} onPress={() => goToDetails(item)}>
            <Text style={isGrid ? styles.seeMoreTextReco : styles.seeMoreText}>See More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Filter packages with availability > 0
const popularPackages = filteredPackages.filter(pkg => (pkg.available ?? 0) > 0);
const recommendedPackages = packages.filter(pkg => (pkg.available ?? 0) > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your RX for Adventure</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Search Flights */}
          <View style={styles.searchFlightBox}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destination"
                placeholderTextColor="#999"
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>

          {/* Popular Section */}
          <Text style={styles.sectionTitle}>Popular</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#228B73" style={{ marginTop: 20 }} />
          ) : popularPackages.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>No packages found.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {popularPackages.map(item => renderCard(item))}
            </ScrollView>
          )}

          {/* Recommended Section */}
          <Text style={styles.sectionTitleReco}>Recommended</Text>
          <View style={styles.grid}>
            {recommendedPackages.map(item => renderCard(item, true))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => { setSelectedTab("home"); navigation.navigate("SearchResults", { origin: "", destination: "", user }); }}>
            <Ionicons name="home-outline" size={28} color={selectedTab === "home" ? "#228B73" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSelectedTab("flights"); navigation.navigate("AirlinePackageScreen"); }}>
            <Ionicons name="airplane-outline" size={28} color={selectedTab === "flights" ? "#228B73" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSelectedTab("favorites"); navigation.navigate("FavoritesScreen"); }}>
            <FontAwesome name={selectedTab === "favorites" ? "heart" : "heart-o"} size={26} color={selectedTab === "favorites" ? "#228B73" : "#999"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setSelectedTab("profile"); navigation.navigate("ProfileScreen", { user }); }}>
            <Ionicons name="person-outline" size={28} color={selectedTab === "profile" ? "#228B73" : "#999"} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Styles (unchanged)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "black" },
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#228B73", paddingTop: 55, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: "center" },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "500", lineHeight: 28 },
  searchFlightBox: { paddingHorizontal: 20, marginTop: 35 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9eaea", borderRadius: 10, paddingHorizontal: 10, height: 40, borderWidth: 1, borderColor: "#e5cfcf" },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, color: "#555" },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginTop: 30, marginLeft: 20 },
  sectionTitleReco: { fontSize: 20, fontWeight: "600", marginTop: 20, marginLeft: 20, marginBottom: 10 },
  horizontalScroll: { paddingHorizontal: 20, paddingVertical: 15, gap: 15, alignItems: "center" },
  cardHorizontal: { backgroundColor: "#f9f9f9", borderRadius: 10, overflow: "hidden", width: 220, borderColor: "#ddd", borderWidth: 1 },
  image: { width: "100%", height: 140 },
  heartButton: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.35)", padding: 6, borderRadius: 20 },
  cardContent: { padding: 15 },
  airline: { fontSize: 16, fontWeight: "500" },
  destinationText: { fontSize: 14, color: "#555", marginTop: 4 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  price: { fontSize: 14, color: "#333", fontWeight: "600" },
  seeMoreButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "#fff", borderWidth: 1, borderColor: "#228B73" },
  seeMoreText: { color: "#228B73", fontWeight: "500", fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, paddingHorizontal: 15 },
  cardGrid: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#ddd", marginBottom: 15, width: "48%" },
  imageGrid: { width: "100%", height: 140 },
  destinationTextReco: { fontSize: 15, color: "#555", fontWeight: "bold", marginTop: 4, marginBottom: 5 },
  priceReco: { fontSize: 12, color: "#333", fontWeight: "300", marginBottom: 4 },
  seeMoreButtonReco: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "#fff", borderWidth: 1, borderColor: "#228B73", marginTop: 5 },
  seeMoreTextReco: { color: "#228B73", fontWeight: "500", fontSize: 12, marginLeft: 25 },
  bottomNav: { position: "absolute", bottom: 0, left: 0, right: 0, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#ddd", backgroundColor: "#fff", flexDirection: "row", justifyContent: "space-around" },
});

export default SearchResultsScreen;
