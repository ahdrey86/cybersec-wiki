---
sidebar_position: 2
---

# Файловые системы

Организация хранения данных на носителях.

## Сравнение файловых систем

| ФС | ОС | Макс. файл | Макс. раздел | Журналирование |
|----|-----|-----------|--------------|----------------|
| **NTFS** | Windows | 16 ЭБ | 256 ТБ | ✅ |
| **ext4** | Linux | 16 ТБ | 1 ЭБ | ✅ |
| **XFS** | Linux | 8 ЭБ | 8 ЭБ | ✅ |
| **Btrfs** | Linux | 16 ЭБ | 16 ЭБ | ✅ (CoW) |
| **ZFS** | BSD/Linux | 16 ЭБ | 256 ZБ | ✅ (CoW) |
| **APFS** | macOS | 8 ЭБ | 8 ЭБ | ✅ (CoW) |
| **FAT32** | Все | 4 ГБ | 2 ТБ | ❌ |
| **exFAT** | Все | 16 ЭБ | 128 ПБ | ❌ |

## Linux: ext4

Стандартная файловая система Linux.

### Структура

```
┌─────────────────────────────────────────────────────┐
│ Boot │ Super │ Group │ Block │ Inode │ Inode │ Data │
│ Block│ Block │ Desc  │ Bitmap│ Bitmap│ Table │Blocks│
└─────────────────────────────────────────────────────┘
```

### Inode

Метаданные файла (всё кроме имени и содержимого):

- Тип файла, права доступа
- UID/GID владельца
- Размер, временные метки
- Указатели на блоки данных

```bash
# Информация об inode
stat /etc/passwd
ls -li /etc/passwd
```

### Команды

```bash
# Создать ext4
mkfs.ext4 /dev/sdb1

# Проверка
fsck.ext4 /dev/sdb1

# Информация
dumpe2fs /dev/sdb1 | head -50
tune2fs -l /dev/sdb1
```

## Windows: NTFS

### Структура

```
┌──────────────────────────────────────────────────┐
│ Boot │  MFT  │ System │  Log  │ Data  │   ...   │
│Sector│ (MFT) │ Files  │ File  │ Area  │         │
└──────────────────────────────────────────────────┘
```

### MFT (Master File Table)

- Каждый файл = запись в MFT
- Метаданные + данные (если < 700 байт)
- Системные файлы: $MFT, $Bitmap, $LogFile

### Особенности

- **Права доступа:** ACL (Access Control Lists)
- **Шифрование:** EFS (Encrypting File System)
- **Сжатие:** Встроенное на уровне ФС
- **Альтернативные потоки:** ADS (Alternative Data Streams)

```cmd
# Просмотр ADS
dir /r filename

# Создание ADS
echo "hidden" > file.txt:secret
```

## Журналирование

Защита от повреждения данных при сбоях.

### Типы

| Тип | Что журналируется | Производительность |
|-----|-------------------|-------------------|
| Writeback | Только метаданные | Быстро |
| Ordered | Метаданные, данные упорядочены | Средне |
| Journal | Метаданные + данные | Медленно |

### Copy-on-Write (CoW)

**Btrfs, ZFS, APFS:**
- Данные не перезаписываются, а копируются
- Атомарные операции
- Снимки (snapshots) почти бесплатны

```bash
# Снимок Btrfs
btrfs subvolume snapshot /data /data/.snapshots/2024-01-01
```

## RAID

Объединение дисков для надёжности/производительности.

| Уровень | Диски | Ёмкость | Надёжность | Скорость |
|---------|-------|---------|------------|----------|
| RAID 0 | 2+ | N × диск | ❌ | ⬆⬆ чтение/запись |
| RAID 1 | 2 | 1 × диск | ✅ | ⬆ чтение |
| RAID 5 | 3+ | (N-1) × диск | 1 диск | ⬆ чтение |
| RAID 6 | 4+ | (N-2) × диск | 2 диска | ⬆ чтение |
| RAID 10 | 4+ | N/2 × диск | 1 в каждой паре | ⬆⬆ чтение/запись |

```bash
# Создание RAID 1 (Linux mdadm)
mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc
```

## LVM (Logical Volume Manager)

Гибкое управление дисковым пространством в Linux.

```
Physical Volumes (PV) → Volume Group (VG) → Logical Volumes (LV)
   /dev/sdb              vg_data              lv_home
   /dev/sdc                                   lv_var
```

```bash
# Создание
pvcreate /dev/sdb /dev/sdc
vgcreate vg_data /dev/sdb /dev/sdc
lvcreate -L 100G -n lv_home vg_data

# Расширение
lvextend -L +50G /dev/vg_data/lv_home
resize2fs /dev/vg_data/lv_home
```
