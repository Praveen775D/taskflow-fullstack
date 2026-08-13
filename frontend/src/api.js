const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // Keep the friendly fallback message.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getBoard: (id) => request(`/boards/${id}`),
  getStats: (id) => request(`/boards/${id}/stats`),
  createTask: (payload) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateTask: (id, payload) =>
    request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  moveTask: (id, columnId) =>
    request(`/tasks/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify({ columnId })
    }),
  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: "DELETE"
    })
};
