import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { completeTask, createTask, deleteTask, getMyTasks, updateTask } from '../lib/api';

const { width } = Dimensions.get('window');

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-1462312256770219/6874861381';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const CATEGORIES = ['PERSONAL', 'GROUP', 'WORK', 'EXAM', 'ACADEMIC', 'PORTFOLIO', 'RESEARCH'];

const TaskManager = () => {
  const { colors } = useTheme();
  const bannerRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [category, setCategory] = useState('PERSONAL');
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [estimatedTime, setEstimatedTime] = useState('');
  const [tags, setTags] = useState('');
  
  const styles = createStyles(colors);

  // iOS: Reload banner when app comes to foreground
  useForeground(() => {
    if (Platform.OS === 'ios' && bannerRef.current) {
      bannerRef.current.load();
    }
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getMyTasks();
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', error.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'MEDIUM');
      setStatus(task.status || 'PENDING');
      setCategory(task.category || 'PERSONAL');
      setDueDate(task.dueDate || '');
      if (task.dueDate) {
        setSelectedDate(new Date(task.dueDate));
      }
      setEstimatedTime(task.estimatedTime || '');
      setTags(task.tags?.join(', ') || '');
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setStatus('PENDING');
    setCategory('PERSONAL');
    setDueDate('');
    setSelectedDate(new Date());
    setShowDatePicker(false);
    setEstimatedTime('');
    setTags('');
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setDueDate(formattedDate);
    }
  };

  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        category,
        dueDate: dueDate || null,
        estimatedTime: estimatedTime.trim() || null,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
      };

      if (editingTask) {
        const response = await updateTask(editingTask.id, taskData);
        if (response.success) {
          Alert.alert('Success', 'Task updated successfully');
          fetchTasks();
        }
      } else {
        const response = await createTask(taskData);
        if (response.success) {
          Alert.alert('Success', 'Task created successfully');
          fetchTasks();
        }
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', error.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteTask(taskId);
              if (response.success) {
                Alert.alert('Success', 'Task deleted successfully');
                fetchTasks();
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', error.message || 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await completeTask(taskId);
      if (response.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', error.message || 'Failed to complete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return colors.error;
      case 'MEDIUM': return colors.warning;
      case 'LOW': return colors.success;
      default: return colors.mediumGray;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return colors.success;
      case 'IN_PROGRESS': return colors.primary;
      case 'TODO': return colors.mediumGray;
      default: return colors.mediumGray;
    }
  };

  const filteredTasks = filterStatus === 'ALL' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Task Manager</Text>
          <Text style={[styles.headerSubtitle, { color: colors.mediumGray }]}>Organize your daily tasks</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => openModal()}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              { backgroundColor: colors.lightGray },
              filterStatus === filter && [styles.filterTabActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => setFilterStatus(filter)}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.text },
                filterStatus === filter && [styles.filterTextActive, { color: colors.white }],
              ]}
            >
              {filter.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTask = (task) => (
    <View key={task.id} style={[styles.taskCard, { backgroundColor: colors.card }]}>
      <View style={styles.taskHeader}>
        <View style={styles.taskHeaderLeft}>
          <TouchableOpacity
            onPress={() => handleCompleteTask(task.id)}
            style={[
              styles.checkbox,
              task.status === 'COMPLETED' && { backgroundColor: colors.success },
            ]}
          >
            {task.status === 'COMPLETED' && (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            )}
          </TouchableOpacity>
          <View style={styles.taskTitleContainer}>
            <Text
              style={[
                styles.taskTitle,
                { color: colors.text },
                task.status === 'COMPLETED' && styles.taskTitleCompleted,
              ]}
            >
              {task.title}
            </Text>
            {task.category && (
              <View style={[styles.categoryBadge, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {task.category}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity onPress={() => openModal(task)} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteTask(task.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {task.description && (
        <Text style={[styles.taskDescription, { color: colors.textSecondary }]}>
          {task.description}
        </Text>
      )}

      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          {task.priority && (
            <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(task.priority)}20` }]}>
              <Ionicons name="flag" size={12} color={getPriorityColor(task.priority)} />
              <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                {task.priority}
              </Text>
            </View>
          )}
          {task.dueDate && (
            <View style={styles.dueDateContainer}>
              <Ionicons name="calendar-outline" size={12} color={colors.mediumGray} />
              <Text style={[styles.dueDate, { color: colors.mediumGray }]}>
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}
          {task.estimatedTime && (
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={12} color={colors.mediumGray} />
              <Text style={[styles.timeText, { color: colors.mediumGray }]}>
                {task.estimatedTime}
              </Text>
            </View>
          )}
        </View>
        {task.status && (
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(task.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
              {task.status.replace('_', ' ')}
            </Text>
          </View>
        )}
      </View>

      {task.tags && task.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {task.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.lightGray }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderTaskModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTask ? 'Edit Task' : 'New Task'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

          <ScrollView 
            style={styles.modalBody} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalBodyContent}
          >
            <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={colors.mediumGray}
            />

            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor={colors.mediumGray}
              multiline
              numberOfLines={4}
            />

            <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
            <View style={styles.optionsRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.optionButton,
                    { borderColor: colors.border },
                    priority === p && { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.text },
                      priority === p && { color: colors.white },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
            <View style={styles.optionsRow}>
              {STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.optionButton,
                    { borderColor: colors.border },
                    status === s && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.text },
                      status === s && { color: colors.white },
                    ]}
                  >
                    {s.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <View style={styles.optionsRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.categoryOption,
                    { borderColor: colors.border },
                    category === c && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.text },
                      category === c && { color: colors.white },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Due Date</Text>
            <TouchableOpacity
              style={[styles.datePickerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.datePickerText, { color: dueDate ? colors.text : colors.mediumGray }]}>
                {dueDate || 'Select due date'}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={[styles.label, { color: colors.text }]}>Estimated Time</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={estimatedTime}
              onChangeText={setEstimatedTime}
              placeholder="e.g., 2 hours"
              placeholderTextColor={colors.mediumGray}
            />

            <Text style={[styles.label, { color: colors.text }]}>Tags (comma separated)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={tags}
              onChangeText={setTags}
              placeholder="work, urgent, meeting"
              placeholderTextColor={colors.mediumGray}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveTask}
            >
              <Text style={styles.saveButtonText}>Save Task</Text>
            </TouchableOpacity>
          </View>
          </View>
        </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {renderHeader()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading tasks...</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkbox-outline" size={64} color={colors.mediumGray} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No tasks found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {filterStatus === 'ALL' 
                ? 'Tap the + button to create your first task'
                : `No ${filterStatus.toLowerCase().replace('_', ' ')} tasks`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {filteredTasks.map(renderTask)}
          </View>
        )}

        <View style={styles.adWrapper}>
          <View style={styles.adContainer}>
            <View style={styles.adLabelContainer}>
              <Ionicons name="megaphone-outline" size={12} color={colors.mediumGray} />
              <Text style={[styles.adLabel, { color: colors.mediumGray }]}>Sponsored</Text>
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
      </ScrollView>

      {renderTaskModal()}
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterTabActive: {
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
  },
  content: {
    flex: 1,
  },
  tasksList: {
    padding: 20,
  },
  taskCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderColor: "black",
    borderWidth: 1, 
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  adWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  },
  adLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  adLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  adBannerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  // Modal styles
  modalSafeArea: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text || '#000000',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background || colors.white || '#F9FAFB',
  },
  modalBodyContent: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  datePickerText: {
    fontSize: 16,
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border || '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border || '#E5E7EB',
    alignItems: 'center',
    backgroundColor: colors.white || '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text || '#374151',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary || '#3B82F6',
    shadowColor: colors.primary || '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: colors.white || '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskManager;
