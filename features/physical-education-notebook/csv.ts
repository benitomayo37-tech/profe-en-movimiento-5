import type {
  StudentCsvRow,
  StudentCsvRowError,
} from "./types";
import { studentCsvRowSchema } from "./validation";

export interface StudentCsvParseResult {
  rows: StudentCsvRow[];
  errors: StudentCsvRowError[];
}

const HEADER_ALIASES = {
  firstNames: [
    "nombres",
    "nombre",
    "first_names",
    "firstname",
    "first_name",
  ],
  lastNames: [
    "apellidos",
    "apellido",
    "last_names",
    "lastname",
    "last_name",
  ],
  studentCode: [
    "codigo",
    "codigo_estudiante",
    "student_code",
    "identificacion",
  ],
  listNumber: [
    "numero_lista",
    "numero_de_lista",
    "nro_lista",
    "lista",
    "list_number",
  ],
} as const;

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function countDelimiter(
  line: string,
  delimiter: string,
): number {
  let count = 0;
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && character === delimiter) {
      count += 1;
    }
  }

  return count;
}

function detectDelimiter(text: string): string {
  const firstLine =
    text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/, 1)[0] ?? "";

  const candidates = [",", ";", "\t"];

  return candidates.reduce((best, candidate) =>
    countDelimiter(firstLine, candidate)
      > countDelimiter(firstLine, best)
      ? candidate
      : best,
  );
}

function parseDelimitedRecords(
  text: string,
  delimiter: string,
): {
  records: string[][];
  malformedQuotes: boolean;
} {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }

      continue;
    }

    if (!quoted && character === delimiter) {
      record.push(field.trim());
      field = "";
      continue;
    }

    if (
      !quoted
      && (character === "\n" || character === "\r")
    ) {
      if (
        character === "\r"
        && text[index + 1] === "\n"
      ) {
        index += 1;
      }

      record.push(field.trim());

      if (
        record.some((value) => value.length > 0)
      ) {
        records.push(record);
      }

      record = [];
      field = "";
      continue;
    }

    field += character;
  }

  record.push(field.trim());

  if (record.some((value) => value.length > 0)) {
    records.push(record);
  }

  return {
    records,
    malformedQuotes: quoted,
  };
}

function findColumn(
  headers: string[],
  aliases: readonly string[],
): number {
  return headers.findIndex((header) =>
    aliases.includes(header),
  );
}

export function parseStudentCsv(
  source: string,
): StudentCsvParseResult {
  const errors: StudentCsvRowError[] = [];

  if (typeof source !== "string" || !source.trim()) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 1,
          message: "El archivo CSV está vacío.",
        },
      ],
    };
  }

  if (source.length > 500_000) {
    return {
      rows: [],
      errors: [
        {
          rowNumber: 1,
          message:
            "El archivo supera el límite de 500 KB.",
        },
      ],
    };
  }

  const delimiter = detectDelimiter(source);
  const { records, malformedQuotes } =
    parseDelimitedRecords(
      source.replace(/^\uFEFF/, ""),
      delimiter,
    );

  if (malformedQuotes) {
    errors.push({
      rowNumber: 1,
      message:
        "El archivo contiene comillas sin cerrar.",
    });
  }

  if (records.length < 2) {
    return {
      rows: [],
      errors: [
        ...errors,
        {
          rowNumber: 1,
          message:
            "El CSV debe incluir encabezados "
            + "y al menos un estudiante.",
        },
      ],
    };
  }

  const headers = records[0].map(normalizeHeader);

  const firstNamesIndex = findColumn(
    headers,
    HEADER_ALIASES.firstNames,
  );

  const lastNamesIndex = findColumn(
    headers,
    HEADER_ALIASES.lastNames,
  );

  const studentCodeIndex = findColumn(
    headers,
    HEADER_ALIASES.studentCode,
  );

  const listNumberIndex = findColumn(
    headers,
    HEADER_ALIASES.listNumber,
  );

  if (firstNamesIndex < 0) {
    errors.push({
      rowNumber: 1,
      message:
        'Falta la columna obligatoria "nombres".',
    });
  }

  if (lastNamesIndex < 0) {
    errors.push({
      rowNumber: 1,
      message:
        'Falta la columna obligatoria "apellidos".',
    });
  }

  if (firstNamesIndex < 0 || lastNamesIndex < 0) {
    return {
      rows: [],
      errors,
    };
  }

  const dataRecords = records.slice(1);

  if (dataRecords.length > 500) {
    return {
      rows: [],
      errors: [
        ...errors,
        {
          rowNumber: 1,
          message:
            "Solo se permiten 500 estudiantes "
            + "por importación.",
        },
      ],
    };
  }

  const rows: StudentCsvRow[] = [];

  dataRecords.forEach((record, index) => {
    const rowNumber = index + 2;

    const candidate = {
      rowNumber,
      firstNames:
        record[firstNamesIndex] ?? "",
      lastNames:
        record[lastNamesIndex] ?? "",
      studentCode:
        studentCodeIndex >= 0
          ? record[studentCodeIndex] ?? null
          : null,
      listNumber:
        listNumberIndex >= 0
          ? record[listNumberIndex] ?? null
          : null,
    };

    const parsed =
      studentCsvRowSchema.safeParse(candidate);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => issue.message)
        .join(" ");

      errors.push({
        rowNumber,
        message,
      });

      return;
    }

    rows.push(parsed.data);
  });

  return {
    rows,
    errors,
  };
}
