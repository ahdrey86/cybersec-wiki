---
sidebar_position: 5
---

# Wazuh

Open-source SIEM и XDR платформа для мониторинга безопасности.

## Обзор

```
┌─────────────────────────────────────────────────────────────────┐
│                       WAZUH ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│    │ Agent 1 │  │ Agent 2 │  │ Agent 3 │  │ Syslog  │         │
│    │ (Linux) │  │(Windows)│  │ (macOS) │  │ sources │         │
│    └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘         │
│         │            │            │            │                │
│         └────────────┴─────┬──────┴────────────┘                │
│                            │                                    │
│                     ┌──────▼──────┐                             │
│                     │   Wazuh     │                             │
│                     │   Manager   │                             │
│                     │  (Server)   │                             │
│                     └──────┬──────┘                             │
│                            │                                    │
│                     ┌──────▼──────┐                             │
│                     │   Wazuh     │                             │
│                     │  Indexer    │                             │
│                     │(OpenSearch) │                             │
│                     └──────┬──────┘                             │
│                            │                                    │
│                     ┌──────▼──────┐                             │
│                     │   Wazuh     │                             │
│                     │ Dashboard   │                             │
│                     └─────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Компоненты

| Компонент | Описание | Порт |
|-----------|----------|------|
| **Wazuh Manager** | Обработка событий, правила | 1514, 1515, 55000 |
| **Wazuh Indexer** | Хранение и индексация | 9200, 9300 |
| **Wazuh Dashboard** | Веб-интерфейс | 443 |
| **Wazuh Agent** | Сбор данных на хостах | — |

## Установка

### All-in-one (Docker)

```bash
# Клонируем репозиторий
git clone https://github.com/wazuh/wazuh-docker.git
cd wazuh-docker/single-node

# Генерируем сертификаты
docker-compose -f generate-indexer-certs.yml run --rm generator

# Запускаем
docker-compose up -d
```

### Установка Manager (Linux)

```bash
# Добавляем репозиторий
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg

echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | tee /etc/apt/sources.list.d/wazuh.list

# Устанавливаем
apt update && apt install wazuh-manager

# Запускаем
systemctl enable --now wazuh-manager
```

### Установка Agent

**Linux:**
```bash
curl -so wazuh-agent.deb https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.7.0-1_amd64.deb
WAZUH_MANAGER='192.168.1.100' dpkg -i wazuh-agent.deb
systemctl enable --now wazuh-agent
```

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.7.0-1.msi -OutFile wazuh-agent.msi
msiexec.exe /i wazuh-agent.msi /q WAZUH_MANAGER='192.168.1.100'
NET START WazuhSvc
```

## Конфигурация агента

**ossec.conf:**
```xml
<ossec_config>
  <client>
    <server>
      <address>192.168.1.100</address>
      <port>1514</port>
      <protocol>tcp</protocol>
    </server>
  </client>

  <!-- Мониторинг файлов -->
  <syscheck>
    <frequency>300</frequency>
    <directories check_all="yes">/etc,/usr/bin,/usr/sbin</directories>
    <directories check_all="yes">C:\Windows\System32</directories>
  </syscheck>

  <!-- Сбор логов -->
  <localfile>
    <log_format>syslog</log_format>
    <location>/var/log/auth.log</location>
  </localfile>

  <localfile>
    <log_format>eventchannel</log_format>
    <location>Security</location>
  </localfile>
</ossec_config>
```

## Правила (Rules)

### Структура правила

```xml
<rule id="100001" level="10">
  <if_sid>5710</if_sid>
  <field name="win.eventdata.targetUserName">admin</field>
  <description>Failed login attempt for admin user</description>
  <mitre>
    <id>T1110</id>
  </mitre>
  <group>authentication_failed,</group>
</rule>
```

### Уровни severity

| Уровень | Описание | Пример |
|---------|----------|--------|
| 0 | Игнорировать | — |
| 2 | System low | Успешный вход |
| 5 | User-generated | Неверный пароль |
| 10 | User-generated | Множественные ошибки |
| 12 | High importance | Rootkit detected |
| 15 | Severe attack | Active attack |

### Кастомные правила

**/var/ossec/etc/rules/local_rules.xml:**
```xml
<group name="custom,">

  <!-- Детект Mimikatz -->
  <rule id="100100" level="15">
    <if_sid>61603</if_sid>
    <field name="win.eventdata.originalFileName" type="pcre2">(?i)mimikatz</field>
    <description>Mimikatz execution detected</description>
    <mitre>
      <id>T1003.001</id>
    </mitre>
  </rule>

  <!-- Brute force SSH -->
  <rule id="100101" level="10" frequency="5" timeframe="60">
    <if_matched_sid>5710</if_matched_sid>
    <same_source_ip/>
    <description>SSH brute force attack</description>
    <mitre>
      <id>T1110</id>
    </mitre>
  </rule>

  <!-- PowerShell encoded -->
  <rule id="100102" level="12">
    <if_sid>92000</if_sid>
    <field name="win.eventdata.commandLine" type="pcre2">(?i)-enc[oded]*\s</field>
    <description>PowerShell encoded command</description>
    <mitre>
      <id>T1059.001</id>
    </mitre>
  </rule>

</group>
```

