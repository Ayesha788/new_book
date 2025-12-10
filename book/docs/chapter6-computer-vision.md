# Chapter 6: Computer Vision for Humanoid Robotics

## Introduction to Computer Vision in Robotics

Computer vision is essential for humanoid robots to perceive and understand their environment. Unlike traditional robots, humanoid robots have multiple sensors positioned similar to human vision systems, enabling them to process visual information in ways that mimic human perception.

## Vision Systems for Humanoid Robots

### Stereo Vision Setup

Humanoid robots typically employ stereo vision systems to perceive depth, similar to human binocular vision:

```python
import cv2
import numpy as np

class StereoVisionSystem:
    def __init__(self, left_camera_params, right_camera_params):
        # Camera matrices and distortion coefficients
        self.left_K = left_camera_params['K']
        self.left_dist = left_camera_params['dist']
        self.right_K = right_camera_params['K']
        self.right_dist = right_camera_params['dist']

        # Rectification parameters
        self.R1, self.R2, self.P1, self.P2, self.Q = self.compute_rectification()

    def compute_rectification(self):
        # Compute rectification transforms
        R1, R2, P1, P2, Q, _, _ = cv2.stereoRectify(
            self.left_K, self.left_dist,
            self.right_K, self.right_dist,
            (640, 480),  # Image size
            None, None    # Rotation and translation between cameras
        )
        return R1, R2, P1, P2, Q

    def compute_disparity(self, left_img, right_img):
        # Rectify images
        left_rectified = cv2.remap(left_img, self.left_map1, self.left_map2, cv2.INTER_LINEAR)
        right_rectified = cv2.remap(right_img, self.right_map1, self.right_map2, cv2.INTER_LINEAR)

        # Compute disparity
        stereo = cv2.StereoSGBM_create(
            minDisparity=0,
            numDisparities=16*10,  # Must be divisible by 16
            blockSize=5,
            P1=8 * 3 * 5**2,
            P2=32 * 3 * 5**2,
            disp12MaxDiff=1,
            uniquenessRatio=15,
            speckleWindowSize=0,
            speckleRange=2,
            preFilterCap=63,
            mode=cv2.STEREO_SGBM_MODE_SGBM_3WAY
        )

        disparity = stereo.compute(left_rectified, right_rectified).astype(np.float32) / 16.0
        return disparity

    def depth_from_disparity(self, disparity):
        # Convert disparity to depth using Q matrix
        points = cv2.reprojectImageTo3D(disparity, self.Q)
        return points
```

### RGB-D Integration

RGB-D sensors provide both color and depth information, which is crucial for humanoid robot perception:

```python
import open3d as o3d
import numpy as np

class RGBDProcessor:
    def __init__(self, camera_intrinsics):
        self.intrinsics = camera_intrinsics
        self.fov_x = camera_intrinsics['fov_x']
        self.fov_y = camera_intrinsics['fov_y']

    def create_point_cloud(self, rgb_image, depth_image, depth_scale=1000.0):
        # Convert to Open3D format
        rgbd_image = o3d.geometry.RGBDImage.create_from_color_and_depth(
            o3d.geometry.Image(rgb_image),
            o3d.geometry.Image(depth_image),
            depth_scale=depth_scale,
            depth_trunc=3.0,
            convert_rgb_to_intensity=False
        )

        # Create point cloud
        pcd = o3d.geometry.PointCloud.create_from_rgbd_image(
            rgbd_image,
            o3d.camera.PinholeCameraIntrinsic(
                width=rgb_image.shape[1],
                height=rgb_image.shape[0],
                fx=self.intrinsics['fx'],
                fy=self.intrinsics['fy'],
                cx=self.intrinsics['cx'],
                cy=self.intrinsics['cy']
            )
        )

        return pcd

    def segment_objects(self, point_cloud, cluster_tolerance=0.02, min_cluster_size=100):
        # Downsample point cloud
        downsampled = point_cloud.voxel_down_sample(voxel_size=0.01)

        # Segment plane (ground)
        plane_model, inliers = downsampled.segment_plane(
            distance_threshold=0.01,
            ransac_n=3,
            num_iterations=1000
        )

        # Remove ground plane
        object_cloud = downsampled.select_by_index(inliers, invert=True)

        # Extract clusters
        labels = np.array(object_cloud.cluster_dbscan(
            eps=cluster_tolerance,
            min_points=min_cluster_size
        ))

        return object_cloud, labels
```

