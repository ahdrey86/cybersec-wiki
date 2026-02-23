---
sidebar_position: 9
---

import FirewallSimulator from '@site/src/components/network/FirewallSimulator';

# Firewall и iptables

Межсетевой экран — система фильтрации сетевого трафика.

## Интерактивный симулятор Firewall

<FirewallSimulator />

## Основы iptables

### Архитектура Netfilter

```
                    PREROUTING
                        │
                        ▼
                 ┌──────────────┐
                 │   Routing    │
                 │   Decision   │
                 └──────────────┘
                    │         │
          ┌─────────┘         └─────────┐
          ▼                             ▼
       INPUT                        FORWARD
          │                             │
          ▼                             ▼
    Local Process                  POSTROUTING
          │                             │
          ▼                             ▼
       OUTPUT ──────────────────► POSTROUTING
```

### Таблицы и цепочки

| Таблица | Цепочки | Назначение |
|---------|---------|------------|
| **filter** | INPUT, FORWARD, OUTPUT | Фильтрация пакетов |
| **nat** | PREROUTING, OUTPUT, POSTROUTING | Трансляция адресов |
| **mangle** | все | Модификация пакетов |
| **raw** | PREROUTING, OUTPUT | Обход conntrack |

### Действия (targets)

| Target | Описание |
|--------|----------|
| `ACCEPT` | Принять пакет |
| `DROP` | Отбросить (без ответа) |
| `REJECT` | Отклонить (с ICMP ошибкой) |
| `LOG` | Записать в лог |
| `SNAT` | Source NAT |
| `DNAT` | Destination NAT |
| `MASQUERADE` | Динамический SNAT |
| `REDIRECT` | Перенаправление порта |

## Синтаксис iptables

### Базовые команды

```bash
# Просмотр правил
iptables -L -n -v
iptables -L -n -v --line-numbers

# Просмотр конкретной таблицы
iptables -t nat -L -n -v

# Очистка всех правил
iptables -F

# Установка политики по умолчанию
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT
```

### Добавление правил

```bash
# В конец цепочки
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# В начало цепочки
iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT

# Удаление правила
iptables -D INPUT -p tcp --dport 22 -j ACCEPT
iptables -D INPUT 3  # по номеру
```

### Фильтрация по параметрам

```bash
# По протоколу
-p tcp
-p udp
-p icmp

# По IP адресу
-s 192.168.1.0/24     # источник
-d 10.0.0.1           # назначение

# По порту
--dport 80            # порт назначения
--sport 1024:65535    # диапазон портов источника

# По интерфейсу
-i eth0               # входящий интерфейс
-o eth1               # исходящий интерфейс

# По состоянию соединения
-m state --state NEW,ESTABLISHED,RELATED

# По MAC адресу
-m mac --mac-source 00:11:22:33:44:55
```

## Типичные конфигурации

### Базовый веб-сервер

```bash
#!/bin/bash

# Очистка
iptables -F
iptables -X

# Политики по умолчанию
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Loopback
iptables -A INPUT -i lo -j ACCEPT

# Established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# SSH (с ограничением)
iptables -A INPUT -p tcp --dport 22 -m state --state NEW \
  -m recent --set --name SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW \
  -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# ICMP (ping)
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# Логирование отброшенных
iptables -A INPUT -j LOG --log-prefix "DROPPED: "
```

### NAT и маршрутизация

```bash
# Включить IP forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward

# SNAT (маскарадинг)
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# DNAT (проброс порта)
iptables -t nat -A PREROUTING -p tcp --dport 8080 \
  -j DNAT --to-destination 192.168.1.100:80

# Port forwarding с фильтрацией
iptables -A FORWARD -p tcp -d 192.168.1.100 --dport 80 -j ACCEPT
```

### Защита от атак

```bash
# Защита от SYN flood
iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT

# Защита от ping flood
iptables -A INPUT -p icmp --icmp-type echo-request \
  -m limit --limit 1/s --limit-burst 4 -j ACCEPT

# Блокировка invalid пакетов
iptables -A INPUT -m state --state INVALID -j DROP

# Защита от port scanning
iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP

# Блокировка спуфинга
iptables -A INPUT -s 10.0.0.0/8 -i eth0 -j DROP
iptables -A INPUT -s 172.16.0.0/12 -i eth0 -j DROP
iptables -A INPUT -s 192.168.0.0/16 -i eth0 -j DROP
```

