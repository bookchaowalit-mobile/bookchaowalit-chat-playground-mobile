import { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  conversationStats,
  estimateTokens,
  formatTranscript,
  isMessage,
  makeMessage,
  mockReply,
  recentMessages,
  type Message,
} from "../../lib/chat";
import { listCodec, valueCodec } from "../../lib/persist";
import { usePersistentState } from "../../lib/usePersistentState";

const messagesCodec = listCodec(isMessage);
const textCodec = valueCodec((v: unknown): v is string => typeof v === "string");

export default function PlaygroundScreen() {
  const [system, setSystem] = usePersistentState("playground.system.v1", "", textCodec);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = usePersistentState<Message[]>("playground.messages.v1", [], messagesCodec);
  const [showTranscript, setShowTranscript] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const all = system.trim() ? [makeSystem(system), ...messages] : messages;
  const stats = conversationStats(all);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) =>
      recentMessages([...prev, makeMessage("user", text), makeMessage("assistant", mockReply(text, system))]),
    );
    setDraft("");
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <View style={styles.top}>
        <TextInput
          style={styles.system}
          placeholder="System prompt / persona (optional)"
          value={system}
          onChangeText={setSystem}
          accessibilityLabel="System prompt"
        />
        <View style={styles.statsRow}>
          <Text style={styles.stats} accessibilityLiveRegion="polite">
            {stats.user} user · {stats.assistant} assistant · ≈{stats.tokens} tokens
          </Text>
          <Pressable
            onPress={() => setShowTranscript(!showTranscript)}
            accessibilityRole="button"
            accessibilityLabel={showTranscript ? "Show chat view" : "Show plain-text transcript"}
          >
            <Text style={styles.link}>{showTranscript ? "Chat" : "Transcript"}</Text>
          </Pressable>
          <Pressable
            onPress={() => setMessages([])}
            accessibilityRole="button"
            accessibilityLabel="Clear conversation"
            accessibilityState={{ disabled: messages.length === 0 }}
            disabled={messages.length === 0}
          >

            <Text style={[styles.link, messages.length === 0 && styles.disabled]}>Clear</Text>
          </Pressable>
        </View>
      </View>

      {showTranscript ? (
        <View style={styles.transcript}>
          <Text selectable style={styles.transcriptText}>
            {formatTranscript(all) || "Nothing yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={messages}
          keyExtractor={(m) => m.id}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Offline playground: replies come from a local mock assistant. Try “hello” or “/help”.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === "user" ? styles.user : styles.assistant]}>
              <Text selectable style={item.role === "user" ? styles.userText : styles.assistantText}>
                {item.content}
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
          multiline
          accessibilityLabel="Message"
        />
        <Text style={styles.draftTokens}>≈{estimateTokens(draft)}</Text>
        <Pressable
          style={[styles.send, !draft.trim() && styles.sendDisabled]}
          onPress={send}
          disabled={!draft.trim()}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeSystem(content: string): Message {
  return { id: "system", role: "system", content: content.trim() };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  top: { padding: 12, gap: 6, borderBottomWidth: 1, borderBottomColor: "#e5e5e5", backgroundColor: "#fff" },
  system: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stats: { flex: 1, fontSize: 12, color: "#777" },
  link: { color: "#4A90D9", fontWeight: "600" },
  disabled: { color: "#aaa" },
  list: { flex: 1 },
  listContent: { padding: 12, gap: 8 },
  empty: { textAlign: "center", color: "#888", marginTop: 32, paddingHorizontal: 24 },
  bubble: { maxWidth: "85%", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  user: { alignSelf: "flex-end", backgroundColor: "#4A90D9" },
  assistant: { alignSelf: "flex-start", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e5e5" },
  userText: { color: "#fff", fontSize: 15 },
  assistantText: { color: "#222", fontSize: 15 },
  transcript: { flex: 1, padding: 12 },
  transcriptText: { fontFamily: "monospace", fontSize: 13, color: "#333" },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 10, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e5e5e5" },
  input: { flex: 1, maxHeight: 120, borderWidth: 1, borderColor: "#ccc", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, fontSize: 15 },
  draftTokens: { fontSize: 11, color: "#999", paddingBottom: 10 },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#4A90D9", alignItems: "center", justifyContent: "center" },
  sendDisabled: { backgroundColor: "#A9C4E6" },
});
