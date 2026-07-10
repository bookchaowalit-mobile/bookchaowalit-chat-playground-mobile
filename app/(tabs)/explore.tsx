import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="compass" size={48} color="#4A90D9" />
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          Discover features and content for Chat Playground.
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Explore content will be added here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center" },
  content: { padding: 16 },
  placeholder: { fontSize: 16, color: "#999", textAlign: "center", marginTop: 32 },
});
