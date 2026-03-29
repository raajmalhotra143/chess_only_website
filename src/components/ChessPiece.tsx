// Inline SVG chess pieces - completely self-contained, no external dependencies
// Piece set: clean flat style matching the reference image

export type PieceColor = 'w' | 'b';
export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';

// Unicode chess pieces rendered beautifully with CSS
export const PIECE_UNICODE: Record<PieceColor, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

interface ChessPieceProps {
  color: PieceColor;
  type: PieceType;
}

export const ChessPiece = ({ color, type }: ChessPieceProps) => {
  const symbol = PIECE_UNICODE[color][type];
  return (
    <span
      style={{
        fontSize: '5.2vmin',
        lineHeight: 1,
        userSelect: 'none',
        display: 'block',
        textAlign: 'center',
        color: color === 'w' ? '#f0f0f0' : '#1a1a2e',
        textShadow:
          color === 'w'
            ? '0 1px 3px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,0.6)'
            : '0 1px 3px rgba(255,255,255,0.15), 0 0 2px rgba(0,0,0,0.4)',
        filter:
          color === 'b'
            ? 'drop-shadow(0 1px 1px rgba(255,255,255,0.2))'
            : 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))',
        fontFamily: '"Segoe UI Symbol", "Apple Color Emoji", "Noto Color Emoji", serif',
      }}
    >
      {symbol}
    </span>
  );
};
