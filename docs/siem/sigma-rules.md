---
sidebar_position: 3
---

import SigmaBuilder from '@site/src/components/siem/SigmaBuilder';

# SIGMA правила

SIGMA — универсальный формат описания правил детекции для SIEM систем.

## Конструктор SIGMA

<SigmaBuilder />

## Что такое SIGMA?

SIGMA — это открытый стандарт для описания правил обнаружения угроз, который можно конвертировать в форматы различных SIEM систем.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│ SIGMA Rule  │────▶│  Converter  │────▶│ Splunk SPL      │
│   (YAML)    │     │  (sigmac)   │     │ Elastic KQL     │
│             │     │             │     │ QRadar AQL      │
└─────────────┘     └─────────────┘     │ Microsoft KQL   │
                                        └─────────────────┘
```

## Структура правила

```yaml
title: Название правила
id: UUID правила
status: experimental|test|stable
description: Описание того, что детектируем
author: Автор
date: 2024/02/23
modified: 2024/02/23
references:
    - https://ссылка-на-источник

logsource:
    category: process_creation
    product: windows

detection:
    selection:
        field1: value1
        field2|modifier: value2
    filter:
        field3: value3
    condition: selection and not filter

falsepositives:
    - Описание возможных ложных срабатываний

level: informational|low|medium|high|critical

tags:
    - attack.execution
    - attack.t1059.001
```

## Секция logsource

Определяет источник логов:

```yaml
logsource:
    category: process_creation    # Категория события
    product: windows              # Продукт/ОС
    service: sysmon               # Сервис/приложение
```

### Категории

| Категория | Описание |
|-----------|----------|
| process_creation | Создание процесса |
| network_connection | Сетевое соединение |
| file_event | Файловые операции |
| registry_event | Операции с реестром |
| dns_query | DNS запросы |
| image_load | Загрузка модулей |
| pipe_created | Создание именованных каналов |

### Продукты

| Продукт | Описание |
|---------|----------|
| windows | Windows Event Log |
| linux | Linux syslog/auditd |
| macos | macOS unified logs |
| aws | AWS CloudTrail |
| azure | Azure Activity Log |
| gcp | GCP Audit Logs |

## Секция detection

### Базовый синтаксис

```yaml
detection:
    selection:
        FieldName: 'value'           # Точное совпадение
        FieldName:                    # Список (OR)
            - 'value1'
            - 'value2'
    condition: selection
```

### Модификаторы

| Модификатор | Описание | Пример |
|-------------|----------|--------|
| `contains` | Содержит подстроку | `CommandLine\|contains: '-enc'` |
| `startswith` | Начинается с | `Image\|startswith: 'C:\Temp'` |
| `endswith` | Заканчивается на | `Image\|endswith: '.exe'` |
| `re` | Регулярное выражение | `CommandLine\|re: '.*-e(nc)?.*'` |
| `base64` | Base64 декодирование | `CommandLine\|base64: 'pattern'` |
| `all` | Все значения (AND) | `\|contains\|all:` |

### Примеры модификаторов

```yaml
# Содержит любое из значений
CommandLine|contains:
    - '-enc'
    - '-encoded'

# Содержит ВСЕ значения
CommandLine|contains|all:
    - 'powershell'
    - '-nop'
    - '-w hidden'

# Заканчивается на
Image|endswith:
    - '\cmd.exe'
    - '\powershell.exe'

# Регулярное выражение
CommandLine|re: '.*\s+-[eE][nN][cC]\s+.*'
```

### Условия (condition)

```yaml
# Простое условие
condition: selection

# Логические операции
condition: selection1 and selection2
condition: selection1 or selection2
condition: selection and not filter
condition: (sel1 or sel2) and not (filter1 or filter2)

# Агрегация
condition: selection | count() > 10
condition: selection | count(TargetUserName) > 5
```

## Примеры правил

### Обнаружение Mimikatz

```yaml
title: Mimikatz Credential Dumping
id: 0d7b3c95-7c6e-42b9-9c53-4c84b4b4a4f5
status: stable
description: Detects Mimikatz credential dumping activity
author: Security Team
logsource:
    category: process_creation
    product: windows
