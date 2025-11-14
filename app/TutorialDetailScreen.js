import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "./auth/axiosInstance";
import RenderHtml from "react-native-render-html";

export default function TutorialDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTutorialDetail();
  }, [slug]);

  const fetchTutorialDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/tutorials/${slug}/`);
      setTutorial(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching tutorial:", err.response?.data || err.message);
      setError("Failed to load tutorial details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTutorialDetail();
  };

  const navigateToTopic = (topicSlug) => {
    router.push({
      pathname: "/TopicViewScreen",
      params: {
        slug: topicSlug, // Pass the topic slug as 'slug' parameter
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0078FF" />
        <Text style={styles.loadingText}>Loading tutorial...</Text>
      </View>
    );
  }

  if (error || !tutorial) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>{error || "Tutorial not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTutorialDetail}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >

      {/* Tutorial Thumbnail */}
      <Image
        source={{ uri: decodeURIComponent(tutorial.thumbnail) }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Tutorial Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{tutorial.title}</Text>
        
        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.statText}>{tutorial.total_topics} Topics</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.statText}>
              Updated {new Date(tutorial.updated_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.descriptionBox}>
            <RenderHtml
              contentWidth={300}
              source={{ html: tutorial.description }}
              baseStyle={styles.htmlContent}
            />
          </View>
        </View>

        {/* Topics List */}
        <View style={styles.topicsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Topics</Text>
            <Text style={styles.topicsCount}>({tutorial.topics.length})</Text>
          </View>

          {tutorial.topics.length > 0 ? (
            tutorial.topics.map((topic, index) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicItem}
                onPress={() => navigateToTopic(topic.slug)} // Pass topic.slug directly
              >
                <View style={styles.topicNumber}>
                  <Text style={styles.topicNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.topicContent}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <View style={styles.topicStats}>
                    <View style={styles.topicStat}>
                      <Ionicons name="eye-outline" size={14} color="#666" />
                      <Text style={styles.topicStatText}>{topic.views} views</Text>
                    </View>
                    <View style={styles.topicStat}>
                      <Ionicons name="thumbs-up-outline" size={14} color="#666" />
                      <Text style={styles.topicStatText}>{topic.likes}</Text>
                    </View>
                    <View style={styles.topicStat}>
                      <Ionicons name="thumbs-down-outline" size={14} color="#666" />
                      <Text style={styles.topicStatText}>{topic.dislikes}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noTopics}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.noTopicsText}>No topics available yet</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  thumbnail: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    marginBottom: 15,
    lineHeight: 34,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 25,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  statText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 14,
  },
  descriptionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 15,
  },
  descriptionBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  htmlContent: {
    color: "#444",
    fontSize: 15,
    lineHeight: 22,
  },
  topicsSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  topicsCount: {
    marginLeft: 8,
    color: "#0078FF",
    fontSize: 16,
    fontWeight: "600",
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  topicNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0078FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  topicNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  topicStats: {
    flexDirection: "row",
  },
  topicStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  topicStatText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  noTopics: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noTopicsText: {
    marginTop: 12,
    color: "#999",
    fontSize: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});