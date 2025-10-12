'use client';

export default function FloatingButtons() {
  return (
    <>
      {/* Back to top button (shows after scrolling) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 hover:opacity-100 transition-all hover:scale-110 scroll-to-top"
        aria-label="Back to top"
      >
        ↑
      </button>
    </>
  );
}