detection:
    selection_img:
        Image|endswith:
            - '\mimikatz.exe'
            - '\mimi.exe'
    selection_cmd:
        CommandLine|contains:
            - 'sekurlsa'
            - 'kerberos::list'
            - 'lsadump'
    condition: selection_img or selection_cmd
level: critical
tags:
    - attack.credential_access
    - attack.t1003
```

### Подозрительный PowerShell

```yaml
title: Suspicious PowerShell Encoded Command
id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
status: experimental
description: Detects PowerShell with encoded command
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\powershell.exe'
        CommandLine|contains:
            - ' -enc '
            - ' -e '
            - ' -EncodedCommand '
    filter:
        ParentImage|endswith:
            - '\Microsoft Visual Studio\Installer\setup.exe'
            - '\WindowsApps\'
    condition: selection and not filter
falsepositives:
    - Legitimate admin scripts
    - Software installers
level: high
tags:
    - attack.execution
    - attack.t1059.001
```

### Brute Force атака

```yaml
title: Multiple Failed Logins
id: b2c3d4e5-f6a7-8901-bcde-f23456789012
status: stable
description: Detects brute force attacks via multiple failed logins
logsource:
    product: windows
    service: security
detection:
    selection:
        EventID: 4625
    filter:
        TargetUserName: 'ANONYMOUS LOGON'
    condition: selection and not filter | count(TargetUserName) by IpAddress > 10
    timeframe: 5m
level: high
tags:
    - attack.credential_access
    - attack.t1110
```

## Конвертация

### sigmac (legacy)

```bash
# В Splunk SPL
sigmac -t splunk rule.yml

# В Elastic Query
sigmac -t es-qs rule.yml

# В QRadar AQL
sigmac -t qradar rule.yml
```

### sigma-cli (новый)

```bash
# Установка
pip install sigma-cli

# Конвертация
sigma convert -t splunk -p sysmon rule.yml
sigma convert -t elasticsearch -p ecs_windows rule.yml
```

### Пример вывода

**SIGMA:**
```yaml
detection:
    selection:
        Image|endswith: '\powershell.exe'
        CommandLine|contains: '-enc'
    condition: selection
```

**Splunk SPL:**
```spl
Image="*\\powershell.exe" CommandLine="*-enc*"
```

**Elastic KQL:**
```kql
process.executable: *\\powershell.exe AND process.command_line: *-enc*
```

## SIGMA репозитории

| Репозиторий | URL | Описание |
|-------------|-----|----------|
| **SigmaHQ** | github.com/SigmaHQ/sigma | Официальный репозиторий |
| **SOC Prime** | tdm.socprime.com | Коммерческая платформа |
| **Atomic Red Team** | github.com/redcanaryco/atomic-red-team | Тесты + правила |

## Интеграция с SIEM

### Wazuh

```xml
<rule id="100001" level="12">
    <if_sid>60103</if_sid>
    <field name="win.eventdata.commandLine" type="pcre2">-enc</field>
    <description>Suspicious PowerShell encoded command</description>
    <mitre>
        <id>T1059.001</id>
    </mitre>
</rule>
```

### Splunk

```spl
index=windows sourcetype=WinEventLog:Security
| where EventCode=4688
| where match(CommandLine, "(?i)-enc")
| stats count by Computer, User, CommandLine
```

### Elastic SIEM

```json
{
  "rule": {
    "name": "Suspicious PowerShell",
    "query": "process.name:powershell.exe and process.args:*-enc*",
    "severity": "high",
    "type": "query"
  }
}
```

## Рекомендации

1. **Начните с SigmaHQ** — проверенные правила
2. **Тюньте под среду** — добавляйте фильтры
3. **Тестируйте** — используйте Atomic Red Team
4. **Документируйте** — описывайте false positives
5. **Версионируйте** — храните в Git
6. **Автоматизируйте** — CI/CD для правил
