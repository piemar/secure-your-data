import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { InlineHintMarker, type InlineHint, type SkeletonTier } from './InlineHintMarker';
import { motion } from 'framer-motion';

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
}

interface BlankPosition {
  hintIdx: number;
  line: number;
  column: number;
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
}: InlineHintEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [blankPositions, setBlankPositions] = useState<BlankPosition[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Find all blank positions in the code by matching each hint's blankText
  const findBlankPositions = useCallback((codeText: string, hints: InlineHint[]): BlankPosition[] => {
    const positions: BlankPosition[] = [];
    const lines = codeText.split('\n');
    
    hints.forEach((hint, hintIdx) => {
      // Look for the blank pattern on the specified line
      const lineIndex = hint.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const lineText = lines[lineIndex];
        // Find blank pattern (underscores) in this line
        const blankMatch = lineText.match(/_+/);
        if (blankMatch && blankMatch.index !== undefined) {
          positions.push({
            hintIdx,
            line: hint.line,
            // Monaco uses 1-indexed columns, regex index is 0-indexed
            // Position right after the last underscore character
            column: blankMatch.index + Math.floor(blankMatch[0].length / 2) + 1,
            hint,
          });
        }
      }
    });
    
    return positions;
  }, []);

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
  const handleEditorMount = useCallback((editor: any) => {
    setEditorInstance(editor);
    
    // Get actual line height from Monaco
    const options = editor.getOptions();
    const actualLineHeight = options.get(66) || 19; // 66 = EditorOption.lineHeight
    setLineHeight(actualLineHeight);
    
    // Track scroll position
    editor.onDidScrollChange((e: any) => {
      setScrollTop(e.scrollTop || 0);
      setScrollLeft(e.scrollLeft || 0);
    });
  }, [setLineHeight]);

  // Calculate pixel position for a line/column in the editor
  const getPositionPixels = useCallback((lineNumber: number, column: number) => {
    if (!editorInstance) return { top: 0, left: 0 };
    
    try {
      // Use Monaco's built-in method to get coordinates
      const position = { lineNumber, column };
      const coords = editorInstance.getScrolledVisiblePosition(position);
      
      if (coords) {
        return {
          top: coords.top,
          left: coords.left,
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
      left: lineNumWidth + (column - 1) * charWidth - scrollLeft,
    };
  }, [editorInstance, lineHeight, scrollTop, scrollLeft]);

  // Show hint markers only in guided mode with unrevealed solution
  const showMarkers = hasSkeleton && !isSolutionRevealed && tier === 'guided' && blankPositions.length > 0;

  return (
    <div className="flex-1 min-h-[150px] sm:min-h-[200px] relative" ref={containerRef}>
      <Editor
        height="100%"
        language={language === 'bash' ? 'shell' : language}
        value={code}
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
        onMount={handleEditorMount}
      />
      
      {/* Inline Hint Markers - Positioned at each blank */}
      {showMarkers && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {blankPositions.map(({ hintIdx, line, column, hint }) => {
            const hintRevealed = revealedHints.includes(hintIdx);
            const answerRevealed = revealedAnswers.includes(hintIdx);
            const pos = getPositionPixels(line, column);
            
            // Don't render if position is off-screen
            if (pos.top < -20 || pos.top > 1000) return null;
            
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