/* API Configuration */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://quizpulseai-backend.onrender.com/api';

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('quizpulse_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('quizpulse_token', token);
  }

  getHeaders(includeJsonContentType = true) {
    return {
      ...(includeJsonContentType && { 'Content-Type': 'application/json' }),
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  async request(endpoint, options = {}) {
    try {
      const isFormData = options.body instanceof FormData;
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(!isFormData),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  // Auth Endpoints
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  // Quiz Endpoints
  async generateQuiz(quizConfig) {
    const formattedConfig = {
      ...quizConfig,
      questionTypes: {
        multipleChoice: quizConfig.questionTypes?.multipleChoice ?? true,
        trueFalse: quizConfig.questionTypes?.trueFalse ?? true,
        shortAnswer: quizConfig.questionTypes?.shortAnswer ?? false,
      },
    };

    return this.request('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify(formattedConfig),
    });
  }

  async getMyQuizzes() {
    return this.request('/quizzes/my-quizzes', { method: 'GET' });
  }

  async getQuiz(quizId) {
    return this.request(`/quizzes/${quizId}`, { method: 'GET' });
  }

  async submitQuizAttempt(quizId, answers, timeSpent) {
    return this.request('/quizzes/submit-attempt', {
      method: 'POST',
      body: JSON.stringify({
        quizId,
        answers,
        timeSpent,
      }),
    });
  }

  async getUserProgress() {
    return this.request('/quizzes/progress/user', { method: 'GET' });
  }

  // Message Endpoints
  async getConversations() {
    return this.request('/messages/conversations', { method: 'GET' });
  }

  async getAdminModerationConversations() {
    return this.request('/messages/admin/conversations', { method: 'GET' });
  }

  async getAdminModerationMessages(conversationId, limit = 200, skip = 0) {
    return this.request(
      `/messages/admin/messages/${conversationId}?limit=${limit}&skip=${skip}`,
      { method: 'GET' }
    );
  }

  async getOrCreateConversation(userId) {
    return this.request(`/messages/conversations/${userId}`, {
      method: 'POST',
    });
  }

  async getMessages(conversationId, limit = 50, skip = 0) {
    return this.request(
      `/messages/messages/${conversationId}?limit=${limit}&skip=${skip}`,
      { method: 'GET' }
    );
  }

  async sendMessage(conversationId, receiverId, content, files = []) {
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('receiverId', receiverId);
    formData.append('content', content);

    files.forEach((file) => {
      formData.append('attachments', file);
    });

    return this.request('/messages/send', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async markMessageAsRead(messageId) {
    return this.request(`/messages/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  async searchUsers(query) {
    const normalizedQuery = encodeURIComponent(String(query || '').trim());
    return this.request(`/messages/search/users?query=${normalizedQuery}`, {
      method: 'GET',
    });
  }

  async getBlockStatus(userId) {
    return this.request(`/messages/users/${userId}/block-status`, {
      method: 'GET',
    });
  }

  async blockUser(userId) {
    return this.request(`/messages/users/${userId}/block`, {
      method: 'POST',
    });
  }

  async unblockUser(userId) {
    return this.request(`/messages/users/${userId}/unblock`, {
      method: 'POST',
    });
  }

  // User Endpoints
  async getProfile() {
    return this.request('/users/profile', { method: 'GET' });
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadProfileAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request('/users/profile/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async getSingleUser(userId) {
    return this.request(`/users/${userId}`, { method: 'GET' });
  }

  // Admin Endpoints
  async getAllUsers(page = 1, limit = 10) {
    return this.request(`/users/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  async getAdminStats() {
    return this.request('/users/admin/stats', { method: 'GET' });
  }

  async getAdminStudentsOverview() {
    return this.request('/users/admin/students-overview', { method: 'GET' });
  }

  async suspendStudent(studentId) {
    return this.request(`/users/admin/students/${studentId}/suspend`, {
      method: 'POST',
    });
  }

  async unsuspendStudent(studentId) {
    return this.request(`/users/admin/students/${studentId}/unsuspend`, {
      method: 'POST',
    });
  }

  // Resource Endpoints
  async getResources(query = '') {
    const normalizedQuery = encodeURIComponent(String(query || '').trim());
    const queryPart = normalizedQuery ? `?query=${normalizedQuery}` : '';
    return this.request(`/resources${queryPart}`, { method: 'GET' });
  }

  async uploadResource({ file, title, description = '', subject = '', classLevel = '' }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file?.name || 'Untitled resource');
    formData.append('description', description);
    formData.append('subject', subject);
    formData.append('classLevel', classLevel);

    return this.request('/resources/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }
}

export const apiClient = new APIClient(API_BASE_URL);

// Health Check
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
