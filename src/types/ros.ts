import { Time } from "@foxglove/rostime";

export type Header = {
  stamp: Time;
  frame_id: string;
};

// sensor_msgs/Joy message definition
// http://docs.ros.org/en/api/sensor_msgs/html/msg/Joy.html
export type Joy = {
  header: Header;
  axes: number[];
  buttons: number[];
};

// geometry_msgs/Vector3 message definition
export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

// geometry_msgs/Twist message definition
// http://docs.ros.org/en/api/geometry_msgs/html/msg/Twist.html
export type Twist = {
  linear: Vector3;
  angular: Vector3;
};
