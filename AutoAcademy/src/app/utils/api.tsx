import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a96c109b`;

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`;
};

export const api = {
  // Courses
  getCourses: async () => {
    const response = await fetch(`${API_BASE}/courses`, {
      headers: { 'Authorization': getAuthHeader() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.courses;
  },

  createCourse: async (courseData: any) => {
    const response = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify(courseData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.course;
  },

  updateCourse: async (id: number, courseData: any) => {
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify(courseData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.course;
  },

  deleteCourse: async (id: number) => {
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': getAuthHeader() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Packages
  getPackages: async () => {
    const response = await fetch(`${API_BASE}/packages`, {
      headers: { 'Authorization': getAuthHeader() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.packages;
  },

  // Subscriptions
  getMySubscription: async () => {
    const response = await fetch(`${API_BASE}/subscriptions/me`, {
      headers: { 'Authorization': getAuthHeader() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.subscription;
  },

  createSubscription: async (package_id: number) => {
    const response = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({ package_id }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.subscription;
  },

  // Contact
  submitContact: async (contactData: { name: string; email: string; message: string }) => {
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(contactData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  getContactMessages: async () => {
    const response = await fetch(`${API_BASE}/contact`, {
      headers: { 'Authorization': getAuthHeader() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.messages;
  },

  // Admin - Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': getAuthHeader() },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.users;
  },
};
