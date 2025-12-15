#!/usr/bin/env python3

"""
Isaac ROS Perception Pipeline Example

This example demonstrates how to set up a basic perception pipeline using Isaac ROS packages.
It shows how to integrate camera input with Isaac ROS DNN packages for object detection.
"""

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from vision_msgs.msg import Detection2DArray
from geometry_msgs.msg import TransformStamped
from tf2_ros import TransformBroadcaster
import cv2
from cv_bridge import CvBridge
import numpy as np
import message_filters


class IsaacPerceptionPipeline(Node):
    def __init__(self):
        super().__init__('isaac_perception_pipeline')

        # Initialize CV bridge
        self.cv_bridge = CvBridge()

        # Publishers
        self.detection_pub = self.create_publisher(Detection2DArray, '/isaac_ros/detections', 10)
        self.debug_image_pub = self.create_publisher(Image, '/isaac_ros/debug_image', 10)

        # Subscribers using message filters for synchronization
        self.image_sub = message_filters.Subscriber(self, Image, '/camera/image_raw')
        self.info_sub = message_filters.Subscriber(self, CameraInfo, '/camera/camera_info')

        # Synchronize image and camera info
        self.sync = message_filters.ApproximateTimeSynchronizer(
            [self.image_sub, self.info_sub], queue_size=10, slop=0.1
        )
        self.sync.registerCallback(self.image_info_callback)

        # TF broadcaster for camera frame
        self.tf_broadcaster = TransformBroadcaster(self)

        # Perception state
        self.camera_intrinsics = None
        self.latest_image = None

        self.get_logger().info('Isaac Perception Pipeline initialized')

    def image_info_callback(self, image_msg, info_msg):
        """
        Callback for synchronized image and camera info
        """
        try:
            # Convert ROS image to OpenCV
            cv_image = self.cv_bridge.imgmsg_to_cv2(image_msg, desired_encoding='bgr8')

            # Store camera intrinsics
            self.camera_intrinsics = {
                'fx': info_msg.k[0],  # Focal length x
                'fy': info_msg.k[4],  # Focal length y
                'cx': info_msg.k[2],  # Principal point x
                'cy': info_msg.k[5],  # Principal point y
            }

            # Process the image through perception pipeline
            detections, debug_image = self.process_image(cv_image)

            # Publish detections
            self.publish_detections(detections, image_msg.header)

            # Publish debug image
            debug_msg = self.cv_bridge.cv2_to_imgmsg(debug_image, encoding='bgr8')
            debug_msg.header = image_msg.header
            self.debug_image_pub.publish(debug_msg)

        except Exception as e:
            self.get_logger().error(f'Error processing image: {e}')

    def process_image(self, cv_image):
        """
        Process image through perception pipeline
        In a real implementation, this would use Isaac ROS DNN packages
        For this example, we'll simulate object detection
        """
        # Create a copy of the image for drawing
        debug_image = cv_image.copy()

        # Simulate object detection (in real implementation, this would come from Isaac ROS DNN)
        # For demonstration, we'll detect some colored rectangles
        hsv = cv2.cvtColor(cv_image, cv2.COLOR_BGR2HSV)

        # Define range for red color (example)
        lower_red = np.array([0, 50, 50])
        upper_red = np.array([10, 255, 255])
        mask1 = cv2.inRange(hsv, lower_red, upper_red)

        lower_red = np.array([170, 50, 50])
        upper_red = np.array([180, 255, 255])
        mask2 = cv2.inRange(hsv, lower_red, upper_red)

        mask = mask1 + mask2
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        detections = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 500:  # Filter small detections
                x, y, w, h = cv2.boundingRect(contour)

                # Draw bounding box
                cv2.rectangle(debug_image, (x, y), (x + w, y + h), (0, 255, 0), 2)

                # Add detection (simulated)
                detection = {
                    'label': 'red_object',
                    'confidence': 0.9,
                    'bbox': (x, y, w, h),
                    'center': (x + w//2, y + h//2)
                }
                detections.append(detection)

        return detections, debug_image

    def publish_detections(self, detections, header):
        """
        Publish detections in vision_msgs format
        """
        detection_array = Detection2DArray()
        detection_array.header = header

        # Convert our detections to vision_msgs format
        # Note: In a real Isaac ROS implementation, this would come directly from DNN packages
        for detection in detections:
            # Create a Detection2D message
            detection_msg = Detection2D()

            # Set bounding box
            detection_msg.bbox.size_x = detection['bbox'][2]
            detection_msg.bbox.size_y = detection['bbox'][3]
            detection_msg.bbox.center.x = detection['center'][0]
            detection_msg.bbox.center.y = detection['center'][1]

            # Set results
            # Note: In real implementation, this would use proper message types
            # For this example, we'll simulate the results

            detection_array.detections.append(detection_msg)

        self.detection_pub.publish(detection_array)

    def broadcast_camera_transform(self, header):
        """
        Broadcast camera frame transform
        """
        t = TransformStamped()

        t.header.stamp = header.stamp
        t.header.frame_id = 'base_link'
        t.child_frame_id = 'camera_frame'

        t.transform.translation.x = 0.1  # Camera offset from base
        t.transform.translation.y = 0.0
        t.transform.translation.z = 0.2
        t.transform.rotation.x = 0.0
        t.transform.rotation.y = 0.0
        t.transform.rotation.z = 0.0
        t.transform.rotation.w = 1.0

        self.tf_broadcaster.sendTransform(t)


def main(args=None):
    rclpy.init(args=args)
    perception_pipeline = IsaacPerceptionPipeline()

    try:
        rclpy.spin(perception_pipeline)
    except KeyboardInterrupt:
        perception_pipeline.get_logger().info('Shutting down Isaac Perception Pipeline')
    finally:
        perception_pipeline.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()