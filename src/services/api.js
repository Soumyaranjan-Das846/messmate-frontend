
const API_BASE_URL = `${(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')}/api`;

// Common API request helper
async function apiFetch(endpoint, options = {}) {
  const path = endpoint.startsWith('/api/')
    ? endpoint.slice(4)
    : endpoint;

  return fetch(`${API_BASE_URL}${path}`, options);
}

// =====================================
// AUTHENTICATION
// =====================================

// Login for both Admin and Student
export async function loginAdmin(email, password) {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok || !result.success || !result.data?.token) {
    throw new Error(result.message || 'Login failed');
  }

  sessionStorage.setItem('messmate_token', result.data.token);

  return result.data;
}

// NEW: Student and Admin registration
export async function registerUser(userData) {
  const response = await apiFetch('/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: userData.username?.trim(),
      email: userData.email?.trim().toLowerCase(),
      password: userData.password,
      phone: userData.phone?.trim(),
      rollNumber: userData.rollNumber?.trim() || '',
      department: userData.department?.trim() || '',
      hostel: userData.hostel?.trim() || '',
      roomNumber: userData.roomNumber?.trim() || '',
      address: userData.address?.trim() || '',
      role: userData.role === 'admin' ? 'admin' : 'user',
      ...(userData.role === 'admin'
        ? { adminCode: userData.adminCode }
        : {}),
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Registration failed');
  }

  return result.data;
}

// Logout
export function logoutAdmin() {
  sessionStorage.removeItem('messmate_token');
}

export function logoutUser() {
  sessionStorage.removeItem('messmate_token');
}

// Get currently logged-in user from JWT
export function getLoggedInUser() {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) return null;

  try {
    const payload = token.split('.')[1];

    if (!payload) return null;

    const normalized = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const decoded = JSON.parse(atob(normalized));

    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      sessionStorage.removeItem('messmate_token');
      return null;
    }

    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      messId: decoded.messId,
      messusername: decoded.messusername,
    };
  } catch {
    return null;
  }
}

export function getUserRole() {
  return getLoggedInUser()?.role || null;
}

export function getAdminId() {
  return getLoggedInUser()?.id || null;
}

// =====================================
// STUDENT MANAGEMENT
// =====================================

