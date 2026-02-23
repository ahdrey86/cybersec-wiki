---
sidebar_position: 5
---

import BelasoCipher from '@site/src/components/ciphers/BelasoCipher';

# Шифр Белазо

**Шифр Белазо** — полиалфавитный шифр, использующий ключевое слово для определения сдвигов. Предшественник знаменитого шифра Виженера.

## История

Изобретён итальянским криптографом **Джованни Баттиста Белазо** в 1553 году. Белазо первым предложил использовать **ключевое слово** (la cifra del Sig. Giovan Battista Belaso) вместо фиксированного или прогрессивного сдвига.

## Принцип работы

1. Выбирается **ключевое слово**
2. Ключ повторяется до длины сообщения
3. Каждая буква ключа задаёт сдвиг для соответствующей буквы текста

### Схема шифрования

```
Открытый текст:  К Р И П Т О Г Р А Ф И Я
Ключ (КЛЮЧ):     К Л Ю Ч К Л Ю Ч К Л Ю Ч
Сдвиги:         10 11 31 23 10 11 31 23 10 11 31 23
Шифротекст:      Ц Ы Ж Н Ю Ы Ю Н Л Б Ж Ш
```

### Вычисление сдвига

Позиция буквы ключа в алфавите = величина сдвига:
- К = 10 (А=0, Б=1, В=2, ... К=10)
- Л = 11
- Ю = 31
- Ч = 23

## Математическое описание

**Шифрование:**

```
E(pᵢ) = (pᵢ + k[i mod m]) mod n
```

**Дешифрование:**

```
D(cᵢ) = (cᵢ - k[i mod m]) mod n
```

где:
- pᵢ — буква открытого текста
- k — буквы ключа
- m — длина ключа
- n — размер алфавита

## Параметры

| Параметр | Значение |
|----------|----------|
| Ключ | Слово или фраза |
| Тип | Полиалфавитный |
| Период | Длина ключа |
| Пространство ключей | n^m (огромное при длинном ключе) |

## Интерактивный шифратор

<BelasoCipher />

## Реализация на Python

```python
def belaso_encrypt(text: str, key: str, alphabet: str) -> str:
    """Шифрование шифром Белазо"""
    n = len(alphabet)
    key = key.upper()
    result = []
    key_index = 0
    
    for char in text.upper():
        if char in alphabet:
            # Позиция буквы текста
            text_pos = alphabet.index(char)
            # Позиция буквы ключа = сдвиг
            key_char = key[key_index % len(key)]
            shift = alphabet.index(key_char)
            # Шифрование
            new_pos = (text_pos + shift) % n
            result.append(alphabet[new_pos])
            key_index += 1
        else:
            result.append(char)
    
    return ''.join(result)

def belaso_decrypt(text: str, key: str, alphabet: str) -> str:
    """Дешифрование шифром Белазо"""
    n = len(alphabet)
    key = key.upper()
    result = []
    key_index = 0
    
    for char in text.upper():
        if char in alphabet:
            text_pos = alphabet.index(char)
            key_char = key[key_index % len(key)]
            shift = alphabet.index(key_char)
            # Дешифрование (обратный сдвиг)
            new_pos = (text_pos - shift) % n
            result.append(alphabet[new_pos])
            key_index += 1
        else:
            result.append(char)
    
    return ''.join(result)

# Алфавиты
RU_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
EN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

# Пример
text = "КРИПТОГРАФИЯ"
key = "КЛЮЧ"
encrypted = belaso_encrypt(text, key, RU_ALPHABET)
decrypted = belaso_decrypt(encrypted, key, RU_ALPHABET)

print(f"Исходный: {text}")
print(f"Ключ: {key}")
print(f"Зашифрованный: {encrypted}")
print(f"Расшифрованный: {decrypted}")
```

## Пример пошагового шифрования

```python
def belaso_step_by_step(text: str, key: str, alphabet: str):
    """Пошаговое шифрование с выводом"""
    n = len(alphabet)
    key = key.upper()
    text = text.upper()
    
    print(f"{'Символ':<8} {'Ключ':<8} {'Сдвиг':<8} {'Результат':<8}")
    print("-" * 35)
    
    result = []
    key_index = 0
    
    for char in text:
        if char in alphabet:
            text_pos = alphabet.index(char)
            key_char = key[key_index % len(key)]
            shift = alphabet.index(key_char)
            new_pos = (text_pos + shift) % n
            new_char = alphabet[new_pos]
            
            print(f"{char:<8} {key_char:<8} {shift:<8} {new_char:<8}")
            result.append(new_char)
            key_index += 1
        else:
            result.append(char)
    
    return ''.join(result)
```

**Вывод:**
```
Символ   Ключ     Сдвиг    Результат
-----------------------------------
К        К        10       Ц       
Р        Л        11       Ы       
И        Ю        31       Ж       
П        Ч        23       Н       
Т        К        10       Ю       
О        Л        11       Ы       
Г        Ю        31       Ю       
Р        Ч        23       Н       
А        К        10       Л       
Ф        Л        11       Б       
И        Ю        31       Ж       
Я        Ч        23       Ш       
```

## Криптоанализ

### Метод Касиски (адаптированный)

1. Найти повторяющиеся последовательности в шифротексте
2. Измерить расстояния между повторениями
3. НОД расстояний ≈ длина ключа
4. Разбить текст на группы по модулю длины ключа
5. Применить частотный анализ к каждой группе

### Индекс совпадений

```
IC = Σ fᵢ(fᵢ - 1) / N(N-1)
```

- Для случайного текста: IC ≈ 0.038
- Для русского языка: IC ≈ 0.053
- Для английского: IC ≈ 0.067

## Отличие от Виженера

| Аспект | Белазо | Виженер |
|--------|--------|---------|
| Год | 1553 | 1586 |
| Авторство названия | Оригинал | Ошибочно приписан |
| Tabula recta | Использует | Использует |
| Популярность | Малоизвестен | Очень известен |

:::info Историческая справка
Шифр Виженера фактически является развитием идеи Белазо. Блез де Виженер добавил концепцию **автоключа**, но его имя ошибочно закрепилось за более простым вариантом.
:::

## Рекомендации по ключу

| Характеристика | Плохо | Хорошо |
|----------------|-------|--------|
| Длина | Короткий (3-4) | Длинный (10+) |
| Содержание | Словарное слово | Случайная фраза |
| Повторы | С повторами | Без повторов |

```python
# Плохие ключи
bad_keys = ["КОТ", "ПАРОЛЬ", "ААААА"]

# Хорошие ключи
good_keys = ["ЖЁЛТЫЙСЛОН42", "КРТМНВЧЩ", "ФРАЗАИЗКНИГИ"]
```
