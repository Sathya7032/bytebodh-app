import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
} from "react-native";
import api from "../auth/axiosInstance";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

const CodePage = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByTutorial, setSortByTutorial] = useState(false);
  const router = useRouter();

  const fetchProblems = useCallback(async () => {
    try {
      const response = await api.get("/api/all/problems/");
      setProblems(response.data);
      setFilteredProblems(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching problems:", err.response?.data || err.message);
      setError("⚠️ Failed to load problems. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // Filter and sort problems based on search query and sort option
  useEffect(() => {
    let result = problems;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(problem => 
        problem.title.toLowerCase().includes(query) ||
        problem.topic_title.toLowerCase().includes(query) ||
        problem.tutorial_title.toLowerCase().includes(query)
      );
    }

    // Apply sorting by tutorial name
    if (sortByTutorial) {
      result = [...result].sort((a, b) => 
        a.tutorial_title.localeCompare(b.tutorial_title)
      );
    }

    setFilteredProblems(result);
  }, [problems, searchQuery, sortByTutorial]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProblems();
  }, [fetchProblems]);

  const navigateToTutorial = (slug) => {
    router.push({
      pathname: "/ProblemDetail",
      params: { slug }
    });
  };

  const toggleSortByTutorial = () => {
    setSortByTutorial(!sortByTutorial);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003153" />
        <Text style={{ marginTop: 10, color: "#003153" }}>Loading problems...</Text>
      </View>
    );
  }

  if (error && problems.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.center}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={{ color: "#e74c3c", fontSize: 16, textAlign: "center" }}>{error}</Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search problems, topics, tutorials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, sortByTutorial && styles.filterButtonActive]}
          onPress={toggleSortByTutorial}
        >
          <Ionicons 
            name="filter" 
            size={20} 
            color={sortByTutorial ? "#fff" : "#003153"} 
          />
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
          {sortByTutorial && ' • Sorted by tutorial'}
        </Text>
      </View>

      <ScrollView
        style={styles.problemsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>All Problems</Text>
        
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem) => (
            <TouchableOpacity
              key={problem.id}
              style={styles.card}
              onPress={() => navigateToTutorial(problem.slug)}
            >
              <Text style={styles.title}>{problem.title}</Text>
              <Text style={styles.subText}>Topic: {problem.topic_title}</Text>
              <Text style={styles.subText}>Tutorial: {problem.tutorial_title}</Text>
              <Text style={styles.date}>Created: {new Date(problem.created_at).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={50} color="#ccc" />
            <Text style={styles.noResultsText}>No problems found</Text>
            <Text style={styles.noResultsSubText}>
              {searchQuery ? 'Try adjusting your search terms' : 'No problems available'}
            </Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default CodePage;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#fff" 
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#003153',
    borderColor: '#003153',
  },
  resultsInfo: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  problemsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 15, 
    color: "#003153" 
  },
  card: {
    padding: 15,
    backgroundColor: "#F7F9FC",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#111", 
    marginBottom: 4 
  },
  subText: { 
    fontSize: 13, 
    color: "#555", 
    marginBottom: 2 
  },
  date: { 
    fontSize: 12, 
    color: "#999" 
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});