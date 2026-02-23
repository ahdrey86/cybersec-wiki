---
sidebar_position: 1
---

import RSACipher from '@site/src/components/ciphers/RSACipher';

# RSA (Rivest–Shamir–Adleman)

**RSA** — первая практическая криптосистема с открытым ключом, основанная на сложности факторизации больших чисел.

## История

- **1977** — Рон Ривест, Ади Шамир и Леонард Адлеман опубликовали RSA
- **1997** — Срок патента истёк, алгоритм стал свободным
- **Сегодня** — Широко используется в TLS, SSH, PGP

## Генерация ключей

### Алгоритм

1. Выбрать два больших простых числа **p** и **q**
2. Вычислить **n = p × q** (модуль)
3. Вычислить **φ(n) = (p-1)(q-1)** (функция Эйлера)
4. Выбрать **e**: 1 < e < φ(n), НОД(e, φ(n)) = 1
5. Вычислить **d = e⁻¹ mod φ(n)** (обратный элемент)

### Ключи

| Ключ | Компоненты | Использование |
|------|------------|---------------|
| **Публичный** | (n, e) | Шифрование, проверка подписи |
| **Приватный** | (n, d) | Расшифрование, создание подписи |

## Шифрование и дешифрование

```
Шифрование:  C = Mᵉ mod n
Дешифрование: M = Cᵈ mod n
```

### Почему это работает?

По теореме Эйлера, если НОД(M, n) = 1:
```
M^φ(n) ≡ 1 (mod n)
```

Поскольку e × d ≡ 1 (mod φ(n)), то e × d = 1 + k × φ(n):
```
Cᵈ = (Mᵉ)ᵈ = M^(ed) = M^(1 + k×φ(n)) = M × (M^φ(n))^k ≡ M × 1^k ≡ M (mod n)
```

## Интерактивный калькулятор

<RSACipher />

## Реализация на Python

```python
import random
from math import gcd

def is_prime(n: int, k: int = 10) -> bool:
    """Тест Миллера-Рабина на простоту"""
    if n < 2:
        return False
    if n == 2 or n == 3:
        return True
    if n % 2 == 0:
        return False
    
    # n-1 = 2^r × d
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    
    # k раундов теста
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = pow(a, d, n)
        
        if x == 1 or x == n - 1:
            continue
        
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    
    return True

def generate_prime(bits: int) -> int:
    """Генерация случайного простого числа"""
    while True:
        p = random.getrandbits(bits) | (1 << bits - 1) | 1
        if is_prime(p):
            return p

def mod_inverse(e: int, phi: int) -> int:
    """Расширенный алгоритм Евклида"""
    def extended_gcd(a, b):
        if a == 0:
            return b, 0, 1
        gcd_val, x1, y1 = extended_gcd(b % a, a)
        return gcd_val, y1 - (b // a) * x1, x1
    
    _, x, _ = extended_gcd(e % phi, phi)
    return (x % phi + phi) % phi

def generate_keypair(bits: int = 1024):
    """Генерация пары ключей RSA"""
    p = generate_prime(bits // 2)
    q = generate_prime(bits // 2)
    
    n = p * q
    phi = (p - 1) * (q - 1)
    
    # Стандартное значение e
    e = 65537
    while gcd(e, phi) != 1:
        e += 2
    
    d = mod_inverse(e, phi)
    
    return {
        'public': (n, e),
        'private': (n, d),
        'p': p,
        'q': q
    }

def rsa_encrypt(message: int, public_key: tuple) -> int:
    """Шифрование RSA"""
    n, e = public_key
    if message >= n:
        raise ValueError("Сообщение должно быть меньше n")
    return pow(message, e, n)

def rsa_decrypt(ciphertext: int, private_key: tuple) -> int:
    """Дешифрование RSA"""
    n, d = private_key
    return pow(ciphertext, d, n)

# Пример использования
keys = generate_keypair(512)  # Для демонстрации, реально используйте 2048+

print(f"p = {keys['p']}")
print(f"q = {keys['q']}")
print(f"n = {keys['public'][0]}")
print(f"e = {keys['public'][1]}")
print(f"d = {keys['private'][1]}")

message = 12345
encrypted = rsa_encrypt(message, keys['public'])
decrypted = rsa_decrypt(encrypted, keys['private'])

print(f"\nСообщение: {message}")
print(f"Зашифровано: {encrypted}")
print(f"Расшифровано: {decrypted}")
```

## Безопасность

### Рекомендуемые размеры ключей

| Год | Минимум | Рекомендуется |
|-----|---------|---------------|
| 2020 | 2048 бит | 3072+ бит |
| 2030+ | 3072 бит | 4096+ бит |

### Атаки

| Атака | Описание | Защита |
|-------|----------|--------|
| Факторизация n | Разложение n на p и q | Большие ключи |
| Малая экспонента | Атака Coppersmith при малом e | e = 65537 |
| Timing attack | Анализ времени выполнения | Константное время |
| Padding Oracle | Утечка при неправильном паддинге | OAEP |

### PKCS#1 Padding

Сырой RSA уязвим, поэтому используется паддинг:

```
Для шифрования: RSAES-OAEP
Для подписей:   RSASSA-PSS
```

## Цифровая подпись

RSA также используется для подписей:

```python
def rsa_sign(message_hash: int, private_key: tuple) -> int:
    """Создание подписи"""
    return rsa_decrypt(message_hash, private_key)

def rsa_verify(message_hash: int, signature: int, public_key: tuple) -> bool:
    """Проверка подписи"""
    decrypted = rsa_encrypt(signature, public_key)
    return decrypted == message_hash
```

## RSA vs Эллиптические кривые

| Параметр | RSA-3072 | ECDSA P-256 |
|----------|----------|-------------|
| Размер ключа | 3072 бит | 256 бит |
| Размер подписи | 3072 бит | 512 бит |
| Скорость | Медленнее | Быстрее |
| Квантовая стойкость | Нет | Нет |

:::warning Квантовая угроза
Алгоритм Шора позволяет квантовому компьютеру факторизовать числа за полиномиальное время. RSA станет небезопасным при появлении достаточно мощных квантовых компьютеров.
:::
