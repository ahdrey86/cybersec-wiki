---
sidebar_position: 8
---

import PlayfairCipher from '@site/src/components/ciphers/PlayfairCipher';

# Шифр Плейфера

**Шифр Плейфера** — первый практический биграммный шифр, шифрующий пары букв вместо отдельных символов.

## История

Изобретён в 1854 году **Чарльзом Уитстоном**, но назван в честь барона **Лайона Плейфера**, который продвигал его использование. Активно применялся британской армией во время Англо-бурской войны и Первой мировой войны.

:::tip Историческая справка
Шифр был достаточно прост для использования в полевых условиях и при этом устойчив к простому частотному анализу благодаря биграммной структуре.
:::

## Принцип работы

### 1. Построение квадрата

Создаётся таблица 5×5 (для английского) или 6×6 (для русского), заполненная по ключевому слову:

**Пример с ключом "MONARCHY":**

```
    1   2   3   4   5
  ┌───┬───┬───┬───┬───┐
1 │ M │ O │ N │ A │ R │
  ├───┼───┼───┼───┼───┤
2 │ C │ H │ Y │ B │ D │
  ├───┼───┼───┼───┼───┤
3 │ E │ F │ G │ I │ K │
  ├───┼───┼───┼───┼───┤
4 │ L │ P │ Q │ S │ T │
  ├───┼───┼───┼───┼───┤
5 │ U │ V │ W │ X │ Z │
  └───┴───┴───┴───┴───┘
```

**Правила заполнения:**
1. Записать буквы ключа (без повторов)
2. Добавить оставшиеся буквы алфавита
3. I и J объединяются (для английского)
4. Для русского: Ё→Е, Ъ→Ь

### 2. Подготовка текста

Текст разбивается на **биграммы** (пары букв):

```
HELLO WORLD → HE LX LO WO RL DX
```

**Правила:**
- Если буквы в паре одинаковые — вставить заполнитель (X)
- Если нечётное количество букв — добавить заполнитель в конце

```
BALLOON → BA LX LO ON
MEETING → ME ET IN GX  (T→TX→TI NG)
```

### 3. Правила шифрования

| Случай | Правило | Пример |
|--------|---------|--------|
| **Одна строка** | Сдвиг вправо на 1 | HE → CF |
| **Один столбец** | Сдвиг вниз на 1 | MU → CL |
| **Прямоугольник** | Замена углов | HS → BP |

**Визуализация правила прямоугольника:**

```
    H ─────── S
    │         │
    │         │
    B ─────── P
    
HS → BP (меняем по горизонтали)
```

## Параметры

| Параметр | Значение |
|----------|----------|
| Тип | Биграммный (полиграфический) |
| Размер блока | 2 буквы |
| Ключ | Слово или фраза |
| Алфавит | 25 (EN) или 32-36 (RU) |

## Интерактивный шифратор

<PlayfairCipher />

## Реализация на Python

