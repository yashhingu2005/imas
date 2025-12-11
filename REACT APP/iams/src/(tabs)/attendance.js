import { View, Text, StyleSheet } from "react-native";

export default function AttendanceDashboard() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Dashboard</Text>
        <Text style={styles.subtitle}>Track your Record's</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall Record</Text>

        <View style={styles.row}>
          <Text style={{ color: "#3049c7" }}>93% Overall</Text>
          <Text style={{ color: "green" }}>Present</Text>
          <Text style={{ color: "red" }}>Absent</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { backgroundColor: "#3546A0", padding: 20 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "#eee" },

  card: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, marginBottom: 15 },

  row: { flexDirection: "row", justifyContent: "space-between" },
});
