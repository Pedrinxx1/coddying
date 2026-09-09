/**
 * Exercise Validation Improvements
 * 
 * This module contains fixes for exercise validation issues where:
 * 1. Expected outputs were too strict or incorrectly defined
 * 2. Exercises marked as incomplete despite correct code execution
 * 3. Python exercises not recognizing valid output due to whitespace/format issues
 */

/**
 * Normalize output for comparison:
 * - Remove trailing/leading whitespace
 * - Handle different line ending styles (CRLF vs LF)
 * - Preserve intentional output structure
 */
export function normalizeOutput(output: string): string {
  return output
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Flexible output matching for exercises.
 * Handles:
 * - Partial matches (output contains expected string)
 * - Numeric precision (for math exercises)
 * - Multiple acceptable formats
 */
export function checkExerciseOutput(
  actual: string,
  expected: string | null
): boolean {
  if (!expected || expected === '\n') {
    // No expected output = just needs to run without error
    return true;
  }

  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);

  // Exact match
  if (normalizedActual === normalizedExpected) {
    return true;
  }

  // Contains match (for exercises where output is part of larger output)
  if (normalizedActual.includes(normalizedExpected)) {
    return true;
  }

  // For numeric outputs, allow small floating point differences
  const actualNum = parseFloat(normalizedActual);
  const expectedNum = parseFloat(normalizedExpected);
  
  if (!isNaN(actualNum) && !isNaN(expectedNum)) {
    const tolerance = Math.abs(expectedNum) * 0.01; // 1% tolerance
    if (Math.abs(actualNum - expectedNum) <= tolerance) {
      return true;
    }
  }

  return false;
}

/**
 * Common exercise expected outputs that were broken.
 * These should be reviewed and updated in lessonLibrary.ts
 */
export const EXERCISE_FIXES = {
  // Python: "Ler e converter" - Image exercise
  'python-ler-e-converter': {
    prompt: 'Use um laço para somar os números de 1 a 5 e imprimir 15.',
    expected: '15',
    fixReason: 'Output should be flexible - any variation of "15" should work'
  },
  
  // Python: Basic sum exercise
  'python-lacos-soma': {
    prompt: 'Some os números de 1 a 5 usando um laço ou sum() e imprima 15.',
    expected: '15',
    fixReason: 'Removed strict newline requirement that was blocking correct solutions'
  },

  // SQL: Sum exercise
  'sql-sum-query': {
    prompt: 'Escreva uma consulta que devolva 15 como resultado da soma de 1 a 5.',
    expected: '15',
    fixReason: 'SQL output format should be lenient'
  },
};

/**
 * Hook into the exercise checking logic to provide better validation.
 * This should be integrated into cursos.$slug_.licao.$m.$l.tsx
 * in the `check()` function around line 406-442
 */
export function improveExerciseValidation(
  code: string,
  output: string,
  activeExpected: string | null,
  isReflection: boolean,
  language: string
): { correct: boolean; feedback?: string } {
  if (isReflection) {
    const usefulText = code.replace(/[#/*\-]/g, "").trim();
    const correct = usefulText.length >= 80 && !/____|\.\.\.|complete|escreva aqui/i.test(usefulText);
    return { 
      correct,
      feedback: correct 
        ? "Análise registrada. Você apresentou uma decisão com justificativa suficiente."
        : "Desenvolva sua resposta com uma decisão, o motivo e como você verificaria o resultado."
    };
  }

  // Check for unfilled placeholders
  const hasPlaceholders = /____|\.\.\.|# crie|# complete/i.test(code);
  if (hasPlaceholders) {
    return { 
      correct: false,
      feedback: "Ainda há lacunas para preencher (____ ou escreva aqui)"
    };
  }

  // Check if code has syntax errors (presence of stderr usually indicates this)
  // This should be checked before this function is called in the actual component

  // Use flexible output matching
  const correct = checkExerciseOutput(output, activeExpected);
  
  return { correct };
}
