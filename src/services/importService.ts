import { Question, Difficulty, ImportResult } from '../types';
import { storageService } from './storage';

export function parseCSVQuestions(csvText: string, defaultSubjectId: string = 'sub-1'): ImportResult {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) {
    return {
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      errors: [{ row: 1, reason: 'File is empty or contains only a header line.' }],
    };
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  
  // Required column indices
  const getCol = (name: string) => header.indexOf(name.toLowerCase());
  const colChapterId = getCol('chapterid');
  const colText = getCol('text');
  const colA = getCol('optiona');
  const colB = getCol('optionb');
  const colC = getCol('optionc');
  const colD = getCol('optiond');
  const colAns = getCol('answerindex');
  const colExp = getCol('explanation');
  const colDiff = getCol('difficulty');

  const missingColumns: string[] = [];
  if (colText === -1) missingColumns.push('text');
  if (colA === -1) missingColumns.push('optionA');
  if (colB === -1) missingColumns.push('optionB');
  if (colC === -1) missingColumns.push('optionC');
  if (colD === -1) missingColumns.push('optionD');
  if (colAns === -1) missingColumns.push('answerIndex');

  if (missingColumns.length > 0) {
    return {
      totalRows: lines.length - 1,
      successCount: 0,
      failedCount: lines.length - 1,
      errors: [
        {
          row: 1,
          reason: `Missing mandatory header columns: ${missingColumns.join(', ')}. Expected: chapterId, text, optionA, optionB, optionC, optionD, answerIndex, explanation, difficulty`,
        },
      ],
    };
  }

  const validQuestions: Question[] = [];
  const errors: { row: number; reason: string; rawData?: string }[] = [];

  // Helper for CSV row splitting supporting quotes
  function parseCSVRow(rowStr: string): string[] {
    const pattern = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
    const values: string[] = [];
    let match;
    while ((match = pattern.exec(rowStr)) !== null) {
      if (match.index === pattern.lastIndex) pattern.lastIndex++;
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      values.push((val || '').trim());
    }
    return values;
  }

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const line = lines[i].trim();
    if (!line) continue; // skip blank line

    const cols = parseCSVRow(line);
    const text = cols[colText]?.trim();
    const optA = cols[colA]?.trim();
    const optB = cols[colB]?.trim();
    const optC = cols[colC]?.trim();
    const optD = cols[colD]?.trim();
    const rawAns = cols[colAns]?.trim();
    const explanation = (colExp !== -1 ? cols[colExp]?.trim() : '') || 'Standard BCS examination review point.';
    const rawDiff = colDiff !== -1 ? cols[colDiff]?.trim() : 'Intermediate';
    const chapterId = (colChapterId !== -1 ? cols[colChapterId]?.trim() : '') || 'chap-1-1';

    // Validations
    if (!text || text.length < 5) {
      errors.push({ row: rowNum, reason: 'Question text must be at least 5 characters long.', rawData: line.slice(0, 60) });
      continue;
    }

    if (!optA || !optB || !optC || !optD) {
      errors.push({ row: rowNum, reason: 'All four options (optionA, optionB, optionC, optionD) must be provided.', rawData: line.slice(0, 60) });
      continue;
    }

    // Answer Index translation
    let answerIndex = -1;
    if (rawAns === '0' || rawAns?.toUpperCase() === 'A') answerIndex = 0;
    else if (rawAns === '1' || rawAns?.toUpperCase() === 'B') answerIndex = 1;
    else if (rawAns === '2' || rawAns?.toUpperCase() === 'C') answerIndex = 2;
    else if (rawAns === '3' || rawAns?.toUpperCase() === 'D') answerIndex = 3;

    if (answerIndex === -1) {
      errors.push({
        row: rowNum,
        reason: `Invalid answerIndex "${rawAns}". Allowed values: 0, 1, 2, 3 or A, B, C, D.`,
        rawData: line.slice(0, 60),
      });
      continue;
    }

    let difficulty: Difficulty = 'Intermediate';
    const normDiff = rawDiff.toLowerCase();
    if (normDiff.includes('begin') || normDiff.includes('easy')) difficulty = 'Beginner';
    else if (normDiff.includes('adv') || normDiff.includes('hard')) difficulty = 'Advanced';

    validQuestions.push({
      id: `q-imp-${Date.now()}-${i}`,
      chapterId,
      subjectId: defaultSubjectId,
      text,
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      answerIndex,
      explanation,
      difficulty,
      tags: ['Imported', difficulty],
    });
  }

  // If questions were parsed, append to storage
  if (validQuestions.length > 0) {
    const existing = storageService.getQuestions();
    storageService.saveQuestions([...existing, ...validQuestions]);
    storageService.addAuditLog(
      'howladerahsan@gmail.com',
      'QUESTION_CSV_IMPORT',
      `Imported ${validQuestions.length} questions successfully. (${errors.length} errors)`,
      errors.length > 0 ? 'warning' : 'success'
    );
  }

  return {
    totalRows: lines.length - 1,
    successCount: validQuestions.length,
    failedCount: errors.length,
    errors,
  };
}

export function getSampleQuestionCSV(): string {
  return `chapterId,text,optionA,optionB,optionC,optionD,answerIndex,explanation,difficulty
chap-1-1,"Who designed the official National Emblem of Bangladesh?",Quamrul Hassan,Novera Ahmed,Hamidur Rahman,Zainul Abedin,0,"Artist Quamrul Hassan designed the National Emblem featuring the Water Lily (Shapla) surrounded by paddy sheaves.",Intermediate
chap-1-1,"In which year was the historic Six-Point Demand proclaimed by Sheikh Mujibur Rahman?",1964,1966,1969,1970,1,"The historic Six-Point program was announced in Lahore in February 1966.",Beginner
chap-1-2,"According to the Bangladesh Constitution, what is the minimum age to be elected President?",30 years,35 years,25 years,40 years,1,"Under Article 48 of the Bangladesh Constitution, the candidate must be at least 35 years old.",Intermediate
chap-2-1,"Which country currently holds the presidency of the G20 for the 2026 term?",South Africa,India,Brazil,USA,0,"South Africa assumed the G20 rotating presidency.",Intermediate`;
}
