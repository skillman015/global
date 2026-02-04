// ============================================================
// Проверка авторизации при загрузке страницы
// ============================================================
;(function checkAuth() {
  const token = localStorage.getItem('access_token')

  // Проверяем, есть ли токен и не на странице входа
  const isLoginPage = window.location.pathname.endsWith('index.html')

  if (!token && !isLoginPage) {
    // Редирект на страницу входа
    window.location.href = '../index.html'
  }
})()

// ============================================================
// Обновление access_token по refresh_token
// ============================================================
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token')

  // Если нет refresh_token — редирект на вход (только если не на странице входа)
  const isLoginPage = window.location.pathname.endsWith('index.html')
  if (!refreshToken) {
    if (!isLoginPage) {
      window.location.href = '../index.html'
    }
    return null
  }

  try {
    const response = await fetch('https://globalcapital.kz/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    const data = await response.json()

    if (!response.ok || !data.access) {
      throw new Error('Не удалось обновить токен')
    }

    localStorage.setItem('access_token', data.access)
    return data.access
  } catch (error) {
    console.error('Ошибка обновления токена:', error)

    if (!isLoginPage) {
      window.location.href = '../index.html'
    }
    return null
  }
}

// ============================================================
// fetch с авторизацией и автообновлением токена
// ============================================================
async function authorizedFetch(url, options = {}, retry = true) {
  let token = localStorage.getItem('access_token')

  // Если токена нет, редирект (только если не на странице входа)
  const isLoginPage = window.location.pathname.endsWith('index.html')
  if (!token) {
    if (!isLoginPage) {
      window.location.href = '../index.html'
    }
    return
  }

  // Добавляем Authorization
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  let response = await fetch(url, options)

  // Если 401 Unauthorized — пробуем обновить токен один раз
  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken()
    if (!newToken) return

    options.headers.Authorization = `Bearer ${newToken}`
    response = await fetch(url, options)
  }

  return response
}