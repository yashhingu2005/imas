import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!fullName || !studentId || !email || !password || !confirm) {
      return setError("Please fill all fields.");
    }

    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    // 1️⃣ SIGN UP USER
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "student",
        },
      },
    });

    if (signUpError) return setError(signUpError.message);

    const user = data.user;
    if (!user) return setError("Unexpected signup error.");

    // 2️⃣ UPDATE PROFILE (since auto-profile row already exists)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        student_id: studentId,
        role: "student",
      })
      .eq("id", user.id);

    if (updateError) {
      return setError(updateError.message);
    }

    // 3️⃣ Go to face enrollment screen
    router.replace("/auth/enroll-face");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Student Account</Text>

      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Student ID" value={studentId} onChangeText={setStudentId} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#3546A0",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  btnText: { color: "white", textAlign: "center", fontSize: 16 },
  error: { color: "red", marginBottom: 10 },
  link: { textAlign: "center", marginTop: 15, color: "#3546A0" },
});
