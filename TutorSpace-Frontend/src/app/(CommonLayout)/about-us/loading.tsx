export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10" />
          <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        </div>
        <p className="text-sm font-medium text-indigo-200 animate-pulse">Loading TutorSpace...</p>
      </div>
    </div>
  )
}