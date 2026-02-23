---
sidebar_position: 2
---

import ElGamalCipher from '@site/src/components/ciphers/ElGamalCipher';

# Шифр Эль-Гамаля (ElGamal)

**Шифр Эль-Гамаля** — асимметричная криптосистема, основанная на сложности вычисления дискретного логарифма.

## История

Разработан египетско-американским криптографом **Тахером Эль-Гамалем** в 1985 году. Используется в PGP и GnuPG.

## Математическая основа

### Проблема дискретного логарифма (DLP)

В конечной группе найти x из уравнения:
```
gˣ ≡ y (mod p)
```
вычислительно сложно при больших p.

## Генерация ключей

1. Выбрать большое простое **p**
2. Найти генератор **g** (примитивный корень mod p)
3. Выбрать случайное **x** (приватный ключ): 1 < x < p-1
4. Вычислить **y = gˣ mod p** (публичный ключ)

| Ключ | Компоненты |
|------|------------|
| **Публичный** | (p, g, y) |
| **Приватный** | x |

## Шифрование

Для сообщения **m** (0 < m < p):

1. Выбрать случайное **k**: 1 < k < p-1, НОД(k, p-1) = 1
2. Вычислить **a = gᵏ mod p**
3. Вычислить **b = m × yᵏ mod p**
4. Шифротекст: **(a, b)**

```
a = gᵏ mod p
b = m × yᵏ mod p
```

## Дешифрование

Имея шифротекст (a, b) и приватный ключ x:

```
m = b × (aˣ)⁻¹ mod p
```

### Почему это работает?

```
aˣ = (gᵏ)ˣ = gᵏˣ = (gˣ)ᵏ = yᵏ

b × (aˣ)⁻¹ = m × yᵏ × (yᵏ)⁻¹ = m
```

## Интерактивный калькулятор

<ElGamalCipher />

## Реализация на Python

```python
import random
from math import gcd

def is_primitive_root(g: int, p: int) -> bool:
    """Проверка, является ли g примитивным корнем mod p"""
    if pow(g, p - 1, p) != 1:
        return False
    
    # Проверяем, что g^((p-1)/q) != 1 для всех простых делителей q
    phi = p - 1
    factors = prime_factors(phi)
    
    for q in factors:
        if pow(g, phi // q, p) == 1:
            return False
    
    return True

def prime_factors(n: int) -> set:
    """Простые делители числа"""
    factors = set()
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.add(d)
            n //= d
        d += 1
    if n > 1:
        factors.add(n)
    return factors

def find_primitive_root(p: int) -> int:
    """Поиск примитивного корня mod p"""
    for g in range(2, p):
        if is_primitive_root(g, p):
            return g
    return None

def generate_keypair(bits: int = 256):
    """Генерация ключей Эль-Гамаля"""
    # Генерируем безопасное простое p = 2q + 1
    while True:
        q = random.getrandbits(bits - 1) | (1 << bits - 2) | 1
        p = 2 * q + 1
        if is_prime(p) and is_prime(q):
            break
    
    # Находим генератор
    g = find_primitive_root(p)
    
    # Приватный и публичный ключи
    x = random.randrange(2, p - 1)
    y = pow(g, x, p)
    
    return {
        'public': (p, g, y),
        'private': x
    }

def elgamal_encrypt(message: int, public_key: tuple) -> tuple:
    """Шифрование Эль-Гамаля"""
    p, g, y = public_key
    
    if message >= p:
        raise ValueError("Сообщение должно быть меньше p")
    
    # Выбираем случайное k
    while True:
        k = random.randrange(2, p - 1)
        if gcd(k, p - 1) == 1:
            break
    
    a = pow(g, k, p)
    b = (message * pow(y, k, p)) % p
    
    return (a, b)

def elgamal_decrypt(ciphertext: tuple, private_key: int, p: int) -> int:
    """Дешифрование Эль-Гамаля"""
    a, b = ciphertext
    
    # s = a^x mod p
    s = pow(a, private_key, p)
    
    # s^(-1) mod p
    s_inv = pow(s, p - 2, p)  # По малой теореме Ферма
    
    # m = b * s^(-1) mod p
    return (b * s_inv) % p

def is_prime(n: int, k: int = 10) -> bool:
    """Тест Миллера-Рабина"""
    if n < 2:
        return False
    if n == 2 or n == 3:
        return True
    if n % 2 == 0:
        return False
    
    r, d = 0, n - 1
    while d % 2 == 0:
        r += 1
        d //= 2
    
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

# Пример использования
keys = generate_keypair(64)  # Для демонстрации

p, g, y = keys['public']
x = keys['private']

print(f"p = {p}")
print(f"g = {g}")
print(f"Публичный y = {y}")
print(f"Приватный x = {x}")

message = 42
ciphertext = elgamal_encrypt(message, keys['public'])
decrypted = elgamal_decrypt(ciphertext, keys['private'], p)

print(f"\nСообщение: {message}")
print(f"Шифротекст (a, b): {ciphertext}")
print(f"Расшифровано: {decrypted}")
```

## Особенности

### Недетерминированность

Каждое шифрование использует случайное k, поэтому одно сообщение даёт разные шифротексты:

```python
# Одно сообщение — разные шифротексты
c1 = elgamal_encrypt(42, public_key)  # (a1, b1)
c2 = elgamal_encrypt(42, public_key)  # (a2, b2) ≠ (a1, b1)
```

### Расширение шифротекста

Шифротекст в 2 раза больше открытого текста:
- Вход: m (одно число)
- Выход: (a, b) (два числа того же размера)

## Схема подписи Эль-Гамаля

ElGamal также используется для цифровых подписей:

```python
def elgamal_sign(message_hash: int, private_key: int, p: int, g: int) -> tuple:
    """Создание подписи Эль-Гамаля"""
    while True:
        k = random.randrange(2, p - 1)
        if gcd(k, p - 1) == 1:
            break
    
    r = pow(g, k, p)
    k_inv = pow(k, -1, p - 1)
    s = (k_inv * (message_hash - private_key * r)) % (p - 1)
    
    return (r, s)

def elgamal_verify(message_hash: int, signature: tuple, public_key: tuple) -> bool:
    """Проверка подписи"""
    p, g, y = public_key
    r, s = signature
    
    if not (0 < r < p):
        return False
    
    left = (pow(y, r, p) * pow(r, s, p)) % p
    right = pow(g, message_hash, p)
    
    return left == right
```

## Сравнение с RSA

| Аспект | RSA | ElGamal |
|--------|-----|---------|
| Основа | Факторизация | Дискретный логарифм |
| Шифротекст | 1× размер | 2× размер |
| Детерминизм | Да (без паддинга) | Нет |
| Скорость | Быстрее | Медленнее |

## DSA и ECDSA

Схема подписи Эль-Гамаля стала основой для:

- **DSA** (Digital Signature Algorithm) — стандарт NIST
- **ECDSA** — версия на эллиптических кривых

:::info Практическое использование
ElGamal редко используется напрямую для шифрования из-за расширения. Чаще применяется гибридный подход: ElGamal шифрует симметричный ключ, а данные шифруются AES.
:::
