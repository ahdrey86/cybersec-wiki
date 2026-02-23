---
sidebar_position: 4
---

import TritemiusCipher from '@site/src/components/ciphers/TritemiusCipher';

# Шифр Тритемия

**Шифр Тритемия** — первый полиалфавитный шифр, где сдвиг прогрессивно увеличивается с каждой буквой.

## История

Изобретён немецким аббатом **Иоганном Тритемием** (1462-1516) и описан в книге *«Полиграфия»* (1508). Тритемий также создал знаменитую **tabula recta** — таблицу, ставшую основой для многих последующих шифров.

## Tabula Recta

Квадратная таблица, где каждая строка — алфавит, сдвинутый на одну позицию:

```
    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
   ┌─────────────────────────────────────────────────────
 0 │ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
 1 │ B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
 2 │ C D E F G H I J K L M N O P Q R S T U V W X Y Z A B
 3 │ D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
 4 │ E F G H I J K L M N O P Q R S T U V W X Y Z A B C D
 5 │ F G H I J K L M N O P Q R S T U V W X Y Z A B C D E
 ...
25 │ Z A B C D E F G H I J K L M N O P Q R S T U V W X Y
```

## Принцип работы

1. **Первая буква** — сдвиг 0 (без изменения)
2. **Вторая буква** — сдвиг 1
3. **Третья буква** — сдвиг 2
4. И так далее...

### Формула

**Шифрование:**

```
E(xᵢ) = (xᵢ + i) mod n
```

**Дешифрование:**

```
D(yᵢ) = (yᵢ - i) mod n
```

где i — позиция буквы в тексте (начиная с 0).

## Пример шифрования

```
Позиция:     0  1  2  3  4  5  6  7  8  9 10 11
Исходный:    К  Р  И  П  Т  О  Г  Р  А  Ф  И  Я
Сдвиг:       0  1  2  3  4  5  6  7  8  9 10 11
Результат:   К  С  Л  Ф  Ш  У  Й  Ш  К  А  Ф  Л
```

**Проверка первых букв:**
- К (10) + 0 = 10 → К
- Р (17) + 1 = 18 → С
- И (9) + 2 = 11 → Л

## Параметры

| Параметр | Значение |
|----------|----------|
| Ключ | Отсутствует (или начальный сдвиг) |
| Тип | Полиалфавитный |
| Период | Равен длине алфавита |
| Стойкость | Низкая |

## Интерактивный шифратор

<TritemiusCipher />

## Реализация на Python

```python
def tritemius_encrypt(text: str, alphabet: str) -> str:
    """Шифрование шифром Тритемия"""
    n = len(alphabet)
    result = []
    position = 0
    
    for char in text.upper():
        if char in alphabet:
            index = alphabet.index(char)
            # Сдвиг равен позиции буквы в тексте
            new_index = (index + position) % n
            result.append(alphabet[new_index])
            position += 1
        else:
            result.append(char)
    
    return ''.join(result)

def tritemius_decrypt(text: str, alphabet: str) -> str:
    """Дешифрование шифром Тритемия"""
    n = len(alphabet)
    result = []
    position = 0
    
    for char in text.upper():
        if char in alphabet:
            index = alphabet.index(char)
            # Обратный сдвиг
            new_index = (index - position) % n
            result.append(alphabet[new_index])
            position += 1
        else:
            result.append(char)
    
    return ''.join(result)

# Алфавиты
RU_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
EN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

# Пример
text = "КРИПТОГРАФИЯ"
encrypted = tritemius_encrypt(text, RU_ALPHABET)
decrypted = tritemius_decrypt(encrypted, RU_ALPHABET)

print(f"Исходный: {text}")
print(f"Зашифрованный: {encrypted}")
print(f"Расшифрованный: {decrypted}")
```

## Модификации

### С начальным сдвигом

Добавление начального сдвига s:

```
E(xᵢ) = (xᵢ + i + s) mod n
```

```python
def tritemius_with_shift(text: str, alphabet: str, initial_shift: int) -> str:
    """Тритемий с начальным сдвигом"""
    n = len(alphabet)
    result = []
    position = 0
    
    for char in text.upper():
        if char in alphabet:
            index = alphabet.index(char)
            new_index = (index + position + initial_shift) % n
            result.append(alphabet[new_index])
            position += 1
        else:
            result.append(char)
    
    return ''.join(result)
```

### С шагом

Изменение шага прогрессии:

```
E(xᵢ) = (xᵢ + i × step) mod n
```

## Криптоанализ

### Уязвимости

1. **Нет секретного ключа** — алгоритм полностью детерминирован
2. **Известный период** — сдвиги повторяются каждые n символов
3. **Предсказуемая прогрессия** — зная одну букву, можно вычислить сдвиг

### Метод взлома

```python
def crack_tritemius(ciphertext: str, alphabet: str) -> str:
    """Взлом шифра Тритемия (ключа нет, просто расшифровываем)"""
    return tritemius_decrypt(ciphertext, alphabet)
```

:::tip Историческое значение
Несмотря на слабость, шифр Тритемия заложил основу для более стойких полиалфавитных шифров — Белазо и Виженера.
:::

## Сравнение с Цезарем

| Аспект | Цезарь | Тритемий |
|--------|--------|----------|
| Тип | Моноалфавитный | Полиалфавитный |
| Сдвиг | Постоянный | Прогрессивный |
| Частотный анализ | Напрямую применим | Затруднён |
| Ключ | Есть (число) | Нет |
