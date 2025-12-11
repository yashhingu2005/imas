import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function FaceRecognition() {
  const { id } = useLocalSearchParams(); // session_id
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [previewUri, setPreviewUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const captureImage = async () => {
    if (!cameraRef) return;

    const photo = await cameraRef.takePictureAsync();
    setPreviewUri(photo.uri);
  };

  // Convert image blob → base64
  const blobToBase64 = (blob) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });

  const submitFace = async () => {
    try {
      // 1️⃣ Get current student ID
      const user = await supabase.auth.getUser();
      const studentId = user.data.user.id;

      // 2️⃣ Fetch enrolled face file
      const { data: fileList } = await supabase.storage
        .from("enrollment_faces")
        .list(`${studentId}`);

      if (!fileList || fileList.length === 0) {
        Alert.alert("Error", "No enrolled face found. Please enroll first.");
        return;
      }

      const enrolledName = fileList[0].name;

      // Get public URL for enrolled image
      const { data: publicURL } = supabase.storage
        .from("enrollment_faces")
        .getPublicUrl(`${studentId}/${enrolledName}`);

      // 3️⃣ Download both images as blob
      const enrolledBlob = await fetch(publicURL.publicUrl).then((r) => r.blob());
      const currentBlob = await fetch(previewUri).then((r) => r.blob());

      // 4️⃣ Convert both to base64
      const enrolledB64 = await blobToBase64(enrolledBlob);
      const currentB64 = await blobToBase64(currentBlob);

      // 5️⃣ Call Flask Face API
      const response = await fetch("http://10.244.38.97:5000/verify-face-b64", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_image: enrolledB64,
          current_image: currentB64,
        }),
      });

      const result = await response.json();
      console.log("Face Result:", result);

      // 6️⃣ Validate result
      if (!result.liveness)
        return Alert.alert("Liveness Failed", "Spoof attempt detected!");

      if (!result.face_match)
        return Alert.alert("Face Mismatch", "Face does not match record.");

      // 7️⃣ Insert attendance in Supabase
      const { error: insertErr } = await supabase.from("attendance_records").insert({
        session_id: id,
        student_id: studentId,
        method: "face",
        confidence_score: result.match_distance,
        is_verified: true,
      });

      if (insertErr) return Alert.alert("Error", insertErr.message);

      // 8️⃣ Go to success screen
      router.replace("/success");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Face verification failed.");
    }
  };

  if (hasPermission === false)
    return <Text>No camera access</Text>;

  return (
    <View style={{ flex: 1 }}>
      {!previewUri ? (
        <>
          <CameraView
            ref={(ref) => setCameraRef(ref)}
            style={{ flex: 1 }}
          />
          <TouchableOpacity style={styles.captureBtn} onPress={captureImage}>
            <Text style={{ color: "#fff", fontSize: 20 }}>Capture Face</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Image source={{ uri: previewUri }} style={styles.preview} />

          <TouchableOpacity style={styles.submitBtn} onPress={submitFace}>
            <Text style={{ color: "#fff", fontSize: 18 }}>Submit for Verification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retakeBtn} onPress={() => setPreviewUri(null)}>
            <Text style={{ color: "#fff", fontSize: 16 }}>Retake</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  captureBtn: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignSelf: "center",
    backgroundColor: "#425EE8",
    padding: 15,
    width: "70%",
    borderRadius: 12,
    alignItems: "center",
  },
  preview: { flex: 1, resizeMode: "cover" },
  submitBtn: {
    backgroundColor: "green",
    padding: 15,
    alignItems: "center",
  },
  retakeBtn: {
    backgroundColor: "red",
    padding: 15,
    alignItems: "center",
  },
});
