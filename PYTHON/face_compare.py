from deepface import DeepFace
import numpy as np

def get_embedding(image):
    img_rgb = image[:, :, ::-1]

    reps = DeepFace.represent(
        img_path=img_rgb,
        model_name="ArcFace",
        enforce_detection=False
    )

    emb = np.array(reps[0]["embedding"])
    emb = emb / np.linalg.norm(emb)     # Normalize ✔

    return emb


def compare_embeddings(emb1, emb2, threshold=0.55):
    dist = np.linalg.norm(emb1 - emb2)
    return dist < threshold, float(dist)
