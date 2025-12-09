from flask import Flask, request, jsonify
import base64
import cv2
import numpy as np
import os

from liveness import LivenessDetector
from face_compare import get_embedding, compare_embeddings

app = Flask(__name__)

# Load Liveness Model
detector = LivenessDetector(
    model_dir="C:/Users/Admin/OneDrive/Desktop/HACKATHON/PYTHON/Silent-Face-Anti-Spoofing/resources/anti_spoof_models"
)

EMBEDDING_DIR = "embeddings"
os.makedirs(EMBEDDING_DIR, exist_ok=True)


def decode_image(image_bytes):
    """Decode base64 → OpenCV frame"""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


@app.route("/verify-face", methods=["POST"])
def verify_face():
    """
    payload:
    form-data:
    - primary_image (file)
    - current_image (file)
    """

    primary_file = request.files.get("primary_image")
    current_file = request.files.get("current_image")

    if not primary_file or not current_file:
        return jsonify({"error": "Both images required"}), 400

    primary_bytes = primary_file.read()
    current_bytes = current_file.read()

    primary_image = decode_image(primary_bytes)
    current_image = decode_image(current_bytes)

    # 1. LIVENESS CHECK
    is_real, live_confidence = detector.detect(current_image)
    if is_real is None:
        return jsonify({"error": "No face detected"}), 400

    # 2. FACE EMBEDDINGS
    emb1 = get_embedding(primary_image)
    emb2 = get_embedding(current_image)

    if emb1 is None or emb2 is None:
        return jsonify({"error": "Face not detected for embedding"}), 400

    # 3. COMPARE
    match, distance = compare_embeddings(emb1, emb2)

    return jsonify({
        "liveness": bool(is_real),
        "liveness_confidence": live_confidence,
        "face_match": bool(match),
        "match_distance": distance
    })


@app.route("/")
def index():
    return jsonify({"message": "Face backend running!"})


if __name__ == "__main__":
    app.run(port=5000, debug=True)
