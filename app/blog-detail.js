import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://backend.bytebodh.in';

const BlogDetail = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams();
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const styles = createStyles(colors);

  useEffect(() => {
    fetchBlogDetail();
  }, [slug]);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/blogs/slug/${slug}`);
      const blogData = response.data.data || response.data;
      setBlog(blogData);
      console.log('✅ Blog detail loaded:', blogData.title);
    } catch (err) {
      console.error('❌ Failed to fetch blog detail:', err);
      setError('Blog post not found');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getCategoryName = (blog) => {
    if (blog?.category?.name) return blog.category.name;
    if (blog?.category) return typeof blog.category === 'string' ? blog.category : 'Technology';
    return 'Technology';
  };

  const getAuthorName = (blog) => {
    return blog?.author || blog?.author_name || 'ByteBodh Team';
  };

  const getPublishedDate = (blog) => {
    if (blog?.createdAt) return new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (blog?.published_date) return new Date(blog.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (blog?.createdTime) return new Date(blog.createdTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return 'Recent';
  };

  const getReadTime = (blog) => {
    return blog?.readTime || blog?.read_time || '5 min';
  };

  const getFeaturedImage = (blog) => {
    return blog?.featured_image || blog?.imageUrl || null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Blog Detail</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading blog post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !blog) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Blog Detail</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Blog Post Not Found</Text>
          <Text style={styles.errorText}>{error || 'The requested blog post could not be found.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBlogDetail}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Blog Detail</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Blog Hero */}
        <View style={styles.heroSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{getCategoryName(blog)}</Text>
          </View>
          
          <Text style={styles.blogTitle}>{blog.title}</Text>

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{getAuthorName(blog)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{getPublishedDate(blog)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{getReadTime(blog)} read</Text>
            </View>
            {blog.views !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>{blog.views} views</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Featured Image */}
          {getFeaturedImage(blog) && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: getFeaturedImage(blog) }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Blog Content */}
          <View style={styles.contentCard}>
            {blog.description && (
              <RenderHtml
                contentWidth={width - 64}
                source={{ html: blog.description }}
                tagsStyles={{
                  body: { color: colors.text, fontSize: 16, lineHeight: 24 },
                  h1: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginVertical: 12 },
                  h2: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
                  h3: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
                  p: { color: colors.text, marginVertical: 8, lineHeight: 24 },
                  a: { color: colors.primary, textDecorationLine: 'underline' },
                  strong: { fontWeight: 'bold', color: colors.text },
                  em: { fontStyle: 'italic' },
                  ul: { marginVertical: 8 },
                  ol: { marginVertical: 8 },
                  li: { marginVertical: 4, color: colors.text },
                  blockquote: { 
                    borderLeftWidth: 4, 
                    borderLeftColor: colors.primary, 
                    paddingLeft: 12, 
                    fontStyle: 'italic',
                    color: colors.mediumGray 
                  },
                  code: { 
                    backgroundColor: colors.lightGray, 
                    color: colors.error,
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                    fontFamily: 'monospace'
                  },
                  pre: { 
                    backgroundColor: '#1a1a1a', 
                    padding: 12, 
                    borderRadius: 8,
                    overflow: 'scroll'
                  }
                }}
              />
            )}

            {/* Featured Badge */}
            {(blog.isFeatured || blog.is_featured) && (
              <View style={styles.featuredBadgeContainer}>
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={16} color={colors.warning} />
                  <Text style={styles.featuredBadgeText}>Featured Post</Text>
                </View>
              </View>
            )}
          </View>

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backToListButton}
            onPress={() => router.back()}
          >
            <View style={styles.backToListGradient}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
              <Text style={styles.backToListText}>Back to All Blogs</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.mediumGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: colors.primary,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  categoryBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  blogTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
    lineHeight: 34,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contentContainer: {
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featuredImage: {
    width: '100%',
    height: 250,
  },
  contentCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featuredBadgeContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  featuredBadgeText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  backToListButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  backToListGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  backToListText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  authorAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  authorBio: {
    fontSize: 13,
    color: colors.mediumGray,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 28,
    color: colors.text,
    marginBottom: 30,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  publishedText: {
    fontSize: 13,
    color: colors.mediumGray,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BlogDetail;
