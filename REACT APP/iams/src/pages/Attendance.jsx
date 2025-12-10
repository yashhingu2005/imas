import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Attendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("attendance_records")
      .select(`
        id,
        timestamp,
        profiles(full_name, student_id),
        sessions(id, timetable_id)
      `);

    if (error) {
      console.error(error);
      return;
    }

    setRecords(data);
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-primary mb-4">
        Attendance Records
      </h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-primary text-white">
            <th className="p-3">Student</th>
            <th className="p-3">Student ID</th>
            <th className="p-3">Session</th>
            <th className="p-3">Date / Time</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border">
              <td className="p-3">{r.profiles.full_name}</td>
              <td className="p-3">{r.profiles.student_id}</td>
              <td className="p-3">{r.sessions.id}</td>
              <td className="p-3">{new Date(r.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
