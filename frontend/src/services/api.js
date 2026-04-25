// ─────────────────────────────────────────────────────────────────────────────
// AgroGemini — Centralised API service layer
// All requests go through `request()` which attaches the JWT token.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Token management ─────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('agrogemini_token');
}

function setToken(token) {
  localStorage.setItem('agrogemini_token', token);
}

function removeToken() {
  localStorage.removeItem('agrogemini_token');
}

function setUser(user) {
  localStorage.setItem('agrogemini_user', JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('agrogemini_user'));
  } catch {
    return null;
  }
}

function removeUser() {
  localStorage.removeItem('agrogemini_user');
}

// ── Core request helper ──────────────────────────────────────────────────────

async function request(endpoint, { method = 'GET', body, headers: extraHeaders } = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...extraHeaders };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 — auto-logout
  if (res.status === 401) {
    removeToken();
    removeUser();
    window.location.hash = '#login';
    throw { detail: 'Sessão expirada, faça login novamente.' };
  }

  if (!res.ok) {
    let err;
    try { err = await res.json(); } catch { err = { detail: res.statusText }; }
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ── Convenience shortcuts ────────────────────────────────────────────────────

export const api = {
  get:    (ep)          => request(ep),
  post:   (ep, body)    => request(ep, { method: 'POST', body }),
  put:    (ep, body)    => request(ep, { method: 'PUT', body }),
  delete: (ep)          => request(ep, { method: 'DELETE' }),
  upload: (ep, formData) => request(ep, { method: 'POST', body: formData }),
};

function normalizeUserType(value) {
  return String(value || '').trim().toUpperCase();
}

function resolveUserPlan({ plano, plano_ativo: planoAtivo, tipo_usuario: tipoUsuario } = {}) {
  const normalizedPlan = String(plano || planoAtivo || '').toUpperCase();
  const normalizedType = normalizeUserType(tipoUsuario);

  if (normalizedPlan === 'PREMIUM') return 'PREMIUM';
  if (normalizedType === 'UP' || normalizedType === 'ADM') return 'PREMIUM';
  if (normalizedPlan === 'FREE') return 'FREE';
  return 'FREE';
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authService = {
  async login(email, senha) {
    const data = await api.post('/api/v1/auth/login', { email, senha });
    setToken(data.access_token);
    setUser({
      id: data.user_id,
      nome: data.nome,
      sobrenome: data.sobrenome,
      email: data.email,
      tipo_usuario: data.tipo_usuario,
      plano: resolveUserPlan(data),
    });
    return data;
  },

  async register(payload) {
    const data = await api.post('/api/v1/auth/register', payload);
    setToken(data.access_token);
    setUser({
      id: data.user_id,
      nome: data.nome,
      sobrenome: data.sobrenome,
      email: data.email,
      tipo_usuario: data.tipo_usuario,
      plano: resolveUserPlan(data),
    });
    return data;
  },

  async me() {
    return api.get('/api/v1/auth/me');
  },

  async mePlan() {
    return api.get('/api/v1/auth/me/plan');
  },

  logout() {
    removeToken();
    removeUser();
  },

  isAuthenticated() {
    return !!getToken();
  },

  getToken,
  getUser,
};

// ── Usuários ─────────────────────────────────────────────────────────────────

export const usuarioService = {
  getAll:   ()           => api.get('/api/v1/usuarios/'),
  getById:  (id)         => api.get(`/api/v1/usuarios/${id}`),
  create:   (data)       => api.post('/api/v1/usuarios/', data),
  update:   (id, data)   => api.put(`/api/v1/usuarios/${id}`, data),
  delete:   (id)         => api.delete(`/api/v1/usuarios/${id}`),
};

// ── Endereços ────────────────────────────────────────────────────────────────

export const enderecoService = {
  getAll:   ()           => api.get('/api/v1/enderecos/'),
  getById:  (id)         => api.get(`/api/v1/enderecos/${id}`),
  create:   (data)       => api.post('/api/v1/enderecos/', data),
  update:   (id, data)   => api.put(`/api/v1/enderecos/${id}`, data),
  delete:   (id)         => api.delete(`/api/v1/enderecos/${id}`),
};

// ── Laboratórios ─────────────────────────────────────────────────────────────

export const laboratorioService = {
  getAll:       ()           => api.get('/api/v1/laboratorios/'),
  getMyLabs:    ()           => api.get('/api/v1/laboratorios/me'),
  getById:      (id)         => api.get(`/api/v1/laboratorios/${id}`),
  create:       (data)       => api.post('/api/v1/laboratorios/', data),
  update:       (id, data)   => api.put(`/api/v1/laboratorios/${id}`, data),
  delete:       (id)         => api.delete(`/api/v1/laboratorios/${id}`),
  // Employees
  getUsuarios:  (labId)      => api.get(`/api/v1/laboratorios/${labId}/usuarios`),
  addUsuario:   (labId, data)=> api.post(`/api/v1/laboratorios/${labId}/usuarios`, data),
  removeUsuario:(labId, aid) => api.delete(`/api/v1/laboratorios/${labId}/usuarios/${aid}`),
  // Phones
  getTelefones: (labId)      => api.get(`/api/v1/laboratorios/${labId}/telefones`),
};

// ── Fazendas ─────────────────────────────────────────────────────────────────

export const fazendaService = {
  getAll:       ()           => api.get('/api/v1/fazendas/'),
  getById:      (id)         => api.get(`/api/v1/fazendas/${id}`),
  create:       (data)       => api.post('/api/v1/fazendas/', data),
  update:       (id, data)   => api.put(`/api/v1/fazendas/${id}`, data),
  delete:       (id)         => api.delete(`/api/v1/fazendas/${id}`),
  getTalhoes:   (fid)        => api.get(`/api/v1/fazendas/${fid}/talhoes`),
  getUsuarios:  (fid)        => api.get(`/api/v1/fazendas/${fid}/usuarios`),
};

// ── Talhões ──────────────────────────────────────────────────────────────────

export const talhaoService = {
  getAll:   ()           => api.get('/api/v1/talhoes/'),
  getById:  (id)         => api.get(`/api/v1/talhoes/${id}`),
  create:   (data)       => api.post('/api/v1/talhoes/', data),
  update:   (id, data)   => api.put(`/api/v1/talhoes/${id}`, data),
  delete:   (id)         => api.delete(`/api/v1/talhoes/${id}`),
};

// ── Amostras ─────────────────────────────────────────────────────────────────

export const amostraService = {
  getAll:       (labId, limit = 100) => api.get(`/api/v1/amostras/?lab_id=${labId}&limit=${limit}`),
  getById:      (id)                 => api.get(`/api/v1/amostras/${id}`),
  getByCliente: (cid)                => api.get(`/api/v1/amostras/cliente/${cid}`),
  create:       (data)               => api.post('/api/v1/amostras/', data),
  update:       (id, data)           => api.put(`/api/v1/amostras/${id}`, data),
  delete:       (id)                 => api.delete(`/api/v1/amostras/${id}`),
};

// ── Laudos ───────────────────────────────────────────────────────────────────

export const laudoService = {
  getAll:           (labId, limit = 100) => api.get(`/api/v1/laudos/?lab_id=${labId}&limit=${limit}`),
  getById:          (id)                 => api.get(`/api/v1/laudos/${id}`),
  getByCliente:     (cid)                => api.get(`/api/v1/laudos/cliente/${cid}`),
  getByAmostra:     (aid)                => api.get(`/api/v1/laudos/amostra/${aid}`),
  create:           (data)               => api.post('/api/v1/laudos/', data),
  update:           (id, data)           => api.put(`/api/v1/laudos/${id}`, data),
  delete:           (id)                 => api.delete(`/api/v1/laudos/${id}`),
  getResultados:    (lid)                => api.get(`/api/v1/laudos/${lid}/resultados`),
  addResultado:     (lid, data)          => api.post(`/api/v1/laudos/${lid}/resultados`, data),
};

// ── Importações ──────────────────────────────────────────────────────────────

export const importacaoService = {
  getAll:   (labId) => api.get(`/api/v1/importacoes/?lab_id=${labId}`),
  getById:  (id)    => api.get(`/api/v1/importacoes/${id}`),
  create:   (data)  => api.post('/api/v1/importacoes/', data),
  update:   (id, d) => api.put(`/api/v1/importacoes/${id}`, d),
  delete:   (id)    => api.delete(`/api/v1/importacoes/${id}`),
};

// ── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardService = {
  getStats:     (labId) => api.get(`/api/v1/dashboard/stats?lab_id=${labId}`),
  getTrends:    (labId) => api.get(`/api/v1/dashboard/trends?lab_id=${labId}`),
  getDashboard: (labId) => api.get(`/api/v1/dashboard/?lab_id=${labId}`),
};

// ── Fertilizer (existing) ────────────────────────────────────────────────────

export const fertilizerService = {
  preview: (formData) => api.upload('/api/v1/fertilizers/preview', formData),
};

// ── Admin ────────────────────────────────────────────────────────────────────

export const adminService = {
  getDashboard:   () => api.get('/api/v1/admin/dashboard'),
  getUsuarios:    (tipo) => api.get(`/api/v1/admin/usuarios${tipo ? `?tipo=${tipo}` : ''}`),
  getLaboratorios:() => api.get('/api/v1/admin/laboratorios'),
  getProdutores:  () => api.get('/api/v1/admin/produtores'),
};
