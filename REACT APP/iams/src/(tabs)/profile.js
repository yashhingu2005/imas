import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function Profile() {
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Error logging out: " + error.message);
      return;
    }

    // Redirect to login screen
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar} />

        <Text style={styles.text}>Name: Yash Hingu</Text>
        <Text style={styles.text}>ID Card No: 3120231019</Text>
        <Text style={styles.text}>Email: yash@gmail.com</Text>
      </View>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { backgroundColor: "#3546A0", padding: 20 },
  title: { fontSize: 22, color: "#fff", fontWeight: "bold" },
  subtitle: { color: "#eee" },

  card: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: "#ccc",
    borderRadius: 40,
    alignSelf: "center",
    marginBottom: 20,
  },

  text: { fontSize: 16, marginBottom: 10 },

  logout: {
    backgroundColor: "#425ee8",
    padding: 15,
    marginHorizontal: 40,
    borderRadius: 12,
  },
  logoutText: { color: "#fff", textAlign: "center", fontSize: 16 },
});
