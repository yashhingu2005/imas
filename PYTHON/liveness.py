import cv2
import sys

import numpy as np
import os
import warnings
warnings.filterwarnings('ignore')

sys.path.append('C:/Users/Admin/OneDrive/Desktop/HACKATHON/PYTHON/Silent-Face-Anti-Spoofing')


from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name


class LivenessDetector:
    def __init__(self, model_dir, device_id=0):
        self.model_test = AntiSpoofPredict(device_id)
        self.image_cropper = CropImage()
        self.model_dir = model_dir

        # Hardcoded model
        self.model_name = "2.7_80x80_MiniFASNetV2.pth"
        self.h_input, self.w_input, self.model_type, self.scale = parse_model_name(self.model_name)

    def detect(self, frame):
        """Return liveness flag and confidence"""
        image_bbox = self.model_test.get_bbox(frame)

        if image_bbox[0] == 0 and image_bbox[1] == 0:
            return None, None  # no face

        param = {
            "org_img": frame,
            "bbox": image_bbox,
            "scale": self.scale,
            "out_w": self.w_input,
            "out_h": self.h_input,
            "crop": True,
        }

        if self.scale is None:
            param["crop"] = False

        img = self.image_cropper.crop(**param)

        prediction = self.model_test.predict(img, os.path.join(self.model_dir, self.model_name))

        label = np.argmax(prediction)
        confidence = float(prediction[0][label])
        is_real = (label == 1)

        return is_real, confidence
