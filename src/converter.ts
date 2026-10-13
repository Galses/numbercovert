// допустимые системы счисления
export type Base = 2 | 8 | 10 | 16;

// число которое мы нашли в строке кода
export interface FoundNumber {
    start: number;   // индекс начала числа в строке
    end: number;     // индекс конца числа
    value: bigint;   // само значение
    base: Base;      // система счисления
}

const all_digits = "0123456789abcdef";

const numbers_chars = "0123456789abcdefABCDEFxXbB'";

function isValid(digits: string, base: Base): boolean { // проверка что все символы подходят для системы счисления
    const allowed = all_digits.slice(0, base);

    for (const ch of digits.toLowerCase()) {
        if (!allowed.includes(ch)) {
            return false;
        }
    }
    return true;
}


function parseLiteral(text: string): { value: bigint; base: Base } | null { // разбирает текст числа и определяет СС. возарат null при неправильно записанном формате
    const clean = text.split("'").join("");
    const lower = clean.toLowerCase();

    let base: Base;
    let digits: string;

    if (lower[0] === "0" && lower[1] === "x") {
        base = 16;
        digits = lower.slice(2);
    } else if (lower[0] === "0" && lower[1] === "b") {
        base = 2;
        digits = lower.slice(2);
    } else if (lower.length > 1 && lower[0] === "0") {
        base = 8;
        digits = lower.slice(1);
    } else {
        base = 10;
        digits = lower;
    }

    if (digits.length === 0 || !isValid(digits, base)) {
        return null;
    }
    let value: bigint;
    if (base === 16) {
        value = BigInt("0x" + digits);
    } else if (base === 2) {
        value = BigInt("0b" + digits);
    } else if (base === 8) {
        value = BigInt("0o" + digits);
    } else {
        value = BigInt(digits);
    }

    return { value: value, base: base };
}

export function findNumberInLine(line: string, column: number): FoundNumber | null { // поиск числа в строке
    // идём влево, пока символы подходят
    let start = column;
    while (start > 0 && numbers_chars.includes(line[start - 1])) {
        start--;
    }

    // идём вправо, пока символы подходят
    let end = column;
    while (end < line.length && numbers_chars.includes(line[end])) {
        end++;
    }

    const text = line.slice(start, end); // например "0xFF"

    // число должно начинаться с цифры
    if (text.length === 0 || text[0] < "0" || text[0] > "9") {
        return null;
    }

    // если перед числом буква или _ то это часть названия переменной (например var1)
    if (start > 0) {
        const before = line[start - 1];
        const isLetter = (before >= "a" && before <= "z") || (before >= "A" && before <= "Z");
        if (isLetter || before === "_") {
            return null;
        }
    }

    // пропускаем дробные числа типа 3.14
    if (line[start - 1] === "." || line[end] === ".") {
        return null;
    }

    const parsed = parseLiteral(text);
    if (parsed === null) {
        return null;
    }

    return { start: start, end: end, value: parsed.value, base: parsed.base };
}

export function formatNumber(value: bigint, base: Base): string { // превращает значение в строку для C++ кода в нужной системе
    let digits = value.toString(base);

    if (base === 16) {
        return "0x" + digits.toUpperCase();
    }
    if (base === 2) {
        return "0b" + digits;
    }
    if (base === 8) {
        if (value === 0n) {
            return "0";
        }
        return "0" + digits;
    }
    return digits;
}

export function makeHoverText(value: bigint): string {
    let text = "| Система | Значение |\n|---|---|\n";
    text += "| BIN (2) | `" + formatNumber(value, 2) + "` |\n";
    text += "| OCT (8) | `" + formatNumber(value, 8) + "` |\n";
    text += "| DEC (10) | `" + formatNumber(value, 10) + "` |\n";
    text += "| HEX (16) | `" + formatNumber(value, 16) + "` |\n";
    return text;
}