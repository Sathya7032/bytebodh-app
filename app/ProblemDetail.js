import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet, 
  Linking,
  Dimensions,
  TouchableOpacity,
  Alert
} from "react-native";
import { WebView } from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import * as Clipboard from 'expo-clipboard';
import api from "./auth/axiosInstance";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

const ProblemDetail = () => {
  const { slug } = useLocalSearchParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { width } = Dimensions.get('window');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/api/problems/${slug}/`);
        setProblem(response.data);
      } catch (err) {
        console.error(err);
        setError("⚠️ Failed to load problem.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  // Copy code to clipboard
  const copyToClipboard = async (code) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert("Success", "Code copied to clipboard!");
    } catch (err) {
      Alert.alert("Error", "Failed to copy code");
    }
  };

  // Simple syntax highlighting function
  const highlightJavaCode = (code) => {
    if (!code) return null;

    const keywords = [
      'public', 'class', 'static', 'void', 'main', 'String', 'args',
      'private', 'protected', 'return', 'new', 'this', 'super', 'extends',
      'implements', 'interface', 'abstract', 'final', 'finally', 'try',
      'catch', 'throw', 'throws', 'import', 'package'
    ];

    const types = ['int', 'double', 'float', 'long', 'short', 'byte', 'char', 'boolean'];
    const constants = ['true', 'false', 'null'];

    return code.split('\n').map((line, lineIndex) => {
      const words = line.split(/(\s+)/);
      return (
        <View key={lineIndex} style={styles.codeLine}>
          <Text style={styles.lineNumber}>{lineIndex + 1}</Text>
          <Text style={styles.codeText}>
            {words.map((word, wordIndex) => {
              let style = styles.codeDefault;
              
              if (keywords.includes(word.trim())) {
                style = styles.codeKeyword;
              } else if (types.includes(word.trim())) {
                style = styles.codeType;
              } else if (constants.includes(word.trim())) {
                style = styles.codeConstant;
              } else if (word.match(/^".*"$/) || word.match(/^'.'$/)) {
                style = styles.codeString;
              } else if (word.match(/^\/\//)) {
                style = styles.codeComment;
              } else if (word.match(/^\/\*/) || word.match(/\*\/$/)) {
                style = styles.codeComment;
              } else if (word.match(/^[0-9]+(\.[0-9]+)?$/)) {
                style = styles.codeNumber;
              } else if (word.match(/^[A-Z][A-Za-z0-9_]*$/)) {
                style = styles.codeClass;
              }
              
              return (
                <Text key={wordIndex} style={style}>
                  {word}
                </Text>
              );
            })}
          </Text>
        </View>
      );
    });
  };

  // Function to render code with syntax highlighting
  const renderCodeSnippet = (code, language = 'java') => {
    return (
      <View style={styles.codeContainer}>
        <View style={styles.codeHeader}>
          <Text style={styles.codeLanguage}>{language.toUpperCase()}</Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={() => copyToClipboard(code)}
          >
            <Ionicons name="copy-outline" size={16} color="#ccc" />
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.codeScrollContent}
        >
          <ScrollView showsVerticalScrollIndicator={true}>
            <View style={styles.codeContent}>
              {highlightJavaCode(code)}
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    );
  };

  // Function to render YouTube video
  const renderVideo = (videoUrl) => {
    if (!videoUrl) return null;

    // Extract video ID from YouTube URL
    const getVideoId = (url) => {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return match ? match[1] : null;
    };

    const videoId = getVideoId(videoUrl);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
      <View style={styles.videoContainer}>
        <Text style={styles.sectionTitle}>Video Tutorial</Text>
        <View style={styles.videoWrapper}>
          <WebView
            style={styles.video}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            source={{ uri: embedUrl }}
          />
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#003153" />
      <Text style={{ marginTop: 10 }}>Loading problem...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.center}>
      <Text style={{ color: "#e74c3c" }}>{error} {slug}</Text>
    </View>
  );

  if (!problem) return (
    <View style={styles.center}>
      <Text>Problem not found.</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Problem Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{problem.title}</Text>
        <Text style={styles.topic}>Topic: {problem.topic}</Text>
        <Text style={styles.date}>
          Created: {new Date(problem.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Video Tutorial - Moved to top */}
      {problem.video_url && renderVideo(problem.video_url)}

      {/* Question */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Question</Text>
        <Text style={styles.question}>{problem.question}</Text>
      </View>

      {/* Explanation */}
      {problem.explanation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explanation</Text>
          <View style={styles.explanationContainer}>
            <RenderHtml
              contentWidth={width - 40}
              source={{ html: problem.explanation }}
              baseStyle={styles.explanationText}
            />
          </View>
        </View>
      )}

      {/* Code Snippet */}
      {problem.code_snippet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solution</Text>
          {renderCodeSnippet(problem.code_snippet, 'java')}
        </View>
      )}

      {/* Additional spacing */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export default ProblemDetail;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fafafa",
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#003153", 
    marginBottom: 8 
  },
  topic: { 
    fontSize: 16, 
    color: "#555", 
    marginBottom: 4,
    fontWeight: "500"
  },
  date: { 
    fontSize: 14, 
    color: "#999" 
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#003153",
    marginBottom: 12,
  },
  question: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  explanationContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#003153",
  },
  explanationText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  codeContainer: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 5,
  },
  codeHeader: {
    backgroundColor: "#2d2d2d",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3d3d3d",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLanguage: {
    color: "#ccc",
    fontSize: 12,
    fontWeight: "600",
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  copyButtonText: {
    color: "#ccc",
    fontSize: 12,
    marginLeft: 4,
  },
  codeScrollContent: {
    flexGrow: 1,
  },
  codeContent: {
    padding: 15,
  },
  codeLine: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  lineNumber: {
    color: '#6e7681',
    width: 40,
    fontSize: 12,
    textAlign: 'right',
    paddingRight: 10,
  },
  codeText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 18,
  },
  codeDefault: {
    color: '#d4d4d4',
  },
  codeKeyword: {
    color: '#569cd6',
    fontWeight: '500',
  },
  codeType: {
    color: '#4ec9b0',
  },
  codeString: {
    color: '#ce9178',
  },
  codeComment: {
    color: '#6a9955',
    fontStyle: 'italic',
  },
  codeNumber: {
    color: '#b5cea8',
  },
  codeConstant: {
    color: '#569cd6',
  },
  codeClass: {
    color: '#4ec9b0',
  },
  videoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  videoWrapper: {
    height: 220,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
  },
});