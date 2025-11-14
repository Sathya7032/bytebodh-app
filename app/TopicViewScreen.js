import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
  Linking,
  TextInput,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';
import api from "./auth/axiosInstance";
import RenderHtml from 'react-native-render-html';

const TopicViewScreen = () => {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [comments, setComments] = useState([]);
  const [problems, setProblems] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchTopicDetail();
      fetchProblems();
    }
  }, [slug]);

  const fetchTopicDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/topics/${slug}/`);
      setTopic(response.data);
      setReactions(response.data.reactions || { likes: 0, dislikes: 0 });
      setComments(response.data.comments || []);
      setError("");
    } catch (err) {
      console.error("Error fetching topic:", err.response?.data || err.message);
      setError("Failed to load topic details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await api.get(`/api/topics/${slug}/problems/`);
      setProblems(response.data);
    } catch (err) {
      console.error("Error fetching problems:", err.response?.data || err.message);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTopicDetail();
    fetchProblems();
  };

  const handleReaction = async (action) => {
    try {
      const response = await api.post(`/api/topics/${slug}/reaction/`, {
        action: action
      });

      setReactions({
        likes: response.data.likes,
        dislikes: response.data.dislikes
      });

      setUserReaction(action === 'like' ? 'like' : 'dislike');

      Alert.alert("Success", `Topic ${action}d!`);

    } catch (err) {
      console.error("Error updating reaction:", err);
      Alert.alert("Error", "Failed to update reaction. Please try again.");
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await api.post(`/api/topics/${slug}/comments/`, {
        content: newComment.trim()
      });

      setComments(prevComments => [response.data, ...prevComments]);
      setNewComment("");
      setCommentModalVisible(false);
      Alert.alert("Success", "Comment posted successfully!");

    } catch (err) {
      console.error("Error posting comment:", err);
      Alert.alert("Error", "Failed to post comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentReaction = async (commentId, action) => {
    try {
      const response = await api.post(`/api/comments/${commentId}/reaction/`, {
        action: action
      });

      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId ? response.data : comment
        )
      );

    } catch (err) {
      console.error("Error updating comment reaction:", err);
      Alert.alert("Error", "Failed to update reaction. Please try again.");
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const navigateToProblem = (problemSlug) => {
    router.push({
      pathname: "/ProblemDetailScreen",
      params: { slug: problemSlug }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0078FF" />
        <Text style={styles.loadingText}>Loading topic...</Text>
      </View>
    );
  }

  if (error || !topic) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>{error || "Topic not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTopicDetail}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const videoId = extractVideoId(topic.video_url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        

        {/* Topic Header Card */}
        <View style={styles.card}>
          <View style={styles.topicHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Topic {topic.id}</Text>
            </View>
            <Text style={styles.title}>{topic.title}</Text>
            
            {/* Stats Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={16} color="#666" />
                <Text style={styles.statText}>{topic.views} views</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                <Text style={styles.statText}>{reactions.likes} likes</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="thumbs-down-outline" size={16} color="#666" />
                <Text style={styles.statText}>{reactions.dislikes} dislikes</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={16} color="#666" />
                <Text style={styles.statText}>{comments.length} comments</Text>
              </View>
            </View>

            {/* Timestamps */}
            <View style={styles.timestamps}>
              <Text style={styles.timestamp}>
                Created: {formatDate(topic.created_at)}
              </Text>
              <Text style={styles.timestamp}>
                Updated: {formatDate(topic.updated_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Video Section */}
        {embedUrl && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="videocam-outline" size={20} color="#0078FF" />
              <Text style={styles.cardHeaderTitle}>Video Content</Text>
            </View>
            <View style={styles.videoContainer}>
              <WebView
                source={{ uri: embedUrl }}
                style={styles.video}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </View>
            <TouchableOpacity 
              style={styles.youtubeButton}
              onPress={() => Linking.openURL(topic.video_url)}
            >
              <Ionicons name="logo-youtube" size={20} color="#FF0000" />
              <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color="#0078FF" />
            <Text style={styles.cardHeaderTitle}>Topic Content</Text>
          </View>
          <View style={styles.contentBox}>
            <RenderHtml
              contentWidth={300}
              source={{ html: topic.content }}
              baseStyle={styles.htmlContent}
            />
          </View>
        </View>

        

        {/* Comments Preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubble-outline" size={20} color="#0078FF" />
            <Text style={styles.cardHeaderTitle}>Comments ({comments.length})</Text>
          </View>
          
          {/* Add Comment Button */}
          <TouchableOpacity 
            style={styles.addCommentButton}
            onPress={() => setCommentModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#0078FF" />
            <Text style={styles.addCommentText}>Add a comment</Text>
          </TouchableOpacity>

          {/* Comments List */}
          <View style={styles.commentsList}>
            {comments.slice(0, 3).map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>
                      {comment.user?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {comment.user || "Anonymous"}
                    </Text>
                    <Text style={styles.commentTime}>
                      {getRelativeTime(comment.created_at)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <View style={styles.commentReactions}>
                  <TouchableOpacity 
                    style={styles.commentReactionButton}
                    onPress={() => handleCommentReaction(comment.id, 'like')}
                  >
                    <Ionicons name="thumbs-up-outline" size={16} color="#666" />
                    <Text style={styles.reactionCount}>
                      {comment.total_likes || 0}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.commentReactionButton}
                    onPress={() => handleCommentReaction(comment.id, 'dislike')}
                  >
                    <Ionicons name="thumbs-down-outline" size={16} color="#666" />
                    <Text style={styles.reactionCount}>
                      {comment.total_dislikes || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {comments.length === 0 && (
              <View style={styles.noComments}>
                <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                <Text style={styles.noCommentsTitle}>No comments yet</Text>
                <Text style={styles.noCommentsText}>
                  Be the first to share your thoughts!
                </Text>
              </View>
            )}

            {comments.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllComments}
                onPress={() => setCommentModalVisible(true)}
              >
                <Text style={styles.viewAllCommentsText}>
                  View all {comments.length} comments
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#0078FF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Reactions Section */}
        <View style={styles.card}>
          <View style={styles.reactionsSection}>
            <Text style={styles.reactionsTitle}>Was this topic helpful?</Text>
            <View style={styles.reactionsButtons}>
              <TouchableOpacity
                style={[
                  styles.reactionButton,
                  userReaction === 'like' && styles.likeButtonActive
                ]}
                onPress={() => handleReaction('like')}
              >
                <Ionicons 
                  name={userReaction === 'like' ? "thumbs-up" : "thumbs-up-outline"} 
                  size={20} 
                  color={userReaction === 'like' ? "#fff" : "#28a745"} 
                />
                <Text style={[
                  styles.reactionButtonText,
                  userReaction === 'like' && styles.reactionButtonTextActive
                ]}>
                  Like ({reactions.likes})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reactionButton,
                  userReaction === 'dislike' && styles.dislikeButtonActive
                ]}
                onPress={() => handleReaction('dislike')}
              >
                <Ionicons 
                  name={userReaction === 'dislike' ? "thumbs-down" : "thumbs-down-outline"} 
                  size={20} 
                  color={userReaction === 'dislike' ? "#fff" : "#dc3545"} 
                />
                <Text style={[
                  styles.reactionButtonText,
                  userReaction === 'dislike' && styles.reactionButtonTextActive
                ]}>
                  Dislike ({reactions.dislikes})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <TouchableOpacity 
                onPress={() => setCommentModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Share your thoughts, ask questions, or provide feedback..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              editable={!commentLoading}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setCommentModalVisible(false)}
                disabled={commentLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (!newComment.trim() || commentLoading) && styles.submitButtonDisabled
                ]}
                onPress={handleCommentSubmit}
                disabled={!newComment.trim() || commentLoading}
              >
                {commentLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Post Comment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    color: "#0078FF",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#0078FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: "#0078FF",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicHeader: {
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "#0078FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
    lineHeight: 30,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  timestamps: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  videoContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 12,
  },
  video: {
    height: 200,
    width: "100%",
  },
  youtubeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF0000",
    borderRadius: 8,
  },
  youtubeButtonText: {
    marginLeft: 8,
    color: "#FF0000",
    fontWeight: "600",
    fontSize: 14,
  },
  contentBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
  },
  htmlContent: {
    color: "#444",
    fontSize: 16,
    lineHeight: 24,
  },
  problemsList: {
    marginTop: 8,
  },
  problemItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  problemBadge: {
    backgroundColor: "#6c757d",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  problemBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  noProblems: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noProblemsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
    marginBottom: 4,
  },
  noProblemsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  addCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    marginBottom: 16,
  },
  addCommentText: {
    marginLeft: 8,
    color: "#0078FF",
    fontSize: 16,
    fontWeight: "600",
  },
  commentsList: {
    marginTop: 8,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0078FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 12,
    color: "#999",
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 20,
    color: "#444",
    marginBottom: 8,
  },
  commentReactions: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentReactionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reactionCount: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  noComments: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noCommentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
    marginBottom: 4,
  },
  noCommentsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  viewAllComments: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  viewAllCommentsText: {
    color: "#0078FF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  reactionsSection: {
    alignItems: "center",
  },
  reactionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  reactionsButtons: {
    flexDirection: "row",
    gap: 16,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  likeButtonActive: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  dislikeButtonActive: {
    backgroundColor: "#dc3545",
    borderColor: "#dc3545",
  },
  reactionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  reactionButtonTextActive: {
    color: "#fff",
  },
  bottomSpacer: {
    height: 40,
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
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    minHeight: 120,
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
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

export default TopicViewScreen;