import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

// Optimization API
export const optimizeAPI = {
  submit: (text, mode = 'combined') =>
    api.post('/optimize', { text, mode }),

  upload: (file, mode = 'combined') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)
    return api.post('/optimize/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getStatus: (id) =>
    api.get(`/optimize/${id}`),

  getDetail: (id) =>
    api.get(`/optimize/${id}/detail`),

  getSegments: (id) =>
    api.get(`/optimize/${id}/segments`),

  getChanges: (id) =>
    api.get(`/optimize/${id}/changes`),

  getProgress: (id) =>
    api.get(`/optimize/${id}/progress`),

  stop: (id) =>
    api.post(`/optimize/${id}/stop`),

  retry: (id) =>
    api.post(`/optimize/${id}/retry`),

  export: (id) =>
    api.post(`/optimize/${id}/export`),

  getStreamUrl: (id) =>
    `/api/optimize/${id}/stream`,
}

// History API
export const historyAPI = {
  getList: (limit = 50, offset = 0) => 
    api.get('/history', { params: { limit, offset } }),
  
  getItem: (id) => 
    api.get(`/history/${id}`),
  
  deleteItem: (id) => 
    api.delete(`/history/${id}`),
}

// Config API
export const configAPI = {
  get: () => 
    api.get('/config'),
  
  update: (data) => 
    api.put('/config', data),
  
  testConnection: () => 
    api.post('/config/test'),
}

// Tools API
export const toolsAPI = {
  convertToLatex: (text, template = null, language = 'zh') =>
    api.post('/tools/latex-convert', { text, template, language }),

  generateMermaid: (description, diagramType = 'auto', language = 'zh') =>
    api.post('/tools/mermaid-generate', { description, diagram_type: diagramType, language }),
}

// Health check
export const healthAPI = {
  check: () => 
    api.get('/health'),
}

export default api