```python
def create_playfair_square(keyword: str, alphabet: str, size: int) -> list[list[str]]:
    """Создание квадрата Плейфера"""
    seen = set()
    chars = []
    
    # Обрабатываем ключ
    for char in keyword.upper():
        if char == 'J': char = 'I'
        if char == 'Ё': char = 'Е'
        if char == 'Ъ': char = 'Ь'
        
        if char in alphabet and char not in seen:
            seen.add(char)
            chars.append(char)
    
    # Добавляем остальные буквы
    for char in alphabet:
        if char not in seen:
            chars.append(char)
    
    # Формируем квадрат
    square = []
    for i in range(size):
        square.append(chars[i * size:(i + 1) * size])
    
    return square

def find_position(char: str, square: list[list[str]]) -> tuple[int, int]:
    """Найти позицию символа"""
    for row in range(len(square)):
        for col in range(len(square[row])):
            if square[row][col] == char:
                return (row, col)
    return (-1, -1)

def prepare_text(text: str, filler: str = 'X') -> list[str]:
    """Подготовка текста: разбиение на биграммы"""
    # Очистка и нормализация
    text = ''.join(c for c in text.upper() if c.isalpha())
    text = text.replace('J', 'I')
    
    bigrams = []
    i = 0
    
    while i < len(text):
        first = text[i]
        second = text[i + 1] if i + 1 < len(text) else filler
        
        if first == second:
            bigrams.append(first + filler)
            i += 1
        else:
            bigrams.append(first + second)
            i += 2
    
    return bigrams

def playfair_encrypt(bigrams: list[str], square: list[list[str]]) -> str:
    """Шифрование Плейфером"""
    size = len(square)
    result = []
    
    for bigram in bigrams:
        r1, c1 = find_position(bigram[0], square)
        r2, c2 = find_position(bigram[1], square)
        
        if r1 == r2:
            # Одна строка — сдвиг вправо
            result.append(square[r1][(c1 + 1) % size])
            result.append(square[r2][(c2 + 1) % size])
        elif c1 == c2:
            # Один столбец — сдвиг вниз
            result.append(square[(r1 + 1) % size][c1])
            result.append(square[(r2 + 1) % size][c2])
        else:
            # Прямоугольник — меняем столбцы
            result.append(square[r1][c2])
            result.append(square[r2][c1])
        
        result.append(' ')
    
    return ''.join(result).strip()

def playfair_decrypt(bigrams: list[str], square: list[list[str]]) -> str:
    """Дешифрование Плейфером"""
    size = len(square)
    result = []
    
    for bigram in bigrams:
        r1, c1 = find_position(bigram[0], square)
        r2, c2 = find_position(bigram[1], square)
        
        if r1 == r2:
            # Одна строка — сдвиг влево
            result.append(square[r1][(c1 - 1) % size])
            result.append(square[r2][(c2 - 1) % size])
        elif c1 == c2:
            # Один столбец — сдвиг вверх
            result.append(square[(r1 - 1) % size][c1])
            result.append(square[(r2 - 1) % size][c2])
        else:
            # Прямоугольник — меняем столбцы
            result.append(square[r1][c2])
            result.append(square[r2][c1])
    
    return ''.join(result)

# Пример использования
EN_ALPHABET = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'  # без J
keyword = "MONARCHY"
square = create_playfair_square(keyword, EN_ALPHABET, 5)

text = "HELLO WORLD"
bigrams = prepare_text(text)
encrypted = playfair_encrypt(bigrams, square)
decrypted = playfair_decrypt(encrypted.split(), square)

print(f"Исходный: {text}")
print(f"Биграммы: {bigrams}")
print(f"Зашифрованный: {encrypted}")
print(f"Расшифрованный: {decrypted}")
```

## Пример шифрования

**Ключ:** MONARCHY  
**Текст:** INSTRUMENTS

```
1. Подготовка биграммы:
   INSTRUMENTS → IN ST RU ME NT SX

2. Применяем правила:
   IN → GA (прямоугольник)
   ST → TQ (одна строка, сдвиг вправо)
   RU → MV (прямоугольник)
   ME → CF (прямоугольник)
   NT → AS (прямоугольник)
   SX → WX (одна строка)

3. Результат: GA TQ MV CF AS WX
```

## Криптоанализ

### Преимущества над моноалфавитными

- Скрывает частоту отдельных букв
- 625 возможных биграмм (vs 26 букв)
- Устойчив к простому частотному анализу

### Уязвимости

1. **Частотный анализ биграмм** — в языке есть частые пары (TH, HE, IN)
2. **Известный открытый текст** — позволяет восстановить квадрат
3. **Структурные атаки** — анализ повторяющихся паттернов

### Статистика биграмм

| Биграмма | Частота (EN) |
|----------|--------------|
| TH | 3.56% |
| HE | 3.07% |
| IN | 2.43% |
| ER | 2.05% |
| AN | 1.99% |

## Сравнение с другими шифрами

| Шифр | Блок | Ключ | Стойкость |
|------|------|------|-----------|
| Цезарь | 1 буква | Число | Очень низкая |
| Виженер | 1 буква | Слово | Низкая |
| Плейфер | 2 буквы | Слово | Средняя |
| Hill | N букв | Матрица | Средняя |
| ADFGVX | 1 буква | Два ключа | Высокая |

## Русский вариант (6×6)

Для русского алфавита используется квадрат 6×6:

```
Алфавит: АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ_
(32 буквы без Ё, Ъ + символ-заполнитель)
```

**Замены:**
- Ё → Е
- Ъ → Ь

:::warning Историческое использование
Шифр Плейфера использовался до середины XX века, но сегодня считается небезопасным из-за малого размера блока и уязвимости к статистическому анализу.
:::
