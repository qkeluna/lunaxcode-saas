'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative inline-block w-[60px] h-[34px]">
        <div className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-blue-500 transition-all duration-400 rounded-[34px] overflow-hidden" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <label className="relative inline-block w-[60px] h-[34px] cursor-pointer">
      <input
        id="theme-toggle-input"
        type="checkbox"
        checked={isDark}
        onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
        className="opacity-0 w-0 h-0"
      />
      <div
        className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 transition-all duration-400 rounded-[34px] overflow-hidden ${
          isDark ? 'bg-black' : 'bg-blue-500'
        }`}
      >
        {/* Sun/Moon Circle */}
        <div
          className={`absolute h-[26px] w-[26px] left-1 bottom-1 rounded-full transition-all duration-400 ${
            isDark ? 'translate-x-[26px] bg-white' : 'translate-x-0 bg-yellow-300'
          }`}
          style={{
            animation: isDark ? 'rotate-center 0.6s ease-in-out both' : 'none',
          }}
        >
          {/* Moon Dots (visible in dark mode) */}
          <svg
            className={`moon-dot absolute left-[10px] top-[3px] w-[6px] h-[6px] transition-opacity duration-400 ${
              isDark ? 'opacity-100' : 'opacity-0'
            }`}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="50" fill="gray" />
          </svg>
          <svg
            className={`moon-dot absolute left-[2px] top-[10px] w-[10px] h-[10px] transition-opacity duration-400 ${
              isDark ? 'opacity-100' : 'opacity-0'
            }`}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="50" fill="gray" />
          </svg>
          <svg
            className={`moon-dot absolute left-[16px] top-[18px] w-[3px] h-[3px] transition-opacity duration-400 ${
              isDark ? 'opacity-100' : 'opacity-0'
            }`}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="50" fill="gray" />
          </svg>

          {/* Light Rays (visible in light mode) */}
          <svg
            className={`absolute -left-2 -top-2 w-[43px] h-[43px] -z-10 transition-opacity duration-400 ${
              isDark ? 'opacity-0' : 'opacity-10'
            }`}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="50" fill="white" />
          </svg>
          <svg
            className={`absolute -left-[50%] -top-[50%] w-[55px] h-[55px] -z-10 transition-opacity duration-400 ${
              isDark ? 'opacity-0' : 'opacity-10'
            }`}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="50" fill="white" />
          </svg>
          <svg
            className={`absolute -left-[18px] -top-[18px] w-[60px] h-[60px] -z-10 transition-opacity duration-400 ${
              isDark ? 'opacity-0' : 'opacity-10'
            }`}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="50" fill="white" />
          </svg>
        </div>

        {/* Clouds (animated) */}
        <svg
          className="cloud-light absolute left-[30px] top-[15px] w-[40px]"
          style={{
            animation: 'cloud-move 6s infinite',
          }}
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="50" fill="#eee" />
        </svg>
        <svg
          className="cloud-dark absolute left-[44px] top-[10px] w-[20px]"
          style={{
            animation: 'cloud-move 6s infinite',
            animationDelay: '1s',
          }}
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="50" fill="#ccc" />
        </svg>
        <svg
          className="cloud-light absolute left-[18px] top-[24px] w-[30px]"
          style={{
            animation: 'cloud-move 6s infinite',
          }}
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="50" fill="#eee" />
        </svg>
        <svg
          className="cloud-dark absolute left-[36px] top-[18px] w-[40px]"
          style={{
            animation: 'cloud-move 6s infinite',
            animationDelay: '1s',
          }}
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="50" fill="#ccc" />
        </svg>
        <svg
          className="cloud-light absolute left-[48px] top-[14px] w-[20px]"
          style={{
            animation: 'cloud-move 6s infinite',
          }}
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="50" fill="#eee" />
        </svg>
        <svg
          className="cloud-dark absolute left-[22px] top-[26px] w-[30px]"
          style={{
            animation: 'cloud-move 6s infinite',
            animationDelay: '1s',
          }}
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="50" fill="#ccc" />
        </svg>

        {/* Stars (visible in dark mode) */}
        <div
          className={`absolute transition-all duration-400 ${
            isDark ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}
        >
          <svg
            className="star absolute w-5 top-[2px] left-[3px]"
            viewBox="0 0 20 20"
            style={{
              animation: 'star-twinkle 2s infinite',
              animationDelay: '0.3s',
            }}
          >
            <path
              d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
              fill="white"
            />
          </svg>
          <svg
            className="star absolute w-[6px] top-4 left-[3px]"
            viewBox="0 0 20 20"
            style={{
              animation: 'star-twinkle 2s infinite',
            }}
          >
            <path
              d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
              fill="white"
            />
          </svg>
          <svg
            className="star absolute w-3 top-5 left-[10px]"
            viewBox="0 0 20 20"
            style={{
              animation: 'star-twinkle 2s infinite',
              animationDelay: '0.6s',
            }}
          >
            <path
              d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
              fill="white"
            />
          </svg>
          <svg
            className="star absolute w-[18px] top-0 left-[18px]"
            viewBox="0 0 20 20"
            style={{
              animation: 'star-twinkle 2s infinite',
              animationDelay: '1.3s',
            }}
          >
            <path
              d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes cloud-move {
          0% {
            transform: translateX(0px);
          }
          40% {
            transform: translateX(4px);
          }
          80% {
            transform: translateX(-4px);
          }
          100% {
            transform: translateX(0px);
          }
        }

        @keyframes star-twinkle {
          0% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.2);
          }
          80% {
            transform: scale(0.8);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes rotate-center {
          0% {
            transform: rotate(0) translateX(26px);
          }
          100% {
            transform: rotate(360deg) translateX(26px);
          }
        }
      `}</style>
    </label>
  );
}
