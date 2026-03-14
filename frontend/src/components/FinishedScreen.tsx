interface FinishedScreenProps {
  onPlayAgain: () => void
}

function FinishedScreen({ onPlayAgain }: FinishedScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-amber-400 mb-4">ChaseQuiz</h1>
      <p className="text-slate-400 text-xl mb-10">Game finished</p>

      <button
        onClick={onPlayAgain}
        className="w-full max-w-sm py-4 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg transition-colors"
      >
        Play Again
      </button>
    </div>
  )
}

export default FinishedScreen