## Object Detection and Recognition

### Deep Learning for Object Detection

Modern humanoid robots use deep learning models for object detection and recognition:

```python
import torch
import torchvision
from torchvision import transforms
import cv2

class ObjectDetector:
    def __init__(self, model_path=None):
        # Load pre-trained model (e.g., YOLO or Faster R-CNN)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        if model_path:
            self.model = torch.load(model_path)
        else:
            # Use pre-trained COCO model
            self.model = torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=True)

        self.model.to(self.device)
        self.model.eval()

        # COCO dataset class names
        self.coco_names = [
            '__background__', 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus',
            'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign',
            'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
            'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag',
            'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
            'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
            'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana',
            'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza',
            'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table',
            'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
            'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock',
            'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
        ]

        # Image transforms
        self.transform = transforms.Compose([
            transforms.ToTensor(),
        ])

    def detect_objects(self, image, confidence_threshold=0.5):
        # Preprocess image
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)

        # Run inference
        with torch.no_grad():
            predictions = self.model(image_tensor)

        # Process predictions
        boxes = predictions[0]['boxes'].cpu().numpy()
        labels = predictions[0]['labels'].cpu().numpy()
        scores = predictions[0]['scores'].cpu().numpy()

        # Filter by confidence
        valid_indices = scores >= confidence_threshold
        filtered_boxes = boxes[valid_indices]
        filtered_labels = labels[valid_indices]
        filtered_scores = scores[valid_indices]

        # Convert to result format
        results = []
        for box, label, score in zip(filtered_boxes, filtered_labels, filtered_scores):
            results.append({
                'bbox': box,
                'label': self.coco_names[label],
                'confidence': score
            })

        return results
```

## Visual SLAM for Humanoid Robots

Visual SLAM (Simultaneous Localization and Mapping) is crucial for humanoid robots to navigate unknown environments:

```python
import cv2
import numpy as np

class VisualSLAM:
    def __init__(self):
        # Feature detector and descriptor
        self.detector = cv2.SIFT_create()
        self.matcher = cv2.BFMatcher()

        # Camera parameters
        self.fx, self.fy = 525.0, 525.0  # Focal lengths
        self.cx, self.cy = 319.5, 239.5  # Principal points

        # Pose tracking
        self.current_pose = np.eye(4)
        self.keyframes = []
        self.map_points = []

    def process_frame(self, image, timestamp):
        # Detect features
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        keypoints, descriptors = self.detector.detectAndCompute(gray, None)

        if len(self.keyframes) == 0:
            # First frame - initialize
            self.keyframes.append({
                'image': image,
                'keypoints': keypoints,
                'descriptors': descriptors,
                'pose': self.current_pose.copy(),
                'timestamp': timestamp
            })
            return self.current_pose

        # Match with previous frame
        prev_frame = self.keyframes[-1]
        matches = self.matcher.knnMatch(
            prev_frame['descriptors'],
            descriptors,
            k=2
        )

        # Apply Lowe's ratio test
        good_matches = []
        for match_pair in matches:
            if len(match_pair) == 2:
                m, n = match_pair
                if m.distance < 0.7 * n.distance:
                    good_matches.append(m)

        if len(good_matches) >= 10:
            # Extract matched points
            prev_pts = np.float32([prev_frame['keypoints'][m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
            curr_pts = np.float32([keypoints[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

            # Compute essential matrix and pose
            E, mask = cv2.findEssentialMat(
                curr_pts, prev_pts,
                focal=self.fx, pp=(self.cx, self.cy),
                method=cv2.RANSAC, threshold=1.0
            )

            if E is not None:
                # Recover pose
                _, R, t, _ = cv2.recoverPose(E, curr_pts, prev_pts,
                                           focal=self.fx, pp=(self.cx, self.cy))

                # Update current pose
                T = np.eye(4)
                T[:3, :3] = R
                T[:3, 3] = t.flatten()
                self.current_pose = self.current_pose @ np.linalg.inv(T)

        # Store current frame as keyframe if enough motion detected
        if self.should_add_keyframe():
            self.keyframes.append({
                'image': image,
                'keypoints': keypoints,
                'descriptors': descriptors,
                'pose': self.current_pose.copy(),
                'timestamp': timestamp
            })

        return self.current_pose

    def should_add_keyframe(self):
        # Simple heuristic: add keyframe if enough frames have passed
        # or if there are enough new map points
        return len(self.keyframes) == 0 or len(self.keyframes) % 10 == 0
```

