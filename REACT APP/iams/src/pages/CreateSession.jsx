import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import QRCode from "react-qr-code";

export default function CreateSession() {
  const [teacherId, setTeacherId] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState("");
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get teacher auth session
  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getUser();
      setTeacherId(session.data.user.id);

      fetchTimetables(session.data.user.id);
    })();
  }, []);

  // Fetch teacher timetable
  const fetchTimetables = async (teacherId) => {
    const { data, error } = await supabase
      .from("timetables")
      .select("id, day_of_week, start_time, end_time, courses(name)")
      .eq("teacher_id", teacherId);

    if (error) {
      console.error(error);
      return;
    }

    setTimetables(data);
  };

  // Create session
  const createSession = async () => {
    if (!selectedTimetable) {
      alert("Please select a class");
      return;
    }

    setLoading(true);

    const nonce = Math.random().toString(36).substring(2, 10);

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        timetable_id: selectedTimetable,
        created_by: teacherId,
        qr_nonce: nonce,
        status: "active",
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // QR CODE DATA:
    setQrData(JSON.stringify({ session_id: data.id, nonce }));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Create New Session</h1>

      {/* TIMETABLE SELECT */}
      <select
        className="p-3 rounded-xl bg-input mb-4"
        onChange={(e) => setSelectedTimetable(e.target.value)}
      >
        <option value="">Select Class</option>

        {timetables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.courses.name} — Day {t.day_of_week + 1} ({t.start_time}-{t.end_time})
          </option>
        ))}
      </select>

      <br />

      <button
        className="bg-primary-light text-white px-6 py-3 rounded-xl"
        onClick={createSession}
      >
        {loading ? "Creating..." : "Generate QR"}
      </button>

      {/* QR DISPLAY */}
      {qrData && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-lg w-fit">
          <h2 className="text-xl font-semibold mb-3">Scan to Mark Attendance</h2>

          <QRCode value={qrData} size={220} />
        </div>
      )}
    </div>
  );
}
