---
sidebar_position: 6
---

import VigenereCipher from '@site/src/components/ciphers/VigenereCipher';

# Шифр Виженера

**Шифр Виженера** — классический полиалфавитный шифр, который почти 300 лет считался «неразгадываемым» (*le chiffre indéchiffrable*).

## История

- **1553** — Джованни Белазо описал базовую идею
- **1586** — Блез де Виженер опубликовал усовершенствованную версию с автоключом
- **1863** — Фридрих Касиски опубликовал метод взлома
- **1920-е** — Шифр окончательно признан небезопасным

:::tip Исторический парадокс
Шифр назван в честь Виженера, хотя он развивал идеи Белазо и Тритемия. Сам Виженер предпочитал более сложный вариант с автоключом.
:::

## Tabula Recta (Квадрат Виженера)

```
    А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я
   ┌──────────────────────────────────────────────────────────────────
 А │ А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я
 Б │ Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я А
 В │ В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я А Б
 Г │ Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я А Б В
 ...
 Я │ Я А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю
```

**Использование:**
1. Найти строку по букве ключа
2. Найти столбец по букве текста
3. На пересечении — зашифрованная буква

## Принцип работы

### Алгоритм шифрования

```
Открытый текст:  С Е К Р Е Т Н А Я   И Н Ф О Р М А Ц И Я
Ключ (ШИФР):     Ш И Ф Р Ш И Ф Р Ш   И Ф Р Ш И Ф Р Ш И Ф
Шифротекст:      М Н Ю И Ю Ы Г Р Я   С Г Ж Ж Ш Б Р О Р Ю
```

### Математическое описание

**Шифрование:**

```
Cᵢ = (Pᵢ + K[i mod m]) mod n
```

**Дешифрование:**

```
Pᵢ = (Cᵢ - K[i mod m]) mod n
```

где:
- Pᵢ — буква открытого текста
- Cᵢ — буква шифротекста
- K — буквы ключа
- m — длина ключа
- n — размер алфавита (33 для русского)

## Параметры

| Параметр | Значение |
|----------|----------|
| Тип | Полиалфавитная замена |
| Ключ | Слово или фраза |
| Период | Длина ключа |
| Пространство ключей | 33^m (русский) / 26^m (английский) |

## Интерактивный шифратор

<VigenereCipher />

## Реализация на Python

```python
class VigenereCipher:
    """Шифр Виженера с поддержкой русского и английского алфавитов"""
    
    RU_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
    EN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    def __init__(self, key: str, alphabet: str = None):
        self.key = key.upper()
        
        # Автоопределение алфавита
        if alphabet:
            self.alphabet = alphabet
        elif any(c in self.RU_ALPHABET for c in self.key):
            self.alphabet = self.RU_ALPHABET
        else:
            self.alphabet = self.EN_ALPHABET
        
        self.n = len(self.alphabet)
    
    def encrypt(self, plaintext: str) -> str:
        """Шифрование"""
        result = []
        key_index = 0
        
        for char in plaintext.upper():
            if char in self.alphabet:
                p = self.alphabet.index(char)
                k = self.alphabet.index(self.key[key_index % len(self.key)])
                c = (p + k) % self.n
                result.append(self.alphabet[c])
                key_index += 1
            else:
                result.append(char)
        
        return ''.join(result)
    
    def decrypt(self, ciphertext: str) -> str:
        """Дешифрование"""
        result = []
        key_index = 0
        
        for char in ciphertext.upper():
            if char in self.alphabet:
                c = self.alphabet.index(char)
                k = self.alphabet.index(self.key[key_index % len(self.key)])
                p = (c - k) % self.n
                result.append(self.alphabet[p])
                key_index += 1
            else:
                result.append(char)
        
        return ''.join(result)

# Пример использования
cipher = VigenereCipher("ШИФР")
plaintext = "СЕКРЕТНАЯ ИНФОРМАЦИЯ"
encrypted = cipher.encrypt(plaintext)
decrypted = cipher.decrypt(encrypted)

print(f"Открытый текст: {plaintext}")
print(f"Ключ: ШИФР")
print(f"Шифротекст: {encrypted}")
print(f"Расшифровано: {decrypted}")
```

## Визуализация процесса

```python
def visualize_vigenere(text: str, key: str, alphabet: str):
    """Визуализация шифрования"""
    n = len(alphabet)
    key = key.upper()
    text = text.upper()
    
    print("┌" + "─" * 60 + "┐")
    print(f"│ {'Поз':^4} │ {'Текст':^6} │ {'Ключ':^6} │ {'P':^4} │ {'K':^4} │ {'C':^4} │ {'Рез':^6} │")
    print("├" + "─" * 60 + "┤")
    
    key_idx = 0
    for i, char in enumerate(text):
        if char in alphabet:
            p = alphabet.index(char)
            k_char = key[key_idx % len(key)]
            k = alphabet.index(k_char)
            c = (p + k) % n
            result = alphabet[c]
            
            print(f"│ {i:^4} │ {char:^6} │ {k_char:^6} │ {p:^4} │ {k:^4} │ {c:^4} │ {result:^6} │")
            key_idx += 1
    
    print("└" + "─" * 60 + "┘")
```

