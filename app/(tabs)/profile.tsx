import { StyleSheet, Text, View, ScrollView, Pressable, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.name}>Chaowalit Greepoke</Text>
        <Text style={styles.role}>Full-Stack Developer</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionText}>
          Full-stack developer specializing in TypeScript, React, Node.js, and
          cloud infrastructure. Building 101 portfolio projects across tools,
          business apps, and content platforms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Links</Text>
        <Pressable
          style={styles.linkRow}
          onPress={() => Linking.openURL("https://bookchaowalit.com")}
        >
          <Ionicons name="globe" size={20} color="#4A90D9" />
          <Text style={styles.linkText}>bookchaowalit.com</Text>
        </Pressable>
        <Pressable
          style={styles.linkRow}
          onPress={() => Linking.openURL("https://github.com/bookchaowalit")}
        >
          <Ionicons name="logo-github" size={20} color="#4A90D9" />
          <Text style={styles.linkText}>github.com/bookchaowalit</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#4A90D9",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  role: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionText: { fontSize: 14, color: "#666", lineHeight: 20 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  linkText: { fontSize: 14, color: "#4A90D9" },
});
