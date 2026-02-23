---
sidebar_position: 7
---

import DnsResolver from '@site/src/components/network/DnsResolver';

# DNS (Domain Name System)

Система доменных имён — распределённая иерархическая система для преобразования доменных имён в IP-адреса.

## Интерактивный DNS резолвер

<DnsResolver />

## Как работает DNS

### Иерархия DNS

```
                    . (Root)
                      │
        ┌─────────────┼─────────────┐
        │             │             │
      .com          .ru           .org
        │             │             │
    ┌───┴───┐     ┌───┴───┐       ...
    │       │     │       │
 google  github yandex  mail
```

### Типы DNS-серверов

| Тип | Функция | Примеры |
|-----|---------|---------|
| **Root** | Указывают на TLD серверы | a.root-servers.net ... m.root-servers.net |
| **TLD** | Управляют доменами верхнего уровня | a.gtld-servers.net (.com) |
| **Authoritative** | Хранят записи конкретных доменов | ns1.google.com |
| **Recursive** | Выполняют рекурсивные запросы | 8.8.8.8, 1.1.1.1 |

### Процесс разрешения имени

1. **Клиент** → Recursive DNS: "Какой IP у www.example.com?"
2. **Recursive** → Root: "Кто отвечает за .com?"
3. **Root** → Recursive: "Спроси a.gtld-servers.net"
4. **Recursive** → TLD (.com): "Кто отвечает за example.com?"
5. **TLD** → Recursive: "Спроси ns1.example.com"
6. **Recursive** → Authoritative: "Какой IP у www.example.com?"
7. **Authoritative** → Recursive → Клиент: "93.184.216.34"

## Типы DNS-записей

### Основные записи

| Тип | Описание | Пример |
|-----|----------|--------|
| **A** | IPv4 адрес | `example.com. A 93.184.216.34` |
| **AAAA** | IPv6 адрес | `example.com. AAAA 2606:2800:220:1::` |
| **CNAME** | Каноническое имя (алиас) | `www.example.com. CNAME example.com.` |
| **MX** | Почтовый сервер | `example.com. MX 10 mail.example.com.` |
| **NS** | Авторитетный DNS сервер | `example.com. NS ns1.example.com.` |
| **TXT** | Текстовая запись | `example.com. TXT "v=spf1 ..."` |
| **SOA** | Start of Authority | Информация о зоне |
| **PTR** | Обратная запись | `34.216.184.93.in-addr.arpa. PTR example.com.` |
| **SRV** | Сервис | `_sip._tcp.example.com. SRV 10 5 5060 sip.example.com.` |

### Формат записи

```
имя         TTL   класс  тип   данные
example.com. 3600  IN     A     93.184.216.34
```

- **TTL** — время жизни в секундах (кэширование)
- **IN** — класс Internet (всегда IN)

## DNS для безопасности

### SPF (Sender Policy Framework)

```
example.com. TXT "v=spf1 ip4:192.0.2.0/24 include:_spf.google.com -all"
```

Указывает, какие серверы могут отправлять почту от имени домена.

| Механизм | Значение |
|----------|----------|
| `ip4:` | Разрешённые IPv4 |
| `ip6:` | Разрешённые IPv6 |
| `include:` | Включить правила другого домена |
| `a` | A-запись домена |
| `mx` | MX-записи домена |
| `-all` | Отклонить остальное |
| `~all` | Мягкий отказ (softfail) |

### DKIM (DomainKeys Identified Mail)

```
selector._domainkey.example.com. TXT "v=DKIM1; k=rsa; p=MIIBIj..."
```

Публичный ключ для проверки подписи писем.

### DMARC

```
_dmarc.example.com. TXT "v=DMARC1; p=reject; rua=mailto:reports@example.com"
```

Политика обработки писем, не прошедших SPF/DKIM.

| Политика | Действие |
|----------|----------|
| `p=none` | Только мониторинг |
| `p=quarantine` | В спам |
| `p=reject` | Отклонить |

## DNS через HTTPS/TLS

### DoH (DNS over HTTPS)

```
https://dns.google/dns-query
https://cloudflare-dns.com/dns-query
https://dns.quad9.net/dns-query
```

### DoT (DNS over TLS)

Порт 853, шифрование TLS.

| Провайдер | DoH | DoT |
|-----------|-----|-----|
| Google | dns.google | dns.google:853 |
| Cloudflare | 1.1.1.1 | 1.1.1.1:853 |
| Quad9 | dns.quad9.net | dns.quad9.net:853 |

## Утилиты DNS

### nslookup

```bash
# Простой запрос
nslookup google.com

# Указать DNS сервер
nslookup google.com 8.8.8.8

# Запросить MX записи
nslookup -type=MX google.com
```

### dig

```bash
# Полный запрос
dig google.com

# Только ответ
dig +short google.com

# Конкретный тип записи
dig google.com MX

# Трассировка
dig +trace google.com

# Обратный запрос
dig -x 8.8.8.8
```

### host

```bash
host google.com
host -t MX google.com
```

## Атаки на DNS

### DNS Spoofing / Cache Poisoning

Подмена ответа DNS для перенаправления на вредоносный сервер.

**Защита:** DNSSEC, DoH/DoT

### DNS Amplification (DDoS)

Использование открытых DNS резолверов для усиления DDoS атак.

**Защита:** Rate limiting, закрытие открытых резолверов

### DNS Tunneling

Передача данных через DNS запросы для обхода файрволов.

**Защита:** Анализ аномального DNS трафика

## DNSSEC

Расширение DNS для криптографической проверки подлинности ответов.

### Типы записей DNSSEC

| Тип | Назначение |
|-----|------------|
| DNSKEY | Публичный ключ зоны |
| RRSIG | Подпись записи |
| DS | Делегирование подписи (в родительской зоне) |
| NSEC/NSEC3 | Доказательство отсутствия записи |

### Проверка DNSSEC

```bash
dig +dnssec example.com
```

## Публичные DNS серверы

| Провайдер | IPv4 | IPv6 | Особенности |
|-----------|------|------|-------------|
| Google | 8.8.8.8, 8.8.4.4 | 2001:4860:4860::8888 | Быстрый, глобальный |
| Cloudflare | 1.1.1.1, 1.0.0.1 | 2606:4700:4700::1111 | Приватность |
| Quad9 | 9.9.9.9 | 2620:fe::fe | Блокировка угроз |
| Яндекс | 77.88.8.8 | 2a02:6b8::feed:0ff | Базовый |
| Яндекс Safe | 77.88.8.88 | — | Блокировка вредоносных |
| Яндекс Family | 77.88.8.7 | — | + блокировка 18+ |

## Локальный файл hosts

Файл для локального переопределения DNS:

**Windows:** `C:\Windows\System32\drivers\etc\hosts`  
**Linux/Mac:** `/etc/hosts`

```
127.0.0.1   localhost
192.168.1.10  myserver.local
0.0.0.0   ads.example.com  # блокировка
```