## Криптоанализ

### Метод Касиски (1863)

**Идея:** Повторяющиеся последовательности в открытом тексте, зашифрованные одной и той же частью ключа, дают одинаковые последовательности в шифротексте.

**Алгоритм:**
1. Найти все повторяющиеся подстроки (≥3 символов)
2. Измерить расстояния между повторениями
3. Найти НОД всех расстояний — это вероятная длина ключа

```python
import re
from math import gcd
from functools import reduce

def kasiski_examination(ciphertext: str, min_length: int = 3) -> list:
    """Метод Касиски для определения длины ключа"""
    ciphertext = ''.join(c for c in ciphertext.upper() if c.isalpha())
    
    # Найти повторяющиеся подстроки
    sequences = {}
    for length in range(min_length, len(ciphertext) // 2):
        for i in range(len(ciphertext) - length):
            seq = ciphertext[i:i + length]
            if seq in sequences:
                sequences[seq].append(i)
            else:
                sequences[seq] = [i]
    
    # Вычислить расстояния
    distances = []
    for seq, positions in sequences.items():
        if len(positions) > 1:
            for i in range(len(positions) - 1):
                distances.append(positions[i + 1] - positions[i])
    
    # Найти возможные длины ключа
    if distances:
        key_length = reduce(gcd, distances)
        return key_length, distances
    
    return None, []
```

### Индекс совпадений

**Индекс совпадений (IC)** — вероятность того, что две случайно выбранные буквы текста совпадут.

```
IC = Σ fᵢ(fᵢ - 1) / N(N-1)
```

| Язык | IC |
|------|-----|
| Русский | 0.0553 |
| Английский | 0.0667 |
| Случайный | 0.0385 (1/26) |

```python
def index_of_coincidence(text: str, alphabet: str) -> float:
    """Вычисление индекса совпадений"""
    text = ''.join(c for c in text.upper() if c in alphabet)
    n = len(text)
    
    if n <= 1:
        return 0
    
    freq = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    
    ic = sum(f * (f - 1) for f in freq.values()) / (n * (n - 1))
    return ic
```

### Определение длины ключа по IC

```python
def find_key_length(ciphertext: str, alphabet: str, max_length: int = 20) -> int:
    """Определение длины ключа по индексу совпадений"""
    text = ''.join(c for c in ciphertext.upper() if c in alphabet)
    
    results = []
    for key_len in range(1, max_length + 1):
        # Разбить текст на группы
        groups = ['' for _ in range(key_len)]
        for i, char in enumerate(text):
            groups[i % key_len] += char
        
        # Средний IC по группам
        avg_ic = sum(index_of_coincidence(g, alphabet) for g in groups) / key_len
        results.append((key_len, avg_ic))
    
    # Найти длину с IC ближайшим к естественному
    target_ic = 0.055  # для русского
    best = min(results, key=lambda x: abs(x[1] - target_ic))
    
    return best[0]
```

### Восстановление ключа

После определения длины — частотный анализ каждой группы:

```python
def recover_key(ciphertext: str, key_length: int, alphabet: str) -> str:
    """Восстановление ключа частотным анализом"""
    text = ''.join(c for c in ciphertext.upper() if c in alphabet)
    
    # Самые частые буквы русского алфавита
    frequent_ru = 'ОЕАИНТ'
    
    key = []
    for i in range(key_length):
        # Извлечь i-ю группу
        group = text[i::key_length]
        
        # Найти самую частую букву
        freq = {}
        for c in group:
            freq[c] = freq.get(c, 0) + 1
        
        most_common = max(freq, key=freq.get)
        
        # Предположить, что это 'О'
        shift = (alphabet.index(most_common) - alphabet.index('О')) % len(alphabet)
        key.append(alphabet[shift])
    
    return ''.join(key)
```

## Варианты шифра

### Автоключ Виженера

Ключ = начальное слово + открытый текст:

```
Текст:   С Е К Р Е Т Н А Я   И Н Ф О
Ключ:    К Л Ю Ч С Е К Р Е   Т Н А Я
```

### Бегущий ключ

Ключ = текст из книги (длинный, осмысленный).

## Сравнение стойкости

| Шифр | Длина ключа | Стойкость | Взлом |
|------|-------------|-----------|-------|
| Цезарь | 1 | 25 вариантов | Мгновенно |
| Виженер (короткий) | 3-5 | 26^5 ≈ 12 млн | Минуты |
| Виженер (длинный) | 20+ | 26^20 | Часы-дни |
| Одноразовый блокнот | = тексту | Абсолютная | Невозможно |

:::warning Современная безопасность
Шифр Виженера **не обеспечивает защиты** против современных методов. Используйте AES, ChaCha20 или другие современные алгоритмы.
:::
