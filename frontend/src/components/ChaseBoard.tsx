interface ChaseBoardProps {
  boardSize: number
  playerPosition: number
  chaserPosition: number
}

/**
 * Renders a vertical chase board:
 * - Position 0 at TOP = CHASER START
 * - Position boardSize at BOTTOM = HOME
 * - Player (P) and Chaser (C) tokens shown in their respective cells
 * - Both can share the same cell
 */
function ChaseBoard({ boardSize, playerPosition, chaserPosition }: ChaseBoardProps) {
  const positions = Array.from({ length: boardSize + 1 }, (_, i) => i)

  return (
    <div className="flex flex-col items-center">
      <div className="border-2 border-slate-600 rounded-lg overflow-hidden bg-slate-800/50">
        {positions.map((pos) => {
          const isTop = pos === 0
          const isBottom = pos === boardSize
          const hasPlayer = playerPosition === pos
          const hasChaser = chaserPosition === pos

          return (
            <div
              key={pos}
              className={`
                flex items-center justify-between gap-4 px-4 py-3 min-w-[200px]
                border-b border-slate-600 last:border-b-0
                ${isTop ? 'bg-slate-700/50' : ''}
                ${isBottom ? 'bg-amber-500/10' : ''}
              `}
            >
              <span className="text-slate-500 font-mono text-sm w-6">
                [{pos}]
              </span>
              <span className="text-slate-400 text-sm flex-1">
                {isTop && 'CHASER START'}
                {isBottom && 'HOME'}
                {!isTop && !isBottom && '\u00A0'}
              </span>
              <div className="flex gap-2">
                {hasPlayer && (
                  <span className="px-2 py-0.5 rounded bg-green-500/30 text-green-400 font-bold text-sm">
                    P
                  </span>
                )}
                {hasChaser && (
                  <span className="px-2 py-0.5 rounded bg-red-500/30 text-red-400 font-bold text-sm">
                    C
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