## Face Detection and Recognition

Humanoid robots often need to detect and recognize human faces for social interaction:

```python
import cv2
import face_recognition
import numpy as np

class FaceRecognitionSystem:
    def __init__(self):
        # Load known faces
        self.known_face_encodings = []
        self.known_face_names = []

    def add_known_face(self, image_path, name):
        # Load image and encode face
        image = face_recognition.load_image_file(image_path)
        face_encodings = face_recognition.face_encodings(image)

        if len(face_encodings) > 0:
            self.known_face_encodings.append(face_encodings[0])
            self.known_face_names.append(name)

    def recognize_faces(self, image):
        # Find all face locations and encodings in the image
        face_locations = face_recognition.face_locations(image)
        face_encodings = face_recognition.face_encodings(image, face_locations)

        results = []
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            # Compare face with known faces
            matches = face_recognition.compare_faces(
                self.known_face_encodings,
                face_encoding
            )
            name = "Unknown"

            # Calculate face distances
            face_distances = face_recognition.face_distance(
                self.known_face_encodings,
                face_encoding
            )

            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = self.known_face_names[best_match_index]

            results.append({
                'name': name,
                'bbox': (left, top, right, bottom),
                'confidence': 1 - min(face_distances) if len(face_distances) > 0 else 0
            })

        return results
```

## Integration with ROS 2

### Image Processing Node

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
from std_msgs.msg import String
import cv2

class VisionNode(Node):
    def __init__(self):
        super().__init__('vision_node')

        # Create subscribers and publishers
        self.image_sub = self.create_subscription(
            Image,
            '/camera/rgb/image_raw',
            self.image_callback,
            10
        )

        self.detection_pub = self.create_publisher(
            String,
            '/vision/detections',
            10
        )

        # Initialize computer vision components
        self.cv_bridge = CvBridge()
        self.object_detector = ObjectDetector()

        self.get_logger().info('Vision node initialized')

    def image_callback(self, msg):
        try:
            # Convert ROS image to OpenCV format
            cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Run object detection
            detections = self.object_detector.detect_objects(cv_image)

            # Publish results
            result_msg = String()
            result_msg.data = str(detections)
            self.detection_pub.publish(result_msg)

        except Exception as e:
            self.get_logger().error(f'Error processing image: {e}')
```

## Challenges in Humanoid Robot Vision

### Real-time Processing

Humanoid robots require real-time visual processing while maintaining balance and other tasks:

- Efficient algorithms optimized for embedded systems
- Multi-threading to separate vision processing from control
- Prioritization of critical visual tasks

### Varying Lighting Conditions

Humanoid robots operate in diverse lighting conditions:

- Adaptive exposure control
- Image enhancement algorithms
- Robust feature detection across lighting variations

### Motion Artifacts

Moving robots introduce motion blur and vibration:

- Image stabilization techniques
- Motion compensation algorithms
- Temporal filtering to reduce noise

## Practice Tasks

1. Implement a simple object detection system using a pre-trained model
2. Create a visual SLAM system for a humanoid robot simulation
3. Develop face recognition capabilities for human-robot interaction
4. Integrate vision processing with the robot's navigation system
5. Test vision algorithms under different lighting and motion conditions

## Summary

Computer vision enables humanoid robots to perceive and understand their environment. By combining traditional computer vision techniques with deep learning and specialized algorithms for humanoid platforms, robots can perform complex visual tasks essential for autonomous operation.