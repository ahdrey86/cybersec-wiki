---
sidebar_position: 4
---

import MitreMatrix from '@site/src/components/siem/MitreMatrix';

# MITRE ATT&CK

Фреймворк для описания тактик и техник атакующих.

## Интерактивная матрица

<MitreMatrix />

## Что такое MITRE ATT&CK?

**ATT&CK** (Adversarial Tactics, Techniques, and Common Knowledge) — это база знаний о поведении атакующих, основанная на реальных наблюдениях.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MITRE ATT&CK                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Тактики (Tactics) - ЗАЧЕМ атакующий это делает                    │
│      │                                                              │
│      └── Техники (Techniques) - КАК атакующий это делает           │
│              │                                                      │
│              └── Субтехники (Sub-techniques) - вариации            │
│                      │                                              │
│                      └── Процедуры (Procedures) - конкретные       │
│                                                 реализации          │
└─────────────────────────────────────────────────────────────────────┘
```

## Тактики (14 категорий)

| ID | Тактика | Описание |
|----|---------|----------|
| TA0043 | Reconnaissance | Сбор информации о цели |
| TA0042 | Resource Development | Подготовка инфраструктуры |
| TA0001 | Initial Access | Получение начального доступа |
| TA0002 | Execution | Выполнение кода |
| TA0003 | Persistence | Закрепление в системе |
| TA0004 | Privilege Escalation | Повышение привилегий |
| TA0005 | Defense Evasion | Обход защиты |
| TA0006 | Credential Access | Получение учётных данных |
| TA0007 | Discovery | Исследование среды |
| TA0008 | Lateral Movement | Боковое перемещение |
| TA0009 | Collection | Сбор данных |
| TA0011 | Command and Control | Управление и контроль |
| TA0010 | Exfiltration | Вывод данных |
| TA0040 | Impact | Воздействие |

## Ключевые техники для мониторинга

### Initial Access (TA0001)

| Техника | Описание | Источники логов |
|---------|----------|-----------------|
| T1566 Phishing | Фишинговые email | Email gateway, Proxy |
| T1190 Exploit Public App | Эксплуатация уязвимостей | WAF, IDS, App logs |
| T1133 External Remote | VPN, RDP извне | VPN logs, Firewall |
| T1078 Valid Accounts | Легитимные учётки | Auth logs |

### Execution (TA0002)

| Техника | Описание | Что мониторить |
|---------|----------|----------------|
| T1059.001 PowerShell | Выполнение PowerShell | ScriptBlock logging, 4104 |
| T1059.003 cmd.exe | Командная строка | Process creation, 4688 |
| T1047 WMI | Windows Management | WMI activity, Sysmon 19-21 |
| T1053 Scheduled Task | Планировщик | Task Scheduler logs |

### Persistence (TA0003)

| Техника | Описание | Что мониторить |
|---------|----------|----------------|
| T1547.001 Registry Run | Автозапуск в реестре | Sysmon 13, Registry audit |
| T1053.005 Scheduled Task | Задания планировщика | Event 4698, 4699 |
| T1543.003 Windows Service | Сервисы Windows | Event 7045, 4697 |
| T1136 Create Account | Создание учётки | Event 4720 |

### Credential Access (TA0006)

| Техника | Описание | Что мониторить |
|---------|----------|----------------|
| T1003.001 LSASS Memory | Дамп LSASS | Sysmon 10 (lsass.exe) |
| T1003.002 SAM | Дамп SAM | Registry access |
| T1110 Brute Force | Перебор паролей | Event 4625 |
| T1558 Kerberoasting | Атака на Kerberos | Event 4769 (RC4) |

### Defense Evasion (TA0005)

| Техника | Описание | Что мониторить |
|---------|----------|----------------|
| T1070.001 Clear Logs | Очистка логов | Event 1102, 104 |
| T1027 Obfuscation | Обфускация | Entropy analysis |
| T1055 Process Injection | Инъекция в процесс | Sysmon 8, 10 |
| T1218 Signed Binary Proxy | LOLBins | Process creation |

### Lateral Movement (TA0008)

| Техника | Описание | Что мониторить |
|---------|----------|----------------|
| T1021.001 RDP | Remote Desktop | Event 4624 type 10 |
| T1021.002 SMB | SMB/Windows Admin Shares | Event 5140, 5145 |
| T1021.006 WinRM | Windows Remote Mgmt | Event 91, 168 |
| T1570 Tool Transfer | Передача инструментов | File creation, Network |

## Использование в SOC

### Detection Engineering

```yaml
# SIGMA правило с MITRE тегами
title: Mimikatz Credential Dumping
tags:
    - attack.credential_access
    - attack.t1003.001
