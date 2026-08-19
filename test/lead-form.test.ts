import { describe, expect, test } from 'vitest';
import type { LeadField } from '@/lib/types';
import { buildFieldRows } from '@/pages/Quiz/screens/Lead';
import { loadQuiz } from './fixtures';

const field = (name: string, half = false): LeadField => ({ name, label: name, half });

describe('buildFieldRows', () => {
  test('pairs adjacent half fields into one row', () => {
    const rows = buildFieldRows([field('firstName', true), field('lastName', true)]);
    expect(rows).toHaveLength(1);
    expect(rows[0].map((f) => f.name)).toEqual(['firstName', 'lastName']);
  });

  test('a full-width field always gets its own row', () => {
    const rows = buildFieldRows([field('firstName', true), field('email'), field('phone')]);
    // The unpaired half field must not sit alone in a two-column grid.
    expect(rows.map((r) => r.map((f) => f.name))).toEqual([['firstName'], ['email'], ['phone']]);
  });

  test('a trailing unpaired half field becomes a full-width row', () => {
    const rows = buildFieldRows([
      field('firstName', true),
      field('lastName', true),
      field('middleName', true),
    ]);
    expect(rows.map((r) => r.length)).toEqual([2, 1]);
    expect(rows[1][0].name).toBe('middleName');
  });

  test('every field appears exactly once, in order', () => {
    const fields = [
      field('a', true),
      field('b', true),
      field('c'),
      field('d', true),
      field('e', true),
      field('f', true),
    ];
    expect(buildFieldRows(fields).flat().map((f) => f.name)).toEqual(fields.map((f) => f.name));
  });

  test('both shipped quizzes lay out without a stray half field', () => {
    for (const quizId of ['ppc-performance-marketing', 'moebel-verkauf']) {
      const fields = loadQuiz(quizId).leadForm?.fields || [];
      const rows = buildFieldRows(fields);
      expect(rows.flat()).toHaveLength(fields.length);
      for (const row of rows) {
        if (row.length === 2) expect(row.every((f) => f.half)).toBe(true);
      }
    }
  });
});
