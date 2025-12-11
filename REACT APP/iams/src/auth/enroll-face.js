import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";

import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";

import { uploadImage } from "../../utils/uploadImage";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";

export default function EnrollFace() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [userId, setUserId] = useState(null);
  const [previewUri, setPreviewUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user
  useEffect(() => {
    (async () => {
      await Camera.requestCameraPermissionsAsync();
      const u = await supabase.auth.getUser();
      setUserId(u.data.user.id);
    })();
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.btnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      skipProcessing: true,
    });

    // square crop
    const cropped = await ImageManipulator.manipulateAsync(
      photo.uri,
      [
        {
          crop: {
            originX: 0,
            originY: 0,
            width: photo.width,
            height: photo.width,
          },
        },
      ],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    setPreviewUri(cropped.uri);
  };

  const uploadFace = async () => {
    if (!previewUri || !userId) return;

    setLoading(true);

    try {
      const uploadResult = await uploadImage(previewUri, "enrollment_faces");

      console.log("UPLOADED:", uploadResult);

      await supabase.from("face_embeddings").insert({
        student_id: userId,
        embedding: null,
      });

      alert("Face enrolled!");
      router.replace("/(tabs)");
    } catch (err) {
      alert("Could not upload: " + err.message);
    }

    setLoading(false);
  };

  // Preview UI
  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: previewUri }} style={styles.preview} />

        {!loading ? (
          <>
            <TouchableOpacity
              style={styles.buttonAlt}
              onPress={() => setPreviewUri(null)}
            >
              <Text style={styles.btnTextAlt}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={uploadFace}>
              <Text style={styles.btnText}>Save & Continue</Text>
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator size="large" style={{ marginTop: 10 }} />
        )}
      </View>
    );
  }

  // Camera UI
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        mode="picture"
        facing="front"
      />

      <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
        <Text style={{ color: "#fff", fontSize: 18 }}>Capture</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },

  captureBtn: {
    backgroundColor: "#3546A0",
    padding: 18,
    borderRadius: 50,
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },

  container: { flex: 1, alignItems: "center", backgroundColor: "#fff" },
  preview: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginTop: 40,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#3546A0",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    marginBottom: 10,
  },
  btnText: { color: "#fff", textAlign: "center", fontSize: 16 },

  buttonAlt: {
    backgroundColor: "#ddd",
    padding: 15,
    width: "80%",
    borderRadius: 10,
    marginBottom: 10,
  },
  btnTextAlt: { textAlign: "center", fontSize: 16 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
