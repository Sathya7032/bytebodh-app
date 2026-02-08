import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomDrawer from '../../components/CustomDrawer';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-1462312256770219/6874861381';

const jobs = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [experienceRange, setExperienceRange] = useState([0, 10]);
  const bannerRef = useRef(null);
  
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('https://backend.bytebodh.in/api/job-notifications');
      const jobs = response.data.data || response.data || [];
      setJobsData(jobs);
      console.log('✅ Jobs loaded:', jobs);
    } catch (err) {
      console.error('❌ Failed to fetch jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await axios.get('https://backend.bytebodh.in/api/job-notifications');
      const jobs = response.data.data || response.data || [];
      setJobsData(jobs);
      console.log('✅ Jobs refreshed:', jobs);
    } catch (err) {
      console.error('❌ Failed to refresh jobs:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Get unique values for filters - memoized to prevent unnecessary re-renders
  const employmentTypes = useMemo(() => 
    ['All', ...new Set(jobsData.map(job => job.employmentType).filter(Boolean))],
    [jobsData]
  );
  
  const locations = useMemo(() => 
    ['All', ...new Set(jobsData.map(job => job.location).filter(Boolean))],
    [jobsData]
  );
  
  const statusFilters = useMemo(() => ['All', 'Active', 'Expired'], []);
  
  const experienceFilters = useMemo(() => [
    { label: 'All', value: 'All', range: null },
    { label: 'Fresher (0 Yrs)', value: 'Fresher', range: [0, 0] },
    { label: 'Junior (0-2 Yrs)', value: 'Junior', range: [0, 2] },
    { label: 'Mid-Level (2-5 Yrs)', value: 'Mid-Level', range: [2, 5] },
    { label: 'Senior (5-10 Yrs)', value: 'Senior', range: [5, 10] },
    { label: 'Expert (10+ Yrs)', value: 'Expert', range: [10, 100] },
  ], []);

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const filteredJobs = useMemo(() => {
    return jobsData.filter((job) => {
      const matchesSearch =
        (job.jobTitle || job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.companyName || job.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEmploymentType =
        selectedEmploymentType === 'All' ||
        (job.employmentType || job.type || '') === selectedEmploymentType;

      const matchesLocation =
        selectedLocation === 'All' ||
        (job.location || '') === selectedLocation;

      const isJobActive = job.isActive && (!job.applicationDeadline || new Date(job.applicationDeadline) > new Date());
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && isJobActive) ||
        (selectedStatus === 'Expired' && !isJobActive);

      const matchesExperience = (() => {
        if (selectedExperience === 'All') return true;
        const expFilter = experienceFilters.find(f => f.value === selectedExperience);
        if (!expFilter || !expFilter.range) return true;
        const jobExp = job.experienceRequired !== undefined ? job.experienceRequired : -1;
        if (jobExp < 0) return false; // Exclude jobs without experience data
        const [min, max] = expFilter.range;
        return jobExp >= min && jobExp <= max;
      })();

      return matchesSearch && matchesEmploymentType && matchesLocation && matchesStatus && matchesExperience;
    });
  }, [jobsData, searchQuery, selectedEmploymentType, selectedLocation, selectedStatus, selectedExperience, experienceFilters]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Job Opportunities</Text>
          <Text style={styles.headerSubtitle}>
            {filteredJobs.length} {filteredJobs.length === jobsData.length ? 'positions available' : `of ${jobsData.length} positions`}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
          >
            <Ionicons name="menu-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.mediumGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, companies..."
            placeholderTextColor={colors.mediumGray}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.mediumGray} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterIconButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color={colors.primary} />
          {(selectedEmploymentType !== 'All' || selectedLocation !== 'All' || selectedStatus !== 'All' || selectedExperience !== 'All') && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  ), [styles, filteredJobs.length, jobsData.length, colors, router, searchQuery, handleSearchChange, selectedEmploymentType, selectedLocation, selectedStatus, selectedExperience]);

  const renderFilterModal = useCallback(() => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContent} edges={['bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {/* Employment Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Employment Type</Text>
              <View style={styles.filterChipsContainer}>
                {employmentTypes.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedEmploymentType === filter && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedEmploymentType(filter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedEmploymentType === filter && styles.filterChipTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Location</Text>
              <View style={styles.filterChipsContainer}>
                {locations.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedLocation === filter && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedLocation(filter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedLocation === filter && styles.filterChipTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterChipsContainer}>
                {statusFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedStatus === filter && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedStatus(filter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedStatus === filter && styles.filterChipTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Slider */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Experience Level</Text>
              <View style={styles.sliderSection}>
                <View style={styles.sliderLabelRow}>
                  <Text style={styles.sliderLabel}>
                    {experienceRange[0] === 0 ? 'Fresher' : `${experienceRange[0]} Years`}
                  </Text>
                  <Text style={styles.sliderLabel}>
                    {experienceRange[1] >= 10 ? '10+ Years' : `${experienceRange[1]} Years`}
                  </Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  value={experienceRange[1]}
                  onValueChange={(value) => {
                    setExperienceRange([experienceRange[0], value]);
                    // Auto-select matching experience filter
                    const matchingFilter = experienceFilters.find(f => {
                      if (!f.range) return false;
                      return value >= f.range[0] && value <= f.range[1];
                    });
                    if (matchingFilter) {
                      setSelectedExperience(matchingFilter.value);
                    } else if (value === 0) {
                      setSelectedExperience('Fresher');
                    } else {
                      setSelectedExperience('All');
                    }
                  }}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.lightGray}
                  thumbTintColor={colors.primary}
                />
                <View style={styles.experienceChipsContainer}>
                  {experienceFilters.map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      style={[
                        styles.filterChip,
                        selectedExperience === filter.value && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setSelectedExperience(filter.value);
                        if (filter.range) {
                          setExperienceRange(filter.range);
                        } else if (filter.value === 'All') {
                          setExperienceRange([0, 10]);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedExperience === filter.value && styles.filterChipTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedEmploymentType('All');
                setSelectedLocation('All');
                setSelectedStatus('All');
                setSelectedExperience('All');
                setExperienceRange([0, 10]);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  ), [
    filterModalVisible,
    styles,
    colors,
    employmentTypes,
    selectedEmploymentType,
    locations,
    selectedLocation,
    statusFilters,
    selectedStatus,
    experienceFilters,
    selectedExperience,
    experienceRange
  ]);

  const renderFilters = useCallback(() => null, []);

  const renderJobCard = useCallback(({ item }) => {
    const title = item.jobTitle || item.title || 'Job Title';
    const company = item.companyName || item.company || 'Company';
    const location = item.location || 'Location TBD';
    const employmentType = item.employmentType || item.type || 'Full-time';
    const deadline = item.applicationDeadline ? new Date(item.applicationDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;
    const isNew = item.isNew || (item.applicationDeadline && new Date(item.applicationDeadline) > new Date());

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => router.push(`/job-detail?id=${item.id}`)}
        activeOpacity={0.7}
      >
        {item.isFeatured && (
          <View style={[styles.featuredBadge, { backgroundColor: colors.warning }]}>
            <Ionicons name="star" size={12} color={colors.white} />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}

        <View style={styles.jobHeader}>
          <View style={[styles.companyLogo, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="briefcase" size={24} color={colors.primary} />
          </View>

          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.companyName}>{company}</Text>
          </View>

          {isNew && (
            <View style={[styles.newBadge, { backgroundColor: colors.success }]}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color={colors.mediumGray} />
            <Text style={styles.detailText}>{location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.mediumGray} />
            <Text style={styles.detailText}>{employmentType}</Text>
          </View>
          {item.experienceRequired !== undefined && (
            <View style={styles.detailItem}>
              <Ionicons name="school-outline" size={14} color={colors.mediumGray} />
              <Text style={styles.detailText}>
                {item.experienceRequired === 0 ? 'Fresher' : `${item.experienceRequired}+ Yrs`}
              </Text>
            </View>
          )}
          {deadline && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.mediumGray} />
              <Text style={styles.detailText}>Due: {deadline}</Text>
            </View>
          )}
        </View>

        {item.skills && item.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            {item.skills.slice(0, 3).map((skill, index) => (
              <View key={index} style={[styles.skillBadge, { backgroundColor: colors.background }]}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {item.skills.length > 3 && (
              <Text style={styles.moreSkills}>+{item.skills.length - 3} more</Text>
            )}
          </View>
        )}

        <View style={styles.jobFooter}>
          {item.salary && (
            <Text style={[styles.salary, { color: colors.primary }]}>
              {item.salary}
            </Text>
          )}
          {item.applicants !== undefined && (
            <View style={styles.footerRight}>
              <Ionicons name="people-outline" size={14} color={colors.mediumGray} />
              <Text style={styles.applicants}>{item.applicants} applicants</Text>
              {item.postedDate && <Text style={styles.postedDate}> • {item.postedDate}</Text>}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [styles, colors, router]);

  const ListHeader = useMemo(() => (
    <>
      {renderHeader()}
      {renderFilters()}
    </>
  ), [renderHeader, renderFilters]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading jobs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchJobs}
          >
            <Ionicons name="refresh" size={20} color={colors.white} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
      {renderFilterModal()}
      <FlatList
        data={filteredJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.white}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color={colors.mediumGray} />
            <Text style={styles.emptyText}>No jobs found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.adWrapper}>
            <View style={styles.adContainer}>
              <View style={styles.adLabelContainer}>
                <Ionicons name="megaphone-outline" size={12} color={colors.mediumGray} />
                <Text style={styles.adLabel}>Sponsored</Text>
              </View>
              <View style={styles.adBannerContainer}>
                <BannerAd
                  ref={bannerRef}
                  unitId={adUnitId}
                  size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                />
              </View>
            </View>
          </View>
        )}
      />
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
    backgroundColor: colors.white,
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
    paddingBottom: 15,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  searchContainer: {
    flex: 0.9,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterIconButton: {
    flex: 0.2,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalScrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  sliderSection: {
    paddingVertical: 10,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: colors.mediumGray,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  experienceChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  filtersWrapper: {
    backgroundColor: colors.background,
    paddingBottom: 10,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mediumGray,
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filtersContainer: {
    paddingVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.white,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  jobCard: {
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
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: colors.mediumGray,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 12,
    color: colors.mediumGray,
    fontWeight: '500',
    paddingVertical: 6,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  salary: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applicants: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  postedDate: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default jobs;
