import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New Course Available!",
      message: "Check out our new 'Cloud Fundamentals' course today.",
      read: false,
    },
    {
      id: "2",
      title: "Course Progress Update",
      message: "You're 60% through 'React Native from Scratch'. Keep it up!",
      read: false,
    },
  ]);

  // 👉 Mark as Read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // 🗑️ Delete Notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 🔄 Render Swipe Actions
  const renderRightActions = (id) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#0078FF" }]}
        onPress={() => markAsRead(id)}
      >
        <Ionicons name="checkmark-done-outline" size={24} color="#fff" />
        <Text style={styles.actionText}>Read</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#FF3B30" }]}
        onPress={() => deleteNotification(id)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#999" />
          <Text style={{ color: "#999", marginTop: 10, fontSize: 16 }}>
            No new notifications
          </Text>
        </View>
      ) : (
        notifications.map((item) => (
          <Swipeable
            key={item.id}
            renderRightActions={() => renderRightActions(item.id)}
            overshootRight={false}
          >
            <View
              style={[
                styles.notificationCard,
                { opacity: item.read ? 0.6 : 1 },
              ]}
            >
              <Ionicons
                name={
                  item.read ? "notifications-outline" : "notifications-sharp"
                }
                size={28}
                color={item.read ? "#888" : "#0078FF"}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.title,
                    { color: item.read ? "#666" : "#111" },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.message,
                    { color: item.read ? "#999" : "#444" },
                  ]}
                >
                  {item.message}
                </Text>
              </View>
            </View>
          </Swipeable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginBottom: 15,
  },
  notificationCard: {
    backgroundColor: "#F7F9FC",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  message: {
    fontSize: 14,
    marginTop: 3,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    height: "90%",
    borderRadius: 12,
    marginLeft: 5,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
});