## nftables (новая система)

nftables — замена iptables в современных ядрах Linux.

### Синтаксис nftables

```bash
# Создание таблицы
nft add table inet filter

# Создание цепочки
nft add chain inet filter input { type filter hook input priority 0 \; policy drop \; }

# Добавление правил
nft add rule inet filter input tcp dport 22 accept
nft add rule inet filter input tcp dport { 80, 443 } accept

# Просмотр
nft list ruleset
```

### Сравнение синтаксиса

| iptables | nftables |
|----------|----------|
| `iptables -A INPUT` | `nft add rule inet filter input` |
| `-p tcp --dport 80` | `tcp dport 80` |
| `-s 192.168.1.0/24` | `ip saddr 192.168.1.0/24` |
| `-j ACCEPT` | `accept` |
| `-m state --state NEW` | `ct state new` |

## UFW (Uncomplicated Firewall)

Упрощённый интерфейс для iptables в Ubuntu/Debian.

```bash
# Включение
ufw enable

# Политика по умолчанию
ufw default deny incoming
ufw default allow outgoing

# Разрешить порт
ufw allow 22/tcp
ufw allow ssh
ufw allow 80,443/tcp

# Разрешить с IP
ufw allow from 192.168.1.0/24 to any port 22

# Удалить правило
ufw delete allow 80/tcp

# Статус
ufw status verbose
```

## firewalld (RHEL/CentOS)

```bash
# Статус
firewall-cmd --state

# Зоны
firewall-cmd --get-zones
firewall-cmd --get-active-zones

# Добавить сервис
firewall-cmd --zone=public --add-service=http --permanent
firewall-cmd --zone=public --add-port=8080/tcp --permanent

# Применить
firewall-cmd --reload

# Просмотр правил
firewall-cmd --zone=public --list-all
```

## Типы файрволов

### По уровню работы

| Тип | Уровень OSI | Особенности |
|-----|-------------|-------------|
| Пакетный фильтр | L3-L4 | Быстрый, простой |
| Stateful | L3-L4 | Отслеживание соединений |
| Proxy/ALG | L7 | Глубокий анализ |
| NGFW | L3-L7 | Комплексная защита |

### NGFW функции

- Deep Packet Inspection (DPI)
- IPS/IDS интеграция
- Антивирус
- URL фильтрация
- SSL инспекция
- Application control

## Лучшие практики

### Принципы настройки

1. **Default Deny** — запрещать всё по умолчанию
2. **Минимальные привилегии** — разрешать только необходимое
3. **Stateful filtering** — отслеживать состояние соединений
4. **Логирование** — записывать отклонённые пакеты
5. **Регулярный аудит** — проверять правила

### Чек-лист безопасности

- [ ] Политика DROP по умолчанию для INPUT
- [ ] Разрешён только необходимый трафик
- [ ] SSH ограничен по IP или rate-limited
- [ ] Включено логирование
- [ ] Правила задокументированы
- [ ] Настроен fail2ban для защиты от брутфорса
- [ ] Отключены ненужные сервисы

## Диагностика

### Проверка правил

```bash
# Подробный вывод с счётчиками
iptables -L -n -v

# Проверка, куда попадёт пакет
iptables -C INPUT -p tcp --dport 80 -j ACCEPT

# Трассировка
iptables -t raw -A PREROUTING -p tcp --dport 80 -j TRACE
```

### Логирование

```bash
# Включить логирование
iptables -A INPUT -j LOG --log-prefix "INPUT DROP: " --log-level 4

# Просмотр логов
dmesg | grep "INPUT DROP"
journalctl -k | grep "INPUT DROP"
```

### tcpdump для анализа

```bash
# Смотреть трафик на порту
tcpdump -i eth0 port 80

# С содержимым пакетов
tcpdump -i eth0 -A port 80
```
