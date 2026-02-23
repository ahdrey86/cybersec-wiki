---
sidebar_position: 8
---

import HttpAnalyzer from '@site/src/components/network/HttpAnalyzer';

# HTTP/HTTPS протокол

Протокол передачи гипертекста — основа веб-коммуникаций.

## Интерактивный HTTP анализатор

<HttpAnalyzer />

## Версии HTTP

| Версия | Год | Особенности |
|--------|-----|-------------|
| HTTP/0.9 | 1991 | Только GET, без заголовков |
| HTTP/1.0 | 1996 | Заголовки, методы, коды статуса |
| HTTP/1.1 | 1997 | Keep-alive, chunked, Host |
| HTTP/2 | 2015 | Бинарный, мультиплексирование, сжатие заголовков |
| HTTP/3 | 2022 | QUIC (UDP), 0-RTT |

## Структура HTTP

### Запрос (Request)

```http
GET /api/users/123 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGc...
User-Agent: Mozilla/5.0
```

**Структура:**
1. **Стартовая строка:** `METHOD PATH HTTP/VERSION`
2. **Заголовки:** `Header-Name: value`
3. **Пустая строка**
4. **Тело** (для POST, PUT, PATCH)

### Ответ (Response)

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 82
Cache-Control: max-age=3600

{"id": 123, "name": "John", "email": "john@example.com"}
```

## HTTP методы

| Метод | Назначение | Идемпотентный | Безопасный | Тело |
|-------|------------|---------------|------------|------|
| **GET** | Получить ресурс | ✅ | ✅ | ❌ |
| **POST** | Создать ресурс | ❌ | ❌ | ✅ |
| **PUT** | Заменить ресурс | ✅ | ❌ | ✅ |
| **PATCH** | Частично обновить | ❌ | ❌ | ✅ |
| **DELETE** | Удалить ресурс | ✅ | ❌ | ❌ |
| **HEAD** | Заголовки без тела | ✅ | ✅ | ❌ |
| **OPTIONS** | Доступные методы | ✅ | ✅ | ❌ |

- **Идемпотентный:** повторный запрос даёт тот же результат
- **Безопасный:** не изменяет состояние сервера

## Коды статуса

### 1xx — Информационные

| Код | Название | Описание |
|-----|----------|----------|
| 100 | Continue | Продолжайте запрос |
| 101 | Switching Protocols | Смена протокола (WebSocket) |

### 2xx — Успех

| Код | Название | Описание |
|-----|----------|----------|
| 200 | OK | Успешно |
| 201 | Created | Ресурс создан |
| 204 | No Content | Успешно, без тела ответа |
| 206 | Partial Content | Частичный контент (Range) |

### 3xx — Перенаправление

| Код | Название | Описание |
|-----|----------|----------|
| 301 | Moved Permanently | Постоянное перенаправление |
| 302 | Found | Временное перенаправление |
| 304 | Not Modified | Использовать кэш |
| 307 | Temporary Redirect | Временное (сохранить метод) |
| 308 | Permanent Redirect | Постоянное (сохранить метод) |

### 4xx — Ошибки клиента

| Код | Название | Описание |
|-----|----------|----------|
| 400 | Bad Request | Неверный запрос |
| 401 | Unauthorized | Требуется аутентификация |
| 403 | Forbidden | Доступ запрещён |
| 404 | Not Found | Ресурс не найден |
| 405 | Method Not Allowed | Метод не разрешён |
| 409 | Conflict | Конфликт |
| 429 | Too Many Requests | Превышен лимит запросов |

### 5xx — Ошибки сервера

| Код | Название | Описание |
|-----|----------|----------|
| 500 | Internal Server Error | Внутренняя ошибка |
| 502 | Bad Gateway | Ошибка шлюза |
| 503 | Service Unavailable | Сервис недоступен |
| 504 | Gateway Timeout | Таймаут шлюза |

## Важные заголовки

### Заголовки запроса

| Заголовок | Назначение | Пример |
|-----------|------------|--------|
| Host | Имя хоста (обязателен в HTTP/1.1) | `Host: api.example.com` |
| Accept | Принимаемые типы контента | `Accept: application/json` |
| Content-Type | Тип тела запроса | `Content-Type: application/json` |
| Authorization | Аутентификация | `Authorization: Bearer token` |
| User-Agent | Клиентское приложение | `User-Agent: Mozilla/5.0` |
| Cookie | Куки | `Cookie: session=abc123` |
| Accept-Encoding | Принимаемое сжатие | `Accept-Encoding: gzip, deflate` |

### Заголовки ответа

| Заголовок | Назначение | Пример |
|-----------|------------|--------|
| Content-Type | Тип контента | `Content-Type: text/html; charset=utf-8` |
| Content-Length | Размер тела | `Content-Length: 1234` |
| Set-Cookie | Установить куку | `Set-Cookie: session=xyz; HttpOnly` |
| Cache-Control | Управление кэшем | `Cache-Control: max-age=3600` |
| Location | URL перенаправления | `Location: /new-page` |
| Access-Control-* | CORS заголовки | `Access-Control-Allow-Origin: *` |

## Заголовки безопасности

### Основные

| Заголовок | Назначение |
|-----------|------------|
| `Strict-Transport-Security` | Принудительный HTTPS (HSTS) |
| `Content-Security-Policy` | Политика загрузки контента |
| `X-Content-Type-Options` | Запрет MIME-sniffing |
| `X-Frame-Options` | Защита от clickjacking |
| `X-XSS-Protection` | Защита от XSS (устарел) |
| `Referrer-Policy` | Контроль Referer |

### Пример защищённых заголовков

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

## HTTPS (HTTP Secure)

### TLS Handshake

```
Клиент                              Сервер
   │                                   │
   │──── ClientHello ─────────────────►│
   │     (версия TLS, cipher suites)   │
   │                                   │
   │◄─── ServerHello ─────────────────│
   │     (выбранный cipher)            │
   │◄─── Certificate ─────────────────│
   │     (сертификат сервера)          │
   │◄─── ServerHelloDone ─────────────│
   │                                   │
   │──── ClientKeyExchange ───────────►│
   │     (premaster secret)            │
   │──── ChangeCipherSpec ────────────►│
   │──── Finished ────────────────────►│
   │                                   │
   │◄─── ChangeCipherSpec ─────────────│
   │◄─── Finished ─────────────────────│
   │                                   │
   │◄═══ Зашифрованный обмен ═════════►│
