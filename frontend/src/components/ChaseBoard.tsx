interface ChaseBoardProps {
  boardSize: number
  playerPosition: number
  chaserPosition: number
}

/**
 * Renders a vertical chase board:
 * - Position 0 at TOP = CHASER START
 * - Position boardSize at BOTTOM = HOME
 * - Player (blue) and Chaser (red) tokens
 */
function ChaseBoard({ boardSize, playerPosition, chaserPosition }: ChaseBoardProps) {
  const positions = Array.from({ length: boardSize + 1 }, (_, i) => i)

  return (
    <div className="flex flex-col items-center w-full max-w-[280px]">
      <div className="w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-600">
        {positions.map((pos) => {
          const isTop = pos === 0
          const isBottom = pos === boardSize
          const hasPlayer = playerPosition === pos
          const hasChaser = chaserPosition === pos

          return (
            <div
              key={pos}
              className={`
                flex items-center justify-between gap-4 px-4 py-4 min-h-[56px]
                border-b border-slate-600 last:border-b-0
                ${isTop ? 'bg-red-950/40' : ''}
                ${isBottom ? 'bg-amber-500/20' : ''}
                ${!isTop && !isBottom ? 'bg-slate-700/50' : ''}
              `}
            >
              <span className="text-slate-400 font-mono text-base font-bold w-8">
                [{pos}]
              </span>
              <span className="text-slate-300 text-base flex-1 font-medium">
                {isTop && 'CHASER START'}
                {isBottom && 'HOME'}
                {!isTop && !isBottom && '\u00A0'}
              </span>
              <div className="flex gap-2">
                {hasPlayer && (
                  <span className="px-3 py-1.5 rounded-lg bg-sky-500/50 text-sky-100 font-bold text-lg border border-slate-600">
                    YOU
                  </span>
                )}
                {hasChaser && (
                  <span className="px-3 py-1.5 rounded-lg bg-red-500/50 text-red-100 font-bold text-lg border border-slate-600">
                    CHASER
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChaseBoard
