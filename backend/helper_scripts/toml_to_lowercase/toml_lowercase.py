import toml

def lowercase_keys(obj):
    """
    Рекурсивно преобразует все ключи словаря (и вложенных словарей) к нижнему регистру.
    Обрабатывает как словари, так и списки.
    """
    if isinstance(obj, dict):
        new_dict = {}
        for key, value in obj.items():
            # Преобразуем ключ к строке и приводим к нижнему регистру
            new_key = str(key).lower()
            # Рекурсивно обрабатываем значение
            new_value = lowercase_keys(value)
            new_dict[new_key] = new_value
        return new_dict
    elif isinstance(obj, list):
        # Если элемент списка - словарь или список, рекурсивно обрабатываем его
        return [lowercase_keys(item) for item in obj]
    else:
        # Возвращаем неизменённое значение для примитивных типов
        return obj

def main():
    input_file = 'input.toml'
    output_file = 'output.toml'

    # Чтение исходного TOML файла
    with open(input_file, 'r', encoding='utf-8') as f:
        data = toml.load(f)

    # Приведение всех ключей к нижнему регистру
    processed_data = lowercase_keys(data)

    # Запись результата в новый TOML файл
    with open(output_file, 'w', encoding='utf-8') as f:
        toml.dump(processed_data, f)

    print(f"Ключи в '{input_file}' переведены в нижний регистр и сохранены в '{output_file}'.")

if __name__ == '__main__':
    main()