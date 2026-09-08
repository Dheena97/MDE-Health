/**
 * Column auto-detection using alias dictionaries.
 * Maps source column names to application field names.
 */
import type { ColumnMapping, FieldDefinition } from '../types/columns';
import { INTUNE_FIELDS, MDE_FIELDS } from '../types/columns';

const STORAGE_KEY_INTUNE = 'mde-dashboard-column-mappings-intune';
const STORAGE_KEY_MDE = 'mde-dashboard-column-mappings-mde';

/**
 * Auto-detect column mappings by comparing source headers against known aliases.
 */
export function autoDetectColumns(
  headers: string[],
  fieldDefinitions: FieldDefinition[]
): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];
  const usedHeaders = new Set<string>();

  for (const field of fieldDefinitions) {
    let bestMatch: { header: string; confidence: number } | null = null;

    for (const header of headers) {
      if (usedHeaders.has(header)) continue;

      const normalizedHeader = header.toLowerCase().trim();

      // Exact match with field key
      if (normalizedHeader === field.key.toLowerCase()) {
        bestMatch = { header, confidence: 1.0 };
        break;
      }

      // Exact match with field label
      if (normalizedHeader === field.label.toLowerCase()) {
        bestMatch = { header, confidence: 0.95 };
        break;
      }

      // Match against aliases
      for (const alias of field.aliases) {
        if (normalizedHeader === alias) {
          const confidence = 0.9;
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = { header, confidence };
          }
          break;
        }
      }

      // Partial match (contains)
      if (!bestMatch) {
        for (const alias of field.aliases) {
          if (normalizedHeader.includes(alias) || alias.includes(normalizedHeader)) {
            const confidence = 0.6;
            if (!bestMatch || confidence > bestMatch.confidence) {
              bestMatch = { header, confidence };
            }
          }
        }
      }
    }

    if (bestMatch) {
      usedHeaders.add(bestMatch.header);
      mappings.push({
        sourceColumn: bestMatch.header,
        targetField: field.key,
        confidence: bestMatch.confidence,
        isManual: false,
      });
    }
  }

  return mappings;
}

/**
 * Apply column mappings to transform a raw row into a typed object.
 */
export function applyMappings(
  row: Record<string, unknown>,
  mappings: ColumnMapping[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const mapping of mappings) {
    result[mapping.targetField] = row[mapping.sourceColumn];
  }

  return result;
}

/**
 * Auto-detect Intune columns.
 */
export function detectIntuneColumns(headers: string[]): ColumnMapping[] {
  // First check localStorage for saved mappings
  const saved = loadSavedMappings(STORAGE_KEY_INTUNE, headers);
  if (saved) return saved;
  return autoDetectColumns(headers, INTUNE_FIELDS);
}

/**
 * Auto-detect MDE columns.
 */
export function detectMdeColumns(headers: string[]): ColumnMapping[] {
  const saved = loadSavedMappings(STORAGE_KEY_MDE, headers);
  if (saved) return saved;
  return autoDetectColumns(headers, MDE_FIELDS);
}

/**
 * Save column mappings to localStorage.
 */
export function saveMappings(type: 'intune' | 'mde', mappings: ColumnMapping[]): void {
  const key = type === 'intune' ? STORAGE_KEY_INTUNE : STORAGE_KEY_MDE;
  try {
    localStorage.setItem(key, JSON.stringify(mappings));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Load saved mappings from localStorage, but only if they match the current headers.
 */
function loadSavedMappings(key: string, headers: string[]): ColumnMapping[] | null {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const mappings: ColumnMapping[] = JSON.parse(saved);
    // Verify that all source columns exist in current headers
    const headerSet = new Set(headers);
    const allExist = mappings.every(m => headerSet.has(m.sourceColumn));

    if (allExist && mappings.length > 0) {
      return mappings;
    }
    return null;
  } catch {
    return null;
  }
}
