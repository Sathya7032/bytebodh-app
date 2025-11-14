import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../auth/axiosInstance";

const LikeDislikeSection = ({ slug, initialLikes = 0, initialDislikes = 0 }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikes(initialLikes);
    setDislikes(initialDislikes);
  }, [initialLikes, initialDislikes]);

  const handleReaction = async (action) => {
    if (loading || !slug) return;

    const currentLikes = likes;
    const currentDislikes = dislikes;
    const currentReaction = userReaction;

    try {
      setLoading(true);

      // Optimistic update
      if (action === 'like') {
        if (currentReaction === 'like') {
          setLikes(prev => prev - 1);
          setUserReaction(null);
        } else {
          setLikes(prev => prev + 1);
          if (currentReaction === 'dislike') {
            setDislikes(prev => prev - 1);
          }
          setUserReaction('like');
        }
      } else if (action === 'dislike') {
        if (currentReaction === 'dislike') {
          setDislikes(prev => prev - 1);
          setUserReaction(null);
        } else {
          setDislikes(prev => prev + 1);
          if (currentReaction === 'like') {
            setLikes(prev => prev - 1);
          }
          setUserReaction('dislike');
        }
      }

      // API call
      const response = await api.post(`/api/topics/${slug}/reaction/`, {
        action: action
      });

      // Update with server data
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);

    } catch (err) {
      console.error("Error updating reaction:", err);
      Alert.alert("Error", "Failed to update reaction. Please try again.");
      
      // Revert optimistic update
      setLikes(currentLikes);
      setDislikes(currentDislikes);
      setUserReaction(currentReaction);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Was this topic helpful?</Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.reactionButton,
            styles.likeButton,
            userReaction === 'like' && styles.likeButtonActive
          ]}
          onPress={() => handleReaction('like')}
          disabled={loading}
        >
          {loading && userReaction === 'like' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons 
                name={userReaction === 'like' ? "thumbs-up" : "thumbs-up-outline"} 
                size={20} 
                color={userReaction === 'like' ? "#fff" : "#28a745"} 
              />
              <Text style={[
                styles.buttonText,
                userReaction === 'like' && styles.buttonTextActive
              ]}>
                Like ({likes})
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reactionButton,
            styles.dislikeButton,
            userReaction === 'dislike' && styles.dislikeButtonActive
          ]}
          onPress={() => handleReaction('dislike')}
          disabled={loading}
        >
          {loading && userReaction === 'dislike' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons 
                name={userReaction === 'dislike' ? "thumbs-down" : "thumbs-down-outline"} 
                size={20} 
                color={userReaction === 'dislike' ? "#fff" : "#dc3545"} 
              />
              <Text style={[
                styles.buttonText,
                userReaction === 'dislike' && styles.buttonTextActive
              ]}>
                Dislike ({dislikes})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 120,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likeButton: {
    backgroundColor: "#fff",
    borderColor: "#28a745",
  },
  likeButtonActive: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  dislikeButton: {
    backgroundColor: "#fff",
    borderColor: "#dc3545",
  },
  dislikeButtonActive: {
    backgroundColor: "#dc3545",
    borderColor: "#dc3545",
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonTextActive: {
    color: "#fff",
  },
});

export default LikeDislikeSection;