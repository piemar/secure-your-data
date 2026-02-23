import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { InlineHintMarker, type InlineHint, type SkeletonTier } from './InlineHintMarker';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MONACO_LAB_EDITOR_OPTIONS, defineLabDarkTheme, registerMongoshLanguage, LAB_EDITOR_THEME } from '@/lib/monacoLabEditorOptions';

interface InlineHintEditorProps {
  code: string;
  /** When provided, editor is controlled and editable (when not read-only). Run uses this value. */
  controlledValue?: string;
  onCodeChange?: (value: string) => void;
  language: string;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  hasSkeleton: boolean;
  isSolutionRevealed: boolean;
  inlineHints?: InlineHint[];
  tier: SkeletonTier;
  revealedHints: number[];
  revealedAnswers: number[];
  onRevealHint: (hintIdx: number) => void;
  onRevealAnswer: (hintIdx: number) => void;
  equalHeightSplit?: boolean;
  /** When true, editor fills its container (flex-1 min-h-0) and uses height 100% for responsive layout with console pane. */
  fillContainer?: boolean;
}

interface BlankPosition {
  hintIdx: number;
  line: number;
  column: number;
  blankStart: number;
  blankLength: number;
  hint: InlineHint;
}

export function InlineHintEditor({
  code,
  controlledValue,
  onCodeChange,
  language,
  lineHeight,
  setLineHeight,
  hasSkeleton,
  isSolutionRevealed,
  inlineHints,
  tier,
  revealedHints,
  revealedAnswers,
  onRevealHint,
  onRevealAnswer,
  equalHeightSplit,
  fillContainer = false,
}: InlineHintEditorProps) {
  // Allow editing so users can fill in blanks; skeleton is initial content only
  const isReadOnly = false;
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);
  const [blankPositions, setBlankPositions] = useState<BlankPosition[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Find all blank positions by matching each hint's blankText; supports multiple blanks per line.
  // When multiple hints share a line, search for each blankText after the previous match so we don't
  // match a shorter blank (e.g. _______) inside an earlier longer one (e.g. _________).
  const findBlankPositions = useCallback((codeText: string, hints: InlineHint[]): BlankPosition[] => {
    const positions: BlankPosition[] = [];
    const lines = codeText.split('\n');
    const hintsByLine = new Map<number, number[]>();
    hints.forEach((_, hintIdx) => {
      const lineNum = hints[hintIdx].line;
      if (!hintsByLine.has(lineNum)) hintsByLine.set(lineNum, []);
      hintsByLine.get(lineNum)!.push(hintIdx);
    });

    // Per line: search from this index so we get the next occurrence of blankText (not the first if already used).
    const searchFromByLine = new Map<number, number>();

    hints.forEach((hint, hintIdx) => {
      const lineIndex = hint.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) return;
      const lineText = lines[lineIndex];
      const blankText = hint.blankText;

      if (blankText) {
        const fromIndex = searchFromByLine.get(hint.line) ?? 0;
        const explicitIndex = lineText.indexOf(blankText, fromIndex);
        if (explicitIndex !== -1) {
          searchFromByLine.set(hint.line, explicitIndex + blankText.length);
          positions.push({
            hintIdx,
            line: hint.line,
            column: explicitIndex + Math.floor(blankText.length / 2) + 1,
            blankStart: explicitIndex,
            blankLength: blankText.length,
            hint,
          });
          return;
        }
      }

      const underscoreRuns: { index: number; length: number }[] = [];
      const re = /_{2,}/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(lineText)) !== null) {
        underscoreRuns.push({ index: m.index, length: m[0].length });
      }
      const lineHintIndices = hintsByLine.get(hint.line) ?? [];
      const positionOnLine = lineHintIndices.indexOf(hintIdx);
      if (positionOnLine >= 0 && positionOnLine < underscoreRuns.length) {
        const run = underscoreRuns[positionOnLine];
        positions.push({
          hintIdx,
          line: hint.line,
          column: run.index + Math.floor(run.length / 2) + 1,
          blankStart: run.index,
          blankLength: run.length,
          hint,
        });
      }
    });

    return positions;
  }, []);

  // Generate code with revealed answers filled in
  const displayCode = useMemo(() => {
    if (!inlineHints || revealedAnswers.length === 0) return code;
    
    const lines = code.split('\n');
    
    // For each revealed answer, replace the blank with the answer
    inlineHints.forEach((hint, hintIdx) => {
      if (revealedAnswers.includes(hintIdx)) {
        const lineIndex = hint.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const lineText = lines[lineIndex];
          // Replace the blank pattern with the answer
          lines[lineIndex] = lineText.replace(/_{5,}/, hint.answer);
        }
      }
    });
    
    return lines.join('\n');
  }, [code, inlineHints, revealedAnswers]);

  const editorValue = isReadOnly ? displayCode : (controlledValue ?? code);

  // Update blank positions when code or hints change
  useEffect(() => {
    if (inlineHints && inlineHints.length > 0 && hasSkeleton && !isSolutionRevealed) {
      const positions = findBlankPositions(code, inlineHints);
      setBlankPositions(positions);
    } else {
      setBlankPositions([]);
    }
  }, [code, inlineHints, hasSkeleton, isSolutionRevealed, findBlankPositions]);

  // Handle editor mount
  const handleEditorMount = useCallback((editor: any, monaco: Monaco) => {
    setEditorInstance(editor);
    setMonacoInstance(monaco);
    
    // Get actual line height from Monaco
    const options = editor.getOptions();
    const actualLineHeight = options.get(66) || 19; // 66 = EditorOption.lineHeight
    setLineHeight(actualLineHeight);
    
    // Initialize scroll position (in case editor is pre-scrolled or in a scroll container)
    try {
      setScrollTop(editor.getScrollTop?.() ?? 0);
      setScrollLeft(editor.getScrollLeft?.() ?? 0);
    } catch {
      // ignore
    }
    
    // Track scroll position
    editor.onDidScrollChange((e: any) => {
      setScrollTop(e.scrollTop || 0);
      setScrollLeft(e.scrollLeft || 0);
    });
    
    // Mark editor as ready after a short delay to ensure layout is complete
    // This triggers a re-render so hint markers position correctly
    requestAnimationFrame(() => {
      setIsEditorReady(true);
    });
  }, [setLineHeight]);

  // Apply decorations for revealed answers (green highlight)
  useEffect(() => {
    if (!editorInstance || !monacoInstance || !inlineHints) return;
    
    const decorations: any[] = [];
    
    // Find positions of revealed answers in the displayCode
    const lines = displayCode.split('\n');
    inlineHints.forEach((hint, hintIdx) => {
      if (revealedAnswers.includes(hintIdx)) {
        const lineIndex = hint.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const lineText = lines[lineIndex];
          // Find the answer in the line
          const answerIndex = lineText.indexOf(hint.answer);
          if (answerIndex !== -1) {
            decorations.push({
              range: new monacoInstance.Range(
                hint.line,
                answerIndex + 1,
                hint.line,
                answerIndex + hint.answer.length + 1
              ),
              options: {
                inlineClassName: 'revealed-answer-green',
              }
            });
          }
        }
      }
    });
    
    // Apply decorations
    const decorationIds = editorInstance.deltaDecorations([], decorations);
    
    return () => {
      if (editorInstance) {
        editorInstance.deltaDecorations(decorationIds, []);
      }
    };
  }, [editorInstance, monacoInstance, inlineHints, revealedAnswers, displayCode]);

  // Calculate pixel position for a line/column in the editor.
  // The "?" marker must appear exactly where the blank (___________) is rendered.
  const getPositionPixels = useCallback((lineNumber: number, column: number) => {
    if (!editorInstance) return { top: 0, left: 0 };

    // Prefer Monaco's API so the marker aligns with the actual rendered position.
    try {
      const position = { lineNumber, column };
      const coords = editorInstance.getScrolledVisiblePosition(position);
      if (coords != null && typeof coords.top === 'number' && typeof coords.left === 'number') {
        return {
          top: Math.max(0, coords.top),
          left: Math.max(0, coords.left - 10), // -10 so "?" sits near start of blank
        };
      }
    } catch {
      // fall through to fallback
    }

    // Fallback: approximate from line/column (matches editor padding and font)
    const isTerminal = ['shell', 'bash', 'sh'].includes((language || '').toLowerCase());
    const lineNumWidth = isTerminal ? 0 : 40;
    const paddingTop = 6; // match Monaco options padding.top
    const fontSize = 10; // match Monaco options fontSize
    const charWidth = fontSize * 0.6;
    const contentTop = (lineNumber - 1) * lineHeight + paddingTop - scrollTop;
    const top = Math.max(0, contentTop);
    const left = lineNumWidth + (column - 1) * charWidth - scrollLeft - 10;
    return { top, left };
  }, [editorInstance, lineHeight, scrollTop, scrollLeft, language]);

  // Show "?" hint markers whenever we have skeleton + inline hints + blanks found (any tier).
  // This ensures placeholders always get a hint marker for guided learning.
  const showMarkers =
    hasSkeleton &&
    !isSolutionRevealed &&
    (inlineHints?.length ?? 0) > 0 &&
    blankPositions.length > 0 &&
    isEditorReady;

  // Filter out positions where answer is already revealed
  const visiblePositions = blankPositions.filter(pos => !revealedAnswers.includes(pos.hintIdx));

  // Configure Monaco before mount: lab-dark theme (matches app background) + CSS for green answers
  const handleBeforeMount = useCallback((monaco: Monaco) => {
    defineLabDarkTheme(monaco);
    registerMongoshLanguage(monaco);
    // Define custom CSS for the revealed answer decoration
    const styleElement = document.getElementById('monaco-answer-styles') || document.createElement('style');
    styleElement.id = 'monaco-answer-styles';
    styleElement.textContent = `
      .revealed-answer-green {
        color: #22c55e !important;
        font-weight: 600;
      }
    `;
    if (!document.getElementById('monaco-answer-styles')) {
      document.head.appendChild(styleElement);
    }
  }, []);

  // Calculate dynamic height based on line count (when not filling container).
  // Add extra rows so scroll works effectively; same principle for node and mongosh.
  const lineCount = displayCode.split('\n').length;
  const EXTRA_ROWS = 6; // extra lines so there is room to scroll
  const paddingVertical = 16; // 8px top + 8px bottom
  const effectiveLines = lineCount + EXTRA_ROWS;
  const calculatedHeight = equalHeightSplit
    ? Math.max(200, Math.min(350, effectiveLines * lineHeight + paddingVertical))
    : Math.max(200, Math.min(600, effectiveLines * lineHeight + paddingVertical));

  const useFillHeight = fillContainer || equalHeightSplit;

  return (
    <div 
      className={cn(
        "relative",
        equalHeightSplit && "flex-1 min-h-[200px]",
        useFillHeight && "flex-1 min-h-0",
        !useFillHeight && "flex-shrink-0"
      )} 
      ref={containerRef}
    >
      <Editor
        height={useFillHeight ? "100%" : `${calculatedHeight}px`}
        language={language === 'bash' ? 'shell' : language}
        value={editorValue}
        onChange={(v) => !isReadOnly && onCodeChange?.(v ?? '')}
        theme={LAB_EDITOR_THEME}
        options={{
          ...MONACO_LAB_EDITOR_OPTIONS,
          readOnly: isReadOnly,
          fontSize: 10,
          padding: { top: 6, bottom: 48 },
          lineHeight: lineHeight,
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          // Shell/terminal: no line numbers so it looks like a real terminal
          ...(['shell', 'bash', 'sh'].includes((language || '').toLowerCase())
            ? { lineNumbers: 'off' as const, lineDecorationsWidth: 0, renderLineHighlight: 'none' }
            : {}),
        }}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
      />
      
      {/* Inline Hint Markers - Positioned at each blank */}
      {showMarkers && visiblePositions.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {visiblePositions.map(({ hintIdx, line, column, hint }) => {
            const hintRevealed = revealedHints.includes(hintIdx);
            const answerRevealed = revealedAnswers.includes(hintIdx);
            const pos = getPositionPixels(line, column);
            
            // Don't render if position is significantly off-screen (allow some buffer)
            // Use calculatedHeight as upper bound instead of arbitrary 1000
            const heightForBounds = useFillHeight ? (containerRef.current?.clientHeight ?? calculatedHeight) : calculatedHeight;
            if (pos.top < -30 || pos.top > heightForBounds + 50) return null;
            
            return (
              <motion.div 
                key={hintIdx}
                className="absolute pointer-events-auto z-10"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: hintIdx * 0.05, type: "spring", stiffness: 400, damping: 20 }}
                style={{ 
                  top: pos.top - 2, // Slight vertical adjustment to center on text
                  left: pos.left,
                }}
              >
                <InlineHintMarker
                  hint={hint}
                  hintRevealed={hintRevealed}
                  answerRevealed={answerRevealed}
                  onRevealHint={() => onRevealHint(hintIdx)}
                  onRevealAnswer={() => onRevealAnswer(hintIdx)}
                  tier={tier}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}