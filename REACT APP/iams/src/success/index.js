import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Success() {
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={90} color="#4CAF50" />

      <Text style={styles.title}>Attendance Marked!</Text>

      <Text style={styles.subtitle}>
        Your attendance has been recorded successfully.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonText}>Go Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    color: "#3546A0",
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
  },

  button: {
    marginTop: 40,
    backgroundColor: "#425EE8",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
