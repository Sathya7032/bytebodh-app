import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../auth/axiosInstance";

const AddCommentModal = ({ visible, onClose, slug, onCommentAdded }) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    if (!slug) {
      Alert.alert("Error", "Topic information is missing");
      return;
    }

    try {
      setLoading(true);
      
      await api.post(`/api/topics/${slug}/comments/`, {
        content: comment.trim()
      });

      setComment("");
      onCommentAdded();
      Alert.alert("Success", "Comment added successfully!");
      
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to add comment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setComment("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add Comment</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent}>
              {/* Comment Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Your Comment</Text>
                <TextInput
                  style={styles.textInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Share your thoughts, ask questions, or provide feedback..."
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  editable={!loading}
                  maxLength={500}
                />
                <Text style={styles.charCount}>
                  {comment.length}/500 characters
                </Text>
              </View>

              {/* Guidelines */}
              <View style={styles.guidelines}>
                <Text style={styles.guidelinesTitle}>Comment Guidelines</Text>
                <Text style={styles.guidelineItem}>• Be respectful and constructive</Text>
                <Text style={styles.guidelineItem}>• Stay on topic</Text>
                <Text style={styles.guidelineItem}>• No spam or self-promotion</Text>
                <Text style={styles.guidelineItem}>• Ask clear, specific questions</Text>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!comment.trim() || loading) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!comment.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Post Comment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  inputContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    minHeight: 120,
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  guidelines: {
    padding: 20,
    paddingTop: 0,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  guidelineItem: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0078FF",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default AddCommentModal;