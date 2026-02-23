---
sidebar_position: 3
---

import CaesarCipher from '@site/src/components/ciphers/CaesarCipher';

# Шифр Цезаря

**Шифр Цезаря** — один из древнейших шифров, в котором каждая буква сдвигается на фиксированное число позиций в алфавите.

## История

Назван в честь Юлия Цезаря, который использовал этот шифр для секретной переписки с генералами. По свидетельству Светония, Цезарь использовал сдвиг на 3 позиции.

> *«Если было что-либо конфиденциальное, он писал шифром, изменяя порядок букв так, чтобы нельзя было составить ни одного слова»*
> — Светоний, «Жизнь двенадцати цезарей»

## Принцип работы

### Сдвиг на 3 (классический)

```
Исходный:  А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я
Замена:    Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я А Б В
```

### Английский алфавит (сдвиг 3)

```
Исходный:  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Замена:    D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
```

## Математическое описание

**Шифрование:**

```
E(x) = (x + k) mod n
```

**Дешифрование:**

```
D(x) = (x - k) mod n
```

где:
- x — позиция буквы в алфавите (0, 1, 2, ...)
- k — ключ (величина сдвига)
- n — размер алфавита (33 для русского, 26 для английского)

## Параметры

| Параметр | Значение |
|----------|----------|
| Размер ключа | 1-32 (русский) / 1-25 (английский) |
| Пространство ключей | 32 / 25 вариантов |
| Тип | Моноалфавитная замена |

## Примеры

### Русский текст (сдвиг 3)

```
Исходный:    КРИПТОГРАФИЯ
Зашифрованный: НУЛТХСЁУГЧЛВ
```

### Английский текст (сдвиг 3)

```
Исходный:    HELLO WORLD
Зашифрованный: KHOOR ZRUOG
```

## ROT13 — частный случай

**ROT13** (rotate by 13) — шифр Цезаря со сдвигом 13 для английского алфавита.

```
A↔N  B↔O  C↔P  D↔Q  E↔R  F↔S  G↔T
H↔U  I↔V  J↔W  K↔X  L↔Y  M↔Z
```

:::info Особенность ROT13
Поскольку английский алфавит содержит 26 букв, ROT13 является инволюцией — двойное применение возвращает исходный текст.
:::

## Интерактивный шифратор

<CaesarCipher />

## Реализация на Python

```python
def caesar_encrypt(text: str, shift: int, alphabet: str) -> str:
    """Шифрование шифром Цезаря"""
    n = len(alphabet)
    result = []
    
    for char in text.upper():
        if char in alphabet:
            index = alphabet.index(char)
            new_index = (index + shift) % n
            result.append(alphabet[new_index])
        else:
            result.append(char)
    
    return ''.join(result)

def caesar_decrypt(text: str, shift: int, alphabet: str) -> str:
    """Дешифрование шифром Цезаря"""
    return caesar_encrypt(text, -shift, alphabet)

# Алфавиты
RU_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
EN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

# Примеры
text = "КРИПТОГРАФИЯ"
encrypted = caesar_encrypt(text, 3, RU_ALPHABET)
decrypted = caesar_decrypt(encrypted, 3, RU_ALPHABET)

print(f"Исходный: {text}")
print(f"Зашифрованный: {encrypted}")
print(f"Расшифрованный: {decrypted}")
```

## Криптоанализ

### Метод грубой силы (Brute Force)

Всего 32 возможных ключа для русского алфавита — перебор занимает секунды:

```python
def caesar_bruteforce(ciphertext: str, alphabet: str):
    """Перебор всех возможных ключей"""
    n = len(alphabet)
    
    for shift in range(n):
        decrypted = caesar_decrypt(ciphertext, shift, alphabet)
        print(f"Сдвиг {shift:2d}: {decrypted}")
```

### Частотный анализ

1. Подсчитать частоту каждой буквы в шифротексте
2. Найти самую частую букву
3. Предположить, что это «О» (самая частая в русском)
4. Вычислить сдвиг

```python
def frequency_analysis(ciphertext: str, alphabet: str) -> dict:
    """Частотный анализ текста"""
    freq = {char: 0 for char in alphabet}
    total = 0
    
    for char in ciphertext.upper():
        if char in alphabet:
            freq[char] += 1
            total += 1
    
    # Перевод в проценты
    return {k: (v / total * 100) for k, v in freq.items()}
```

:::warning Безопасность
Шифр Цезаря **не обеспечивает реальной защиты**. Взлом занимает секунды даже вручную.
:::

## Варианты усложнения

| Вариант | Описание | Улучшение |
|---------|----------|-----------|
| Переменный сдвиг | Разный сдвиг для позиций | → Виженер |
| Нелинейная замена | Произвольная перестановка | → Простая замена |
| Несколько проходов | Многократное шифрование | Минимальное |
