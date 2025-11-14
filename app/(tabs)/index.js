import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import api from "../auth/axiosInstance";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchTutorials = useCallback(async () => {
    try {
      const response = await api.get("/api/tutorials/");
      setTutorials(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching tutorials:", err.response?.data || err.message);
      setError("⚠️ Failed to load tutorials. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTutorials();
  }, [fetchTutorials]);

  const navigateToTutorial = (tutorial) => {
  router.push({
    pathname: "/TutorialDetailScreen",
    params: { 
      slug: tutorial.slug
    }
  });
};

  const stripHtmlTags = (html) => {
    return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0078FF" />
        <Text style={styles.loadingText}>Loading tutorials...</Text>
      </View>
    );
  }

  if (error && tutorials.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.errorContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Welcome to <Text style={styles.brandName}>ByteBodh</Text>
        </Text>
        <Text style={styles.headerSubtitle}>
          Empower your future with technology — Learn. Build. Grow.
        </Text>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Start Learning Today</Text>
          <Text style={styles.heroSubtitle}>
            Explore hundreds of curated courses in AI, web, and more.
          </Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Explore Courses</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
          }}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Tutorials Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Tutorials</Text>
        <Text style={styles.sectionSubtitle}>{tutorials.length} courses available</Text>
      </View>

      {tutorials.length > 0 ? (
        tutorials.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.tutorialCard}
            onPress={() => navigateToTutorial(item)}
          >
            <View style={styles.tutorialImageContainer}>
              <Image
                source={{ uri: decodeURIComponent(item.thumbnail) }}
                style={styles.tutorialImage}
                resizeMode="cover"
              />
              <View style={styles.tutorialBadge}>
                <Text style={styles.badgeText}>{item.total_topics || 0} Topics</Text>
              </View>
            </View>
            
            <View style={styles.tutorialContent}>
              <Text style={styles.tutorialTitle}>{item.title}</Text>
              <Text style={styles.tutorialDescription} numberOfLines={2}>
                {stripHtmlTags(item.description)}
              </Text>
              
              <View style={styles.tutorialFooter}>
                <View style={styles.difficulty}>
                  <View style={styles.difficultyDot} />
                  <Text style={styles.difficultyText}>Beginner</Text>
                </View>
                <Text style={styles.readTime}>15 min read</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/4076/4076473.png" }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>No tutorials available</Text>
          <Text style={styles.emptySubtitle}>Check back later for new content</Text>
        </View>
      )}

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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#0078FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: "#111",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  brandName: {
    color: "#0078FF",
  },
  headerSubtitle: {
    color: "#666",
    fontSize: 16,
    marginTop: 8,
    lineHeight: 22,
  },
  heroBanner: {
    backgroundColor: "#EAF4FF",
    margin: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0078FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    color: "#003153",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#555",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  heroButton: {
    backgroundColor: "#0078FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  heroImage: {
    width: 100,
    height: 100,
    marginLeft: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#111",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "#888",
    fontSize: 14,
  },
  tutorialCard: {
    backgroundColor: "#F7F9FC",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tutorialImageContainer: {
    position: "relative",
  },
  tutorialImage: {
    width: "100%",
    height: 160,
  },
  tutorialBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 120, 255, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  tutorialContent: {
    padding: 16,
  },
  tutorialTitle: {
    color: "#111",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  tutorialDescription: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tutorialFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficulty: {
    flexDirection: "row",
    alignItems: "center",
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  difficultyText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
  },
  readTime: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyImage: {
    width: 80,
    height: 80,
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#666",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  bottomSpacer: {
    height: 40,
  },
});