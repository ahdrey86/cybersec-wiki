---
sidebar_position: 9
---

import VerticalPermutation from '@site/src/components/ciphers/VerticalPermutation';

# Вертикальная перестановка

**Вертикальная перестановка** (столбцовая транспозиция) — шифр перестановки, в котором текст записывается в таблицу по строкам, а читается по столбцам в порядке, заданном ключом.

## Принцип работы

### 1. Запись в таблицу

Текст записывается слева направо, сверху вниз. Количество столбцов = длине ключа.

**Пример:** текст "КРИПТОГРАФИЯ", ключ "КЛЮЧ"

```
Порядок столбцов определяется алфавитным порядком букв ключа:
К Л Ю Ч  →  К(1) Л(2) Ю(4) Ч(3)
↓ ↓ ↓ ↓
1 2 4 3  (позиции при чтении)

Таблица:
  К  Л  Ю  Ч
  1  2  4  3
┌───┬───┬───┬───┐
│ К │ Р │ И │ П │
├───┼───┼───┼───┤
│ Т │ О │ Г │ Р │
├───┼───┼───┼───┤
│ А │ Ф │ И │ Я │
└───┴───┴───┴───┘
```

### 2. Чтение по столбцам

Читаем столбцы в алфавитном порядке ключа: К→Л→Ч→Ю

```
Столбец К (1-й): К Т А
Столбец Л (2-й): Р О Ф
Столбец Ч (3-й): П Р Я
Столбец Ю (4-й): И Г И

Результат: КТА РОФ ПРЯ ИГИ
```

## Интерактивный шифратор

<VerticalPermutation />

## Реализация на Python

```python
def vertical_encrypt(text: str, key: str) -> str:
    """Шифрование вертикальной перестановкой"""
    text = ''.join(c for c in text.upper() if c.isalpha())
    key = key.upper()
    cols = len(key)
    
    # Определяем порядок столбцов
    order = sorted(range(cols), key=lambda i: key[i])
    
    # Дополняем текст до кратной длины
    while len(text) % cols != 0:
        text += '_'
    
    # Заполняем таблицу
    rows = len(text) // cols
    grid = [text[i*cols:(i+1)*cols] for i in range(rows)]
    
    # Читаем по столбцам в порядке ключа
    result = []
    for col_idx in order:
        column = ''.join(row[col_idx] for row in grid)
        result.append(column)
    
    return ' '.join(result)

def vertical_decrypt(cipher: str, key: str) -> str:
    """Дешифрование вертикальной перестановкой"""
    cipher = cipher.replace(' ', '')
    key = key.upper()
    cols = len(key)
    rows = len(cipher) // cols
    
    order = sorted(range(cols), key=lambda i: key[i])
    
    # Распределяем символы по столбцам
    columns = [''] * cols
    pos = 0
    for col_idx in order:
        columns[col_idx] = cipher[pos:pos+rows]
        pos += rows
    
    # Читаем по строкам
    result = []
    for r in range(rows):
        for c in range(cols):
            if r < len(columns[c]):
                result.append(columns[c][r])
    
    return ''.join(result).rstrip('_')

# Пример
text = "КРИПТОГРАФИЯ"
key = "КЛЮЧ"

encrypted = vertical_encrypt(text, key)
decrypted = vertical_decrypt(encrypted, key)

print(f"Исходный: {text}")
print(f"Ключ: {key}")
print(f"Зашифрованный: {encrypted}")
print(f"Расшифрованный: {decrypted}")
```

## Двойная перестановка

Для усиления можно применить перестановку дважды с разными ключами:

```python
def double_transposition(text: str, key1: str, key2: str) -> str:
    """Двойная перестановка"""
    first_pass = vertical_encrypt(text, key1)
    second_pass = vertical_encrypt(first_pass.replace(' ', ''), key2)
    return second_pass
```

## Криптоанализ

### Уязвимости

1. **Анализ длины** — длина шифротекста = длине открытого текста
2. **Частотный анализ** — частоты букв сохраняются
3. **Анаграммирование** — при коротком ключе возможен перебор

### Методы взлома

- Перебор возможных длин ключа (делители длины текста)
- Поиск частых биграмм (СТ, НО, ЕН, ТО)
- Использование вероятных слов

## Историческое применение

| Период | Использование |
|--------|---------------|
| Древний мир | Скитала спартанцев |
| XVI-XVII вв | Дипломатическая переписка |
| Первая мировая | ADFGVX (в комбинации) |
| Вторая мировая | Двойная перестановка |

:::tip Комбинированные шифры
Перестановка часто комбинируется с заменой для усиления. Например, ADFGVX = Полибий + двойная перестановка.
:::