detection:
    selection:
        TargetImage|endswith: '\lsass.exe'
        GrantedAccess|contains:
            - '0x1010'
            - '0x1038'
    condition: selection
```

### Threat Hunting

```
1. Выбрать технику для hunt
2. Определить источники данных
3. Создать гипотезу
4. Написать запросы
5. Проанализировать результаты
6. Документировать находки
```

**Пример Hunting Query (Splunk):**
```spl
index=windows EventCode=4688
| where match(NewProcessName, "(?i)(mimikatz|procdump|lsass)")
  OR match(CommandLine, "(?i)(sekurlsa|lsadump|kerberos::)")
| stats count by Computer, User, NewProcessName, CommandLine
| sort -count
```

### Gap Analysis

Оценка покрытия детектами:

```
┌────────────────────────────────────────────────────────────┐
│ Technique Coverage                                         │
├────────────────────────────────────────────────────────────┤
│ T1059.001 PowerShell    ████████████████████░░  90%       │
│ T1003.001 LSASS         ██████████████████░░░░  80%       │
│ T1547.001 Registry      ████████████████░░░░░░  70%       │
│ T1055 Process Inject    ██████████░░░░░░░░░░░░  50%       │
│ T1027 Obfuscation       ████░░░░░░░░░░░░░░░░░░  20%       │
└────────────────────────────────────────────────────────────┘
```

### Incident Response

```
Инцидент: Malware detected
    │
    ├── T1566.001 Phishing Attachment
    │       └── Email от user@company.com
    │
    ├── T1059.001 PowerShell
    │       └── Encoded command execution
    │
    ├── T1003.001 LSASS Dump
    │       └── Mimikatz detected
    │
    └── T1021.002 SMB Lateral
            └── Movement to DC01
```

## ATT&CK Navigator

Визуализация покрытия и приоритизации:

```json
{
  "name": "SOC Coverage",
  "versions": {
    "attack": "12",
    "navigator": "4.8"
  },
  "techniques": [
    {
      "techniqueID": "T1059.001",
      "score": 90,
      "color": "#00ff88",
      "comment": "PowerShell logging enabled"
    },
    {
      "techniqueID": "T1003.001",
      "score": 80,
      "color": "#00d4aa",
      "comment": "LSASS monitoring via Sysmon"
    }
  ]
}
```

## Интеграция с инструментами

| Инструмент | Использование ATT&CK |
|------------|---------------------|
| **SIGMA** | Теги в правилах |
| **Wazuh** | MITRE ID в rules |
| **Splunk ES** | ATT&CK annotations |
| **Elastic SIEM** | Threat mapping |
| **QRadar** | Use case mapping |
| **Atomic Red Team** | Тесты по техникам |
| **Caldera** | Эмуляция атак |

## Ресурсы

| Ресурс | URL | Описание |
|--------|-----|----------|
| ATT&CK Matrix | attack.mitre.org | Официальная матрица |
| Navigator | mitre-attack.github.io/attack-navigator | Визуализация |
| CAR | car.mitre.org | Analytics Repository |
| D3FEND | d3fend.mitre.org | Defensive techniques |
| CTID | ctid.mitre-engenuity.org | Threat intelligence |

## Рекомендации

1. **Начните с высокоприоритетных техник** — Initial Access, Execution, Credential Access
2. **Используйте data sources** — определите какие логи нужны
3. **Маппьте правила на техники** — для gap analysis
4. **Тестируйте детекты** — Atomic Red Team, Caldera
5. **Приоритизируйте** — не все техники одинаково важны
6. **Обновляйтесь** — ATT&CK регулярно дополняется
