---
sidebar_position: 11
---

import HillCipher from '@site/src/components/ciphers/HillCipher';

# Матричный шифр (Хилла)

**Шифр Хилла** — полиграфический шифр, использующий линейную алгебру для шифрования блоков символов.

## История

Изобретён американским математиком **Лестером Хиллом** в 1929 году. Это был первый шифр, использующий матричную алгебру.

## Принцип работы

### Шифрование

Открытый текст разбивается на блоки размером n. Каждый блок умножается на ключевую матрицу:

```
C = K × P (mod m)
```

### Пример (2×2)

Ключевая матрица:
```
K = │ 3  5 │
    │ 2  7 │
```

Текст "ТЕ" (Т=19, Е=5):
```
│ c₁ │   │ 3  5 │   │ 19 │   │ 82  │   │ 16 │
│ c₂ │ = │ 2  7 │ × │  5 │ = │ 73  │ ≡ │  7 │ (mod 33)

Результат: "ПЖ"
```

## Интерактивный шифратор

<HillCipher />

## Условия обратимости

Матрица K обратима по модулю m когда:

```
НОД(det(K), m) = 1
```

## Реализация на Python

```python
import numpy as np

def hill_encrypt(text: str, key: np.ndarray, alphabet: str) -> str:
    n = key.shape[0]
    m = len(alphabet)
    
    text = ''.join(c for c in text.upper() if c in alphabet)
    while len(text) % n != 0:
        text += alphabet[0]
    
    nums = [alphabet.index(c) for c in text]
    result = []
    
    for i in range(0, len(nums), n):
        block = np.array(nums[i:i+n])
        encrypted = (key @ block) % m
        result.extend(encrypted)
    
    return ''.join(alphabet[i] for i in result)

# Пример
key = np.array([[3, 5], [2, 7]])
print(hill_encrypt("ТЕСТ", key, "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"))
```

## Криптоанализ

При известных n² парах (открытый, шифр) ключ восстанавливается:

```
K = C × P⁻¹ (mod m)
```

:::tip Образовательная ценность
Шифр Хилла — отличное введение в линейную алгебру в криптографии.
:::
