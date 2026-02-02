import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { InlineHintMarker, type InlineHint, type SkeletonTier } from './InlineHintMarker';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InlineHintEditorProps {
  code: string;
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
}: InlineHintEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);
  const [blankPositions, setBlankPositions] = useState<BlankPosition[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Find all blank positions in the code by matching each hint's blankText
  const findBlankPositions = useCallback((codeText: string, hints: InlineHint[]): BlankPosition[] => {
    const positions: BlankPosition[] = [];
    const lines = codeText.split('\n');
    
    hints.forEach((hint, hintIdx) => {
      // Look for the blank pattern on the specified line
      const lineIndex = hint.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const lineText = lines[lineIndex];
        // Find blank pattern: 5+ consecutive underscores (to avoid matching variable names like KMS_KEY_ID)
        const blankMatch = lineText.match(/_{5,}/);
        if (blankMatch && blankMatch.index !== undefined) {
          positions.push({
            hintIdx,
            line: hint.line,
            // Monaco uses 1-indexed columns, regex index is 0-indexed
            // Position at the middle of the blank
            column: blankMatch.index + Math.floor(blankMatch[0].length / 2) + 1,
            blankStart: blankMatch.index,
            blankLength: blankMatch[0].length,
            hint,
          });
        }
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

  // Calculate pixel position for a line/column in the editor
  const getPositionPixels = useCallback((lineNumber: number, column: number) => {
    if (!editorInstance) return { top: 0, left: 0 };
    
    try {
      // Use Monaco's built-in method to get coordinates
      const position = { lineNumber, column };
      const coords = editorInstance.getScrolledVisiblePosition(position);
      
      if (coords) {
        // Adjust for marker width (w-5 = 20px, so center it)
        return {
          top: coords.top,
          left: coords.left - 10, // Center the 20px marker
        };
      }
    } catch {
      // Fallback to calculation
    }
    
    // Fallback: approximate based on line height and character width
    const fontSize = 11;
    const charWidth = fontSize * 0.6;
    const lineNumWidth = 40; // Approximate line number gutter width
    
    return {
      top: (lineNumber - 1) * lineHeight + 8 - scrollTop, // 8 = padding top
      left: lineNumWidth + (column - 1) * charWidth - scrollLeft - 10, // Center the marker
    };
  }, [editorInstance, lineHeight, scrollTop, scrollLeft]);

  // Show hint markers only in guided mode with unrevealed solution
  // Only show markers for blanks that haven't been answered yet
  // Also requires editor to be ready (so positions are calculated correctly)
  const showMarkers = hasSkeleton && !isSolutionRevealed && tier === 'guided' && blankPositions.length > 0 && isEditorReady;

  // Filter out positions where answer is already revealed
  const visiblePositions = blankPositions.filter(pos => !revealedAnswers.includes(pos.hintIdx));

  // Configure Monaco before mount to add CSS rule for green answers
  const handleBeforeMount = useCallback((monaco: Monaco) => {
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

  // Calculate dynamic height based on line count
  // For 2-block pattern: use flex-based equal split
  // For single blocks or more: use line-based calculation
  const lineCount = displayCode.split('\n').length;
  const paddingVertical = 16; // 8px top + 8px bottom
  const calculatedHeight = equalHeightSplit
    ? Math.max(200, Math.min(350, lineCount * lineHeight + paddingVertical))
    : Math.max(150, Math.min(500, lineCount * lineHeight + paddingVertical));

  return (
    <div 
      className={cn(
        "flex-shrink-0 relative",
        equalHeightSplit && "flex-1 min-h-[200px]"
      )} 
      ref={containerRef}
    >
      <Editor
        height={equalHeightSplit ? "100%" : `${calculatedHeight}px`}
        language={language === 'bash' ? 'shell' : language}
        value={displayCode}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 11,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 8, bottom: 8 },
          lineHeight: lineHeight,
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
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
            if (pos.top < -30 || pos.top > calculatedHeight + 50) return null;
            
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