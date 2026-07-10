import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat Playground</Text>
        <Text style={styles.subtitle}>Chat Playground — Mobile app (expo)</Text>
      </View>

      <View style={styles.cardGrid}>
        <FeatureCard
          icon="rocket"
          title="Getting Started"
          description="Welcome to the mobile version. Start building your experience."
        />
        <FeatureCard
          icon="code"
          title="Tech Stack"
          description="Built with Expo, React Native, and TypeScript."
        />
        <FeatureCard
          icon="phone-portrait"
          title="Cross-Platform"
          description="Runs on iOS, Android, and Web from a single codebase."
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Part of Chaowalit Greepoke's 101 Portfolio Projects
        </Text>
        <Link href="https://bookchaowalit.com" asChild>
          <Pressable>
            <Text style={styles.link}>bookchaowalit.com</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={28} color="#4A90D9" />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#4A90D9",
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
  },
  cardGrid: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
  link: {
    fontSize: 14,
    color: "#4A90D9",
    fontWeight: "500",
  },
});
