import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function Home() {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveSession();

    // 🔄 auto refresh every 5 seconds
    const interval = setInterval(loadActiveSession, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadActiveSession = async () => {
    setLoading(true);
  
    // 1️⃣ Get logged-in student
    const userRes = await supabase.auth.getUser();
    const studentId = userRes.data.user.id;
  
    // 2️⃣ Get the student's course
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("course_id")
      .eq("id", studentId)
      .single();
  
    if (pErr || !profile?.course_id) {
      console.log("No course assigned to student", pErr);
      setActiveSession(null);
      setLoading(false);
      return;
    }
  
    const courseId = profile.course_id;
  
    // 3️⃣ Get today's timetables for that course
    const today = new Date().getDay(); // 0-6
  
    const { data: timetables, error: tErr } = await supabase
      .from("timetables")
      .select(`
        id,
        room_number,
        start_time,
        end_time,
        courses(name)
      `)
      .eq("course_id", courseId)
      .eq("day_of_week", today);
  
    if (tErr || !timetables?.length) {
      console.log("No timetables today", tErr);
      setActiveSession(null);
      setLoading(false);
      return;
    }
  
    const timetableIds = timetables.map((t) => t.id);
  
    // 4️⃣ Get sessions for those timetables that are ACTIVE
    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .select(`
        id,
        timetable_id,
        qr_nonce,
        status,
        timetables(
          room_number,
          courses(name)
        )
      `)
      .in("timetable_id", timetableIds)
      .eq("status", "active")
      .maybeSingle();
  
    if (sErr) console.log("Session error:", sErr);
  
    // 5️⃣ Set active session or null
    setActiveSession(session || null);
    setLoading(false);
  };
  
  

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3546A0" />
      </View>
    );

  // 🟥 No Active class
  if (!activeSession)
    return (
      <View style={{ flex: 1, alignItems: "center", paddingTop: 60 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#3546A0" }}>
          No Active Class
        </Text>
        <Text style={{ marginTop: 8, color: "#777", fontSize: 16 }}>
          Your teacher has not started a session yet.
        </Text>
      </View>
    );

  // 🟩 Active Class Found
  return (
    <View style={{ flex: 1, alignItems: "center", paddingTop: 60 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#3546A0" }}>
        Active Class Found!
      </Text>

      <Text style={{ marginTop: 10, fontSize: 18 }}>
        {activeSession.timetables.courses.name}
      </Text>

      <Text style={{ marginTop: 3, fontSize: 15, color: "#777" }}>
        Room {activeSession.timetables.room_number}
      </Text>

      <TouchableOpacity
        onPress={() =>
          router.push(`/mark/${activeSession.id}?nonce=${activeSession.qr_nonce}`)

        }
        style={{
          marginTop: 25,
          backgroundColor: "#425EE8",
          padding: 15,
          width: "70%",
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          Scan QR to Mark Attendance
        </Text>
      </TouchableOpacity>
    </View>
  );
}
