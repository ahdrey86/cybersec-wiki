---
sidebar_position: 2
---

import LogAnalyzer from '@site/src/components/siem/LogAnalyzer';

# Анализ логов

Сбор, парсинг и анализ логов — основа работы SIEM системы.

## Интерактивный анализатор

<LogAnalyzer />

## Форматы логов

### Syslog (RFC 5424)

Стандартный формат для Unix/Linux систем:

```
<priority>version timestamp hostname app-name procid msgid structured-data msg

Пример:
<34>1 2024-02-23T14:32:15.123Z webserver nginx 1234 - - GET /api/users 200
```

**Priority** = Facility × 8 + Severity

| Facility | Код | Описание |
|----------|-----|----------|
| kern | 0 | Kernel messages |
| user | 1 | User-level messages |
| mail | 2 | Mail system |
| daemon | 3 | System daemons |
| auth | 4 | Security/authorization |
| syslog | 5 | Syslogd internal |
| local0-7 | 16-23 | Local use |

| Severity | Код | Описание |
|----------|-----|----------|
| emerg | 0 | System unusable |
| alert | 1 | Immediate action |
| crit | 2 | Critical conditions |
| err | 3 | Error conditions |
| warning | 4 | Warning conditions |
| notice | 5 | Normal but significant |
| info | 6 | Informational |
| debug | 7 | Debug messages |

### Windows Event Log

```xml
<Event>
  <System>
    <Provider Name="Microsoft-Windows-Security-Auditing"/>
    <EventID>4625</EventID>
    <Level>0</Level>
    <TimeCreated SystemTime="2024-02-23T14:32:15.123Z"/>
    <Computer>DC01.domain.local</Computer>
  </System>
  <EventData>
    <Data Name="TargetUserName">admin</Data>
    <Data Name="IpAddress">192.168.1.100</Data>
  </EventData>
</Event>
```

**Важные Event ID для безопасности:**

| Event ID | Описание | Критичность |
|----------|----------|-------------|
| 4624 | Successful logon | Info |
| 4625 | Failed logon | Warning |
| 4648 | Explicit credential logon | Warning |
| 4672 | Special privileges assigned | Info |
| 4688 | Process creation | Info |
| 4720 | User account created | Warning |
| 4728 | Member added to security group | Warning |
| 4732 | Member added to local group | Warning |
| 4768 | Kerberos TGT requested | Info |
| 4769 | Kerberos service ticket | Info |
| 4776 | NTLM authentication | Info |
| 1102 | Audit log cleared | Critical |

### Apache/Nginx Access Log

**Combined Log Format:**
```
%h %l %u %t "%r" %>s %b "%{Referer}i" "%{User-Agent}i"

192.168.1.50 - john [23/Feb/2024:14:32:15 +0300] "GET /admin HTTP/1.1" 403 1234 "-" "Mozilla/5.0"
```

| Поле | Описание |
|------|----------|
| %h | Remote host (IP) |
| %l | Remote logname (usually -) |
| %u | Remote user |
| %t | Time |
| %r | Request line |
| %>s | Status code |
| %b | Response size |

### JSON (структурированные логи)

```json
{
  "@timestamp": "2024-02-23T14:32:15.123Z",
  "level": "ERROR",
  "logger": "auth.service",
  "message": "Authentication failed",
  "context": {
    "user": "admin",
    "ip": "192.168.1.100",
    "method": "password",
    "reason": "invalid_credentials"
  },
  "trace_id": "abc123"
}
```

## Сбор логов

### Агентный сбор

```
┌─────────┐     ┌─────────┐     ┌──────────┐
│ Server  │────▶│  Agent  │────▶│   SIEM   │
└─────────┘     └─────────┘     └──────────┘

Примеры: Beats, Fluentd, NXLog, Wazuh Agent
```

**Преимущества:**
- Буферизация при недоступности SIEM
- Локальная фильтрация
- Шифрование при передаче

### Безагентный сбор (Syslog)

```
┌─────────┐                     ┌──────────┐
│ Server  │────── UDP/TCP ─────▶│   SIEM   │
└─────────┘        514/6514     └──────────┘
```

