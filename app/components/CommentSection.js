import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../auth/axiosInstance";
import AddCommentModal from "./AddCommentModal";

const CommentsSection = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [addCommentModalVisible, setAddCommentModalVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchComments();
    }
  }, [slug]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/topics/${slug}/comments/`);
      setComments(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching comments:", err.response?.data || err.message);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComments();
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

  const handleCommentAdded = () => {
    setAddCommentModalVisible(false);
    fetchComments();
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

  const displayedComments = expanded ? comments : comments.slice(0, 3);

  if (loading && comments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0078FF" />
        <Text style={styles.loadingText}>Loading comments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubble-outline" size={20} color="#0078FF" />
          <Text style={styles.headerTitle}>Comments ({comments.length})</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addCommentButton}
          onPress={() => setAddCommentModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#0078FF" />
          <Text style={styles.addCommentText}>Add Comment</Text>
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      <ScrollView 
        style={styles.commentsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEnabled={expanded}
      >
        {displayedComments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onReaction={handleCommentReaction}
            getRelativeTime={getRelativeTime}
          />
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
      </ScrollView>

      {/* Show More/Less Button */}
      {comments.length > 3 && (
        <TouchableOpacity 
          style={styles.showMoreButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.showMoreText}>
            {expanded ? 'Show Less' : `View all ${comments.length} comments`}
          </Text>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#0078FF" 
          />
        </TouchableOpacity>
      )}

      {/* Add Comment Modal */}
      <AddCommentModal
        visible={addCommentModalVisible}
        onClose={() => setAddCommentModalVisible(false)}
        slug={slug}
        onCommentAdded={handleCommentAdded}
      />
    </View>
  );
};

// Separate Comment Item Component
const CommentItem = ({ comment, onReaction, getRelativeTime }) => {
  const [localLikes, setLocalLikes] = useState(comment.total_likes || 0);
  const [localDislikes, setLocalDislikes] = useState(comment.total_dislikes || 0);
  const [userReaction, setUserReaction] = useState(null);

  const handleReaction = (action) => {
    if (action === 'like') {
      if (userReaction === 'like') {
        setLocalLikes(prev => prev - 1);
        setUserReaction(null);
      } else {
        setLocalLikes(prev => prev + 1);
        if (userReaction === 'dislike') {
          setLocalDislikes(prev => prev - 1);
        }
        setUserReaction('like');
      }
    } else {
      if (userReaction === 'dislike') {
        setLocalDislikes(prev => prev - 1);
        setUserReaction(null);
      } else {
        setLocalDislikes(prev => prev + 1);
        if (userReaction === 'like') {
          setLocalLikes(prev => prev - 1);
        }
        setUserReaction('dislike');
      }
    }
    onReaction(comment.id, action);
  };

  return (
    <View style={styles.commentItem}>
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
          style={[
            styles.commentReactionButton,
            userReaction === 'like' && styles.commentReactionButtonActive
          ]}
          onPress={() => handleReaction('like')}
        >
          <Ionicons 
            name={userReaction === 'like' ? "thumbs-up" : "thumbs-up-outline"} 
            size={16} 
            color={userReaction === 'like' ? "#0078FF" : "#666"} 
          />
          <Text style={[
            styles.reactionCount,
            userReaction === 'like' && styles.reactionCountActive
          ]}>
            {localLikes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.commentReactionButton,
            userReaction === 'dislike' && styles.commentReactionButtonActive
          ]}
          onPress={() => handleReaction('dislike')}
        >
          <Ionicons 
            name={userReaction === 'dislike' ? "thumbs-down" : "thumbs-down-outline"} 
            size={16} 
            color={userReaction === 'dislike' ? "#FF6B6B" : "#666"} 
          />
          <Text style={[
            styles.reactionCount,
            userReaction === 'dislike' && styles.reactionCountActive
          ]}>
            {localDislikes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  addCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
  },
  addCommentText: {
    marginLeft: 6,
    color: "#0078FF",
    fontSize: 14,
    fontWeight: "600",
  },
  commentsList: {
    maxHeight: 400,
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
    backgroundColor: "#f8f9fa",
  },
  commentReactionButtonActive: {
    backgroundColor: "#e3f2fd",
  },
  reactionCount: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  reactionCountActive: {
    color: "#0078FF",
    fontWeight: "600",
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
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
  },
  showMoreText: {
    color: "#0078FF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
});

export default CommentsSection;