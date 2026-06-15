const BASE = process.env.NEXT_PUBLIC_API_URL || "https://todo-backend-1-eqy9.onrender.com";
const AUTH_URL = `${BASE}/auth`;
const TODOS_URL = `${BASE}/todos`;

// ── Helper ────────────────────────────────────────────────────────────────────
const getHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── API Object ────────────────────────────────────────────────────────────────
export const api = {

  // ── Auth ─────────────────────────────────────────────────────────────────
  /** POST /auth/register — { name, email, password, phone?, avatar? } */
  async register(nameOrPayload, email, password, phone, avatar) {
    const bodyObj = typeof nameOrPayload === "object"
      ? nameOrPayload
      : { name: nameOrPayload, email, password, phone, avatar };
    const res = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyObj),
    });
    return handleResponse(res); // { message, token, user }
  },

  /** POST /auth/login — { email, password } */
  async login(email, password) {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res); // { message, token, user }
  },

  /** GET /auth/profile — requires token */
  async getProfile() {
    const res = await fetch(`${AUTH_URL}/profile`, { headers: getHeaders() });
    return handleResponse(res); // { user }
  },

  /** PUT /auth/profile — { name?, phone?, avatar?, bio? } */
  async updateProfile(updates) {
    const res = await fetch(`${AUTH_URL}/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res); // { message, user }
  },

  /** PUT /auth/change-password — { currentPassword, newPassword } */
  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${AUTH_URL}/change-password`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res); // { message }
  },

  /** GET /auth/users — admin only */
  async getAllUsers() {
    const res = await fetch(`${AUTH_URL}/users`, { headers: getHeaders() });
    return handleResponse(res); // { users, total }
  },

  /** PATCH /auth/users/:id/status — { isActive } — admin only */
  async setUserStatus(id, isActive) {
    const res = await fetch(`${AUTH_URL}/users/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(res); // { message, user }
  },

  // ── Todos ─────────────────────────────────────────────────────────────────
  /** GET /todos */
  async getTodos() {
    const res = await fetch(TODOS_URL, { headers: getHeaders() });
    return handleResponse(res);
  },

  /** POST /todos */
  async createTodo(todoData) {
    const res = await fetch(TODOS_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(todoData),
    });
    return handleResponse(res);
  },

  /** PUT /todos/:id */
  async updateTodo(id, updates) {
    const res = await fetch(`${TODOS_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  /** DELETE /todos/:id */
  async deleteTodo(id) {
    const res = await fetch(`${TODOS_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Collaborations ───────────────────────────────────────────────────────
  /** POST /collaborations/invite — { email, message? } */
  async inviteCollaborator(email, message = "") {
    const res = await fetch(`${BASE}/collaborations/invite`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, message }),
    });
    return handleResponse(res);
  },

  /** GET /collaborations/invitations — pending invitations sent TO me */
  async getMyInvitations() {
    const res = await fetch(`${BASE}/collaborations/invitations`, { headers: getHeaders() });
    return handleResponse(res); // { invitations, count }
  },

  /** GET /collaborations/sent — invitations I sent */
  async getSentInvitations() {
    const res = await fetch(`${BASE}/collaborations/sent`, { headers: getHeaders() });
    return handleResponse(res); // { invitations }
  },

  /** PUT /collaborations/:id/respond — { action: 'accept' | 'reject' } */
  async respondToInvitation(id, action) {
    const res = await fetch(`${BASE}/collaborations/${id}/respond`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ action }),
    });
    return handleResponse(res); // { message, invite }
  },

  /** GET /collaborations/members — active collaborators */
  async getCollaborators() {
    const res = await fetch(`${BASE}/collaborations/members`, { headers: getHeaders() });
    return handleResponse(res); // { members, count }
  },

  /** DELETE /collaborations/:id */
  async removeCollaboration(id) {
    const res = await fetch(`${BASE}/collaborations/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