export async function getStudents() {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await apiFetch('/v1/user/getUsers', {
    method: 'GET',
    headers: {
      'x-auth-token': token,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch students');
  }

  return result.data.filter((user) => user.role === 'user');
}

export async function addStudent(studentData) {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await apiFetch('/v1/user/addUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(studentData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to add student');
  }

  return result.data;
}

export async function deleteStudent(studentId) {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  if (!studentId) {
    throw new Error('Student ID is required');
  }

  const response = await apiFetch(
    `/v1/user/removeUser/${encodeURIComponent(studentId)}`,
    {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete student');
  }

  return result.data;
}

export async function updateStudent(studentId, studentData) {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  if (!studentId) {
    throw new Error('Student ID is required');
  }

  const response = await apiFetch(
    `/v1/user/updateStudent/${encodeURIComponent(studentId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(studentData),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update student');
  }

  return result.data;
}

export async function getStudentCount() {
  const students = await getStudents();
  return students.length;
}

// =====================================
// MESS MENU
// =====================================

export async function getWeeklyMenu() {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await apiFetch('/v1/menu/weekly', {
    method: 'GET',
    headers: {
      'x-auth-token': token,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch weekly menu');
  }

  return result.data;
}

export async function addMenu(menuData) {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await apiFetch('/v1/menu/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(menuData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to add menu');
  }

  return result.data;
}

export async function updateMenu(menuId, menuData) {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await apiFetch(
    `/v1/menu/update/${encodeURIComponent(menuId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(menuData),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update menu');
  }

  return result.data;
}

export async function deleteMenu(menuId) {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await apiFetch(
    `/v1/menu/delete/${encodeURIComponent(menuId)}`,
    {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete menu');
  }

  return result.data;
}

// =====================================
// MEAL MANAGEMENT
// =====================================

export async function getMeals() {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch('/v1/meal/currentMeal', {
    headers: {
      'x-auth-token': token,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch meals');
  }

  return result.data || [];
}

export async function addMeal(mealData) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch('/v1/meal/addMeal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(mealData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to add meal');
  }

  return result.data;
}

export async function updateMeal(mealId, mealData) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch(
    `/v1/meal/updateMeal/${encodeURIComponent(mealId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(mealData),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update meal');
  }

  return result.data;
}

export async function deleteMeal(mealId) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch(
    `/v1/meal/deleteMeal/${encodeURIComponent(mealId)}`,
    {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete meal');
  }

  return result;
}

export async function getMonthlyMealCount() {
  const meals = await getMeals();

  return meals.reduce(
    (total, meal) => total + Number(meal.numberOfMeal || 0),
    0
  );
}

// =====================================
// EXPENSE MANAGEMENT
// =====================================

export async function getExpenses() {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch('/v1/expense/messTotalExpense', {
    headers: {
      'x-auth-token': token,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch expenses');
  }

  return {
    expenses: Array.isArray(result.data?.data)
      ? result.data.data
      : [],
    total: Number(result.data?.total || 0),
  };
}

export async function getExpenseCategories() {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch('/v1/category/getCategory', {
    headers: {
      'x-auth-token': token,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch categories');
  }

  return Array.isArray(result.data) ? result.data : [];
}

export async function addExpense(expenseData) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch('/v1/expense/addExpense', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(expenseData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to add expense');
  }

  return result.data;
}

export async function updateExpense(expenseId, expenseData) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch(
    `/v1/expense/updateExpense/${encodeURIComponent(expenseId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(expenseData),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update expense');
  }

  return result.data;
}

export async function deleteExpense(expenseId) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch(
    `/v1/expense/deleteExpense/${encodeURIComponent(expenseId)}`,
    {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete expense');
  }

  return result;
}

// =====================================
// EXPENSE CATEGORIES
// =====================================

export async function addExpenseCategory(categoryData) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch('/v1/category/addCategory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(categoryData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to add category');
  }

  return result.data;
}

export async function updateExpenseCategory(categoryId, categoryData) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch(
    `/v1/category/updateCategory/${encodeURIComponent(categoryId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(categoryData),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update category');
  }

  return result.data;
}

export async function deleteExpenseCategory(categoryId) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch(
    `/v1/category/deleteCategory/${encodeURIComponent(categoryId)}`,
    {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete category');
  }

  return result;
}

// =====================================
// PAYMENT MANAGEMENT
// =====================================

export async function getPayments() {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch('/v1/balance/messTotalBalance', {
    headers: {
      'x-auth-token': token,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch payments');
  }

  return Array.isArray(result.data) ? result.data : [];
}

export async function addPayment(paymentData) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch('/v1/balance/addBalance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(paymentData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to add payment');
  }

  return result.data;
}

export async function updatePayment(paymentId, paymentData) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch(
    `/v1/balance/updateBalance/${encodeURIComponent(paymentId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(paymentData),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update payment');
  }

  return result.data;
}

export async function deletePayment(paymentId) {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch(
    `/v1/balance/deleteBalance/${encodeURIComponent(paymentId)}`,
    {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete payment');
  }

  return result;
}

export async function getAvailableBalance() {
  const token = sessionStorage.getItem('messmate_token');

  const response = await apiFetch(
    '/v1/balance/currentAvailableBalance',
    {
      headers: {
        'x-auth-token': token,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || 'Failed to fetch available balance'
    );
  }

  return Number(result.data || 0);
}

// =====================================
// FEEDBACK MANAGEMENT
// =====================================

const FEEDBACK_API = '/v1/feedback';

async function feedbackRequest(path, options = {}) {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  const response = await apiFetch(`${FEEDBACK_API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
      ...(options.headers || {}),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Feedback request failed');
  }

  return result.data;
}

export async function getAllFeedback() {
  const data = await feedbackRequest('/all');
  return Array.isArray(data) ? data : [];
}

export async function getFeedbackStats() {
  return feedbackRequest('/stats');
}

export async function addFeedback(feedbackData) {
  return feedbackRequest('/add', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
}

export async function updateFeedback(feedbackId, feedbackData) {
  return feedbackRequest(
    `/update/${encodeURIComponent(feedbackId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(feedbackData),
    }
  );
}

export async function deleteFeedback(feedbackId) {
  return feedbackRequest(
    `/delete/${encodeURIComponent(feedbackId)}`,
    { method: 'DELETE' }
  );
}

// =====================================
// STUDENT PORTAL
// =====================================

async function studentRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  const res = await apiFetch(`/v1/student${endpoint}`, {
    ...options,
    headers: {
      'x-auth-token': token,
      ...(options.headers || {}),
    },
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.message || 'Request failed');
  }

  return result.data;
}

export function getStudentDashboard() {
  return studentRequest('/dashboard');
}

export function getMyMeals() {
  return studentRequest('/meals');
}

export function getMyPayments() {
  return studentRequest('/payments');
}

export function getMyComplaints() {
  return studentRequest('/complaints');
}

export async function getMyProfile() {
  const token = sessionStorage.getItem('messmate_token');

  if (!token) {
    throw new Error('Please login first');
  }

  const res = await apiFetch('/v1/user/getProfile', {
    headers: {
      'x-auth-token': token,
    },
  });

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(result.message || 'Failed to load profile');
  }

  return result.data;
}
