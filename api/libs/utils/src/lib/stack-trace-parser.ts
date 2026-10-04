import { StackFrame } from '@new-poster-parlor-api/shared';

/**
 * 🕵️‍♂️ STACK TRACE PARSER (Xəta Yeri / GPS Detektivi)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * JavaScript-də xəta baş verəndə `error.stack` daxilində çox uzun, oxunması çətin olan mətn zənciri olur.
 * Bu funksiya həmin uzun mətni Regex ilə analiz edir və yalnız bizə lazım olan
 * **fayl adını, funksiyanı, sətir nömrəsini (line) və sütun nömrəsini (column)** təmiz massivə salır.
 * 
 * 🛠️ MÜHÜM XÜSUSİYYƏTİ:
 * `node_modules` daxilindəki lüzumsuz kitabxana sətirlərini təmizləyir, yalnız BİZİM yazdığımız koddakı sətirləri saxlayır!
 */
export function parseStackTrace(error: Error, limit = 3): StackFrame[] {
  if (!error.stack) return [];

  const lines = error.stack.split('\n');
  const frames: StackFrame[] = [];

  // İlk sətir xətanın adıdır, ona görə 1-ci sətirdən başlayırıq
  for (let i = 1; i < lines.length && frames.length < limit; i++) {
    const line = lines[i].trim();

    // Regex vasitəsilə: at FunctionName (path/to/file.ts:15:4) formatını tuturur
    const match = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);

    if (match) {
      const [, funcName, filePath, lineNum, colNum] = match;

      // Fayl yolunun yalnız son 3 hissəsini alırıq (Məsələn: src/service/user.service.ts)
      const cleanPath = filePath
        .split(/[/\\]/)
        .slice(-3)
        .join('/');

      // node_modules qovluğundakı kənar kitabxana sətirlərini nəzərə almırıq
      if (cleanPath.includes('node_modules')) continue;

      frames.push({
        function: funcName?.trim() || 'anonymous',
        file: cleanPath,
        line: parseInt(lineNum, 10),
        column: parseInt(colNum, 10),
      });
    }
  }

  return frames;
}