**Настройка rsyslog:**
```bash
# /etc/rsyslog.conf
*.* @@siem.company.local:514  # TCP
*.* @siem.company.local:514   # UDP
```

### Windows Event Forwarding (WEF)

```powershell
# На коллекторе
wecutil qc

# На источнике
winrm quickconfig
wevtutil sl Security /ca:O:BAG:SYD:(A;;0x1;;;BA)
```

## Нормализация

Приведение логов из разных источников к единой схеме:

```
┌─────────────────┐
│ Raw Syslog      │──┐
├─────────────────┤  │     ┌──────────────────┐
│ Windows Event   │──┼────▶│  Normalized ECS  │
├─────────────────┤  │     │                  │
│ JSON logs       │──┘     │ @timestamp       │
└─────────────────┘        │ source.ip        │
                           │ destination.ip   │
                           │ user.name        │
                           │ event.action     │
                           │ event.outcome    │
                           └──────────────────┘
```

### Elastic Common Schema (ECS)

```json
{
  "@timestamp": "2024-02-23T14:32:15.123Z",
  "event": {
    "category": "authentication",
    "type": "start",
    "outcome": "failure"
  },
  "source": {
    "ip": "192.168.1.100",
    "port": 52431
  },
  "user": {
    "name": "admin"
  },
  "host": {
    "name": "webserver01"
  }
}
```

## Парсинг с Grok

Grok — паттерны для извлечения полей из неструктурированных логов:

```grok
# Syslog
%{SYSLOGTIMESTAMP:timestamp} %{HOSTNAME:host} %{PROG:program}(?:\[%{POSINT:pid}\])?: %{GREEDYDATA:message}

# Apache
%{IPORHOST:clientip} %{USER:ident} %{USER:auth} \[%{HTTPDATE:timestamp}\] "%{WORD:verb} %{URIPATHPARAM:request} HTTP/%{NUMBER:httpversion}" %{NUMBER:response} %{NUMBER:bytes}
```

**Базовые паттерны:**

| Паттерн | Описание |
|---------|----------|
| `%{IP}` | IPv4 адрес |
| `%{HOSTNAME}` | Имя хоста |
| `%{NUMBER}` | Число |
| `%{WORD}` | Слово |
| `%{GREEDYDATA}` | Всё до конца строки |
| `%{TIMESTAMP_ISO8601}` | ISO timestamp |

## Обогащение данных

### GeoIP

```json
{
  "source.ip": "8.8.8.8",
  "source.geo": {
    "country_name": "United States",
    "city_name": "Mountain View",
    "location": {
      "lat": 37.386,
      "lon": -122.084
    }
  }
}
```

### Threat Intelligence

```json
{
  "source.ip": "192.168.1.100",
  "threat": {
    "indicator": {
      "type": "ipv4-addr",
      "confidence": "high",
      "provider": "AlienVault OTX"
    },
    "feed": {
      "name": "Malicious IPs"
    }
  }
}
```

### Asset Information

```json
{
  "host.ip": "10.0.0.50",
  "asset": {
    "type": "server",
    "criticality": "high",
    "owner": "IT Department",
    "applications": ["nginx", "postgresql"]
  }
}
```

## Индикаторы компрометации (IoC)

| Тип | Пример | Источник |
|-----|--------|----------|
| IP | 192.168.100.100 | Firewall, Proxy |
| Domain | malware.com | DNS, Proxy |
| URL | http://evil.com/payload.exe | Proxy, Web logs |
| Hash (MD5/SHA256) | a1b2c3... | AV, EDR |
| Email | attacker@phishing.com | Email gateway |
| File path | C:\Windows\Temp\mal.exe | EDR, Sysmon |

## Рекомендации

1. **Централизуйте логи** — все источники в одно место
2. **Используйте UTC** — избегайте проблем с часовыми поясами
3. **Структурируйте** — JSON лучше plain text
4. **Храните сырые логи** — для forensics
5. **Настройте retention** — баланс между storage и compliance
6. **Документируйте схему** — какие поля откуда