```

### Версии TLS

| Версия | Статус | Примечание |
|--------|--------|------------|
| SSL 2.0 | ❌ Устарел | Серьёзные уязвимости |
| SSL 3.0 | ❌ Устарел | POODLE атака |
| TLS 1.0 | ⚠️ Устарел | Не рекомендуется |
| TLS 1.1 | ⚠️ Устарел | Не рекомендуется |
| TLS 1.2 | ✅ Актуален | Широко используется |
| TLS 1.3 | ✅ Рекомендован | Быстрее, безопаснее |

## HTTP/2

### Особенности

- **Бинарный протокол** (вместо текстового)
- **Мультиплексирование** — несколько запросов в одном соединении
- **HPACK** — сжатие заголовков
- **Server Push** — сервер отправляет ресурсы до запроса
- **Приоритизация** потоков

### Структура

```
┌──────────────────────────────────────┐
│           TCP Connection             │
│  ┌────────────────────────────────┐  │
│  │         HTTP/2 Session         │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐   │  │
│  │  │Stream│ │Stream│ │Stream│   │  │
│  │  │  1   │ │  3   │ │  5   │   │  │
│  │  └──────┘ └──────┘ └──────┘   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## HTTP/3 и QUIC

### QUIC особенности

- Работает поверх **UDP** (не TCP)
- Встроенное шифрование (TLS 1.3)
- **0-RTT** — возобновление соединения без handshake
- Независимая доставка потоков
- Миграция соединений (смена IP)

```
HTTP/3: ┌─────────┐
        │  HTTP   │
        ├─────────┤
        │  QUIC   │ ← Шифрование + мультиплексирование
        ├─────────┤
        │   UDP   │
        └─────────┘
```

## Аутентификация

### Basic Auth

```http
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

Base64 от `username:password`. **Небезопасно без HTTPS!**

### Bearer Token (JWT)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key

```http
X-API-Key: your-api-key-here
```

или в query параметре: `?api_key=xxx`

## CORS (Cross-Origin Resource Sharing)

### Preflight запрос

```http
OPTIONS /api/data HTTP/1.1
Origin: https://example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

### Ответ сервера

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

## Утилиты

### curl

```bash
# GET запрос
curl https://api.example.com/users

# POST с JSON
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'

# С заголовками ответа
curl -i https://example.com

# Только заголовки
curl -I https://example.com

# С аутентификацией
curl -H "Authorization: Bearer token" https://api.example.com
```

### wget

```bash
wget https://example.com/file.zip
wget -O output.html https://example.com
```

### httpie

```bash
http GET https://api.example.com/users
http POST https://api.example.com/users name=John
```
