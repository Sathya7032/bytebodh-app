import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://backend.bytebodh.in';

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-1462312256770219/6874861381';

const blogs = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [blogsData, setBlogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bannerRef = useRef(null);
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Fetch blogs from API
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/blogs`);
      const blogsData = response.data.data || response.data || [];
      setBlogsData(blogsData);
      console.log('✅ Blogs loaded:', blogsData.length);
    } catch (err) {
      console.error('❌ Failed to fetch blogs:', err);
      setError('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to extract data
  const getFeaturedImage = (blog) => {
    return blog.featured_image || blog.imageUrl || null;
  };

  const getCategoryName = (blog) => {
    if (blog.category?.name) return blog.category.name;
    if (blog.category) return typeof blog.category === 'string' ? blog.category : 'Technology';
    return 'Technology';
  };

  const getAuthorName = (blog) => {
    return blog.author || blog.author_name || 'ByteBodh Team';
  };

  const getPublishedDate = (blog) => {
    if (blog.createdAt) return new Date(blog.createdAt).toLocaleDateString();
    if (blog.published_date) return new Date(blog.published_date).toLocaleDateString();
    if (blog.createdTime) return new Date(blog.createdTime).toLocaleDateString();
    return 'Recent';
  };

  const getReadTime = (blog) => {
    return blog.readTime || blog.read_time || '5 min read';
  };

  const getExcerpt = (blog) => {
    if (blog.description) return blog.description.replace(/<[^>]*>/g, '').substring(0, 150);
    if (blog.excerpt) return blog.excerpt.replace(/<[^>]*>/g, '').substring(0, 150);
    if (blog.content) return blog.content.replace(/<[^>]*>/g, '').substring(0, 150);
    return 'No description available.';
  };

  const categories = useMemo(() => ['All', 'Technology', 'Education', 'Career', 'Business', 'Tutorial'], []);

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogsData.filter((blog) => {
      const matchesSearch =
        blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getExcerpt(blog).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getAuthorName(blog).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        getCategoryName(blog) === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [blogsData, searchQuery, selectedCategory]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Blog & Articles</Text>
      {loading ? (
        <Text style={styles.headerSubtitle}>Loading articles...</Text>
      ) : error ? (
        <TouchableOpacity onPress={fetchBlogs}>
          <Text style={styles.headerSubtitle}>Tap to retry</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.headerSubtitle}>
          {blogsData.length} articles to explore
        </Text>
      )}

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.mediumGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles, topics..."
          placeholderTextColor={colors.mediumGray}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>
    </View>
  ), [styles, loading, error, blogsData.length, colors, searchQuery, handleSearchChange]);

  const renderCategories = useCallback(() => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ), [styles, categories, selectedCategory]);

  const renderFeaturedBlog = useCallback(({ item }) => {
    const featuredImage = getFeaturedImage(item);

    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => router.push(`/blog-detail?slug=${item.slug || item.id || item._id}`)}
        activeOpacity={0.7}
      >
        {featuredImage ? (
          <Image
            source={{ uri: featuredImage }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient colors={colors.gradient} style={styles.featuredGradient} />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredOverlay}
        >
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>

          <Text style={styles.featuredTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.featuredExcerpt} numberOfLines={2}>
            {getExcerpt(item)}
          </Text>

          <View style={styles.featuredFooter}>
            <View style={styles.authorSection}>
              <Text style={styles.authorAvatar}>👤</Text>
              <Text style={styles.authorName}>{getAuthorName(item)}</Text>
            </View>
            <View style={styles.metaSection}>
              <Ionicons name="time-outline" size={14} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.metaText}>{getReadTime(item)}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [styles, colors, router]);

  const renderBlogCard = useCallback(({ item }) => {
    if (item.isFeatured || item.is_featured) return null;

    return (
      <TouchableOpacity
        style={styles.blogCard}
        onPress={() => router.push(`/blog-detail?slug=${item.slug || item.id || item._id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.blogContent}>
          <View style={[styles.categoryBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
              {getCategoryName(item)}
            </Text>
          </View>

          <Text style={styles.blogTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.blogExcerpt} numberOfLines={2}>
            {getExcerpt(item)}
          </Text>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.background }]}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.blogFooter}>
            <View style={styles.authorInfo}>
              <Text style={styles.cardAuthorAvatar}>👤</Text>
              <View>
                <Text style={styles.cardAuthorName}>{getAuthorName(item)}</Text>
                <Text style={styles.publishedDate}>{getPublishedDate(item)}</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              {item.views && (
                <View style={styles.statItem}>
                  <Ionicons name="eye-outline" size={14} color={colors.mediumGray} />
                  <Text style={styles.statText}>{item.views}</Text>
                </View>
              )}
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color={colors.mediumGray} />
                <Text style={styles.statText}>{getReadTime(item)}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [styles, colors, router]);

  const featuredBlogs = useMemo(() => 
    filteredBlogs.filter(blog => blog.isFeatured || blog.is_featured),
    [filteredBlogs]
  );
  
  const regularBlogs = useMemo(() => 
    filteredBlogs.filter(blog => !(blog.isFeatured || blog.is_featured)),
    [filteredBlogs]
  );

  const ListHeader = useMemo(() => (
    <>
      {renderHeader()}
      {renderCategories()}
      {featuredBlogs.length > 0 && (
        <View style={styles.featuredSection}>
          <FlatList
            data={featuredBlogs}
            renderItem={renderFeaturedBlog}
            keyExtractor={(item) => (item.id || item._id || item.slug).toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>
      )}
      {regularBlogs.length > 0 && (
        <Text style={styles.sectionTitle}>Latest Articles</Text>
      )}
    </>
  ), [renderHeader, renderCategories, featuredBlogs, regularBlogs, styles, renderFeaturedBlog]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading blogs...</Text>
          </View>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          {renderHeader()}
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchBlogs}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={regularBlogs}
          renderItem={renderBlogCard}
          keyExtractor={(item) => (item.id || item._id || item.slug).toString()}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.mediumGray} />
              <Text style={styles.emptyText}>No articles found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or category</Text>
            </View>
          )}
        />
      )}

    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  adWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.lightGray,
  },
  adContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  adLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  adLabel: {
    fontSize: 10,
    color: colors.mediumGray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adBannerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  categoriesContainer: {
    paddingVertical: 15,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.white,
  },
  featuredSection: {
    marginBottom: 20,
  },
  featuredList: {
    paddingHorizontal: 15,
  },
  featuredCard: {
    width: width * 0.85,
    marginHorizontal: 5,
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
    height: 200,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredGradient: {
    padding: 20,
    minHeight: 200,
  },
  featuredOverlay: {
    padding: 20,
    minHeight: 200,
    justifyContent: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
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
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
    marginBottom: 15,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
  },
  featuredExcerpt: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    fontSize: 24,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  blogCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  blogContent: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  blogExcerpt: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardAuthorAvatar: {
    fontSize: 20,
  },
  cardAuthorName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  publishedDate: {
    fontSize: 11,
    color: colors.mediumGray,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mediumGray,
    marginTop: 8,
  },
});

export default blogs;