## Декодеры (Decoders)

### Пример кастомного декодера

```xml
<decoder name="custom-app">
  <program_name>myapp</program_name>
</decoder>

<decoder name="custom-app-login">
  <parent>custom-app</parent>
  <regex>User (\S+) logged in from (\S+)</regex>
  <order>user, srcip</order>
</decoder>
```

## File Integrity Monitoring (FIM)

```xml
<syscheck>
  <frequency>300</frequency>
  
  <!-- Linux -->
  <directories check_all="yes" realtime="yes">/etc</directories>
  <directories check_all="yes">/bin,/sbin</directories>
  
  <!-- Windows -->
  <directories check_all="yes" realtime="yes">C:\Windows\System32</directories>
  
  <!-- Исключения -->
  <ignore>/etc/mtab</ignore>
  <ignore type="sregex">.log$</ignore>
</syscheck>
```

## Vulnerability Detection

```xml
<vulnerability-detector>
  <enabled>yes</enabled>
  <interval>5m</interval>
  <run_on_start>yes</run_on_start>

  <provider name="nvd">
    <enabled>yes</enabled>
    <update_interval>1h</update_interval>
  </provider>

  <provider name="canonical">
    <enabled>yes</enabled>
    <os>bionic,focal,jammy</os>
  </provider>
</vulnerability-detector>
```

## Active Response

Автоматическое реагирование на угрозы:

```xml
<active-response>
  <command>firewall-drop</command>
  <location>local</location>
  <rules_id>100101</rules_id>
  <timeout>600</timeout>
</active-response>

<command>
  <name>firewall-drop</name>
  <executable>firewall-drop</executable>
  <timeout_allowed>yes</timeout_allowed>
</command>
```

## API

### Аутентификация

```bash
# Получение токена
TOKEN=$(curl -u wazuh:wazuh -k -X POST "https://localhost:55000/security/user/authenticate" | jq -r '.data.token')

# Использование
curl -k -X GET "https://localhost:55000/agents" -H "Authorization: Bearer $TOKEN"
```

### Примеры запросов

```bash
# Список агентов
GET /agents

# Статус агента
GET /agents/{agent_id}

# Алерты
GET /alerts

# Уязвимости
GET /vulnerability/{agent_id}
```

## Интеграции

### TheHive

```xml
<integration>
  <name>custom-thehive</name>
  <hook_url>http://thehive:9000/api/alert</hook_url>
  <level>10</level>
  <alert_format>json</alert_format>
</integration>
```

### Slack

```xml
<integration>
  <name>slack</name>
  <hook_url>https://hooks.slack.com/services/XXX/YYY/ZZZ</hook_url>
  <level>10</level>
  <alert_format>json</alert_format>
</integration>
```

### MISP

```xml
<integration>
  <name>custom-misp</name>
  <hook_url>http://misp/events/add</hook_url>
  <api_key>YOUR_API_KEY</api_key>
  <level>12</level>
</integration>
```

## Полезные запросы (Dashboard)

### Топ атакующих IP

```
rule.mitre.id:* AND NOT agent.name:*
| Top 10 data.srcip
```

### Failed logins

```
rule.groups: authentication_failed
| Timeline by @timestamp
```

### Новые процессы

```
rule.id: 61603 AND data.win.eventdata.originalFileName: *
| Table: agent.name, data.win.eventdata.image, data.win.eventdata.commandLine
```

## Troubleshooting

### Проверка статуса

```bash
# Manager
systemctl status wazuh-manager
/var/ossec/bin/wazuh-control status

# Agent
systemctl status wazuh-agent
/var/ossec/bin/wazuh-control status
```

### Логи

```bash
# Manager
tail -f /var/ossec/logs/ossec.log
tail -f /var/ossec/logs/alerts/alerts.json

# Agent
tail -f /var/ossec/logs/ossec.log
```

### Тестирование правил

```bash
# Тест лога
/var/ossec/bin/wazuh-logtest

# Ввод лога для теста
Feb 23 14:32:15 server sshd[1234]: Failed password for admin from 192.168.1.100
```

## Рекомендации

1. **Используйте группы агентов** — для разных политик
2. **Включите Sysmon** — на Windows для детальных логов
3. **Настройте retention** — управляйте размером индексов
4. **Тюньте правила** — уменьшите false positives
5. **Мониторьте производительность** — агенты и сервер
6. **Регулярно обновляйте** — новые правила и уязвимости
