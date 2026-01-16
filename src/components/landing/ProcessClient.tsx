'use client';

import { ArrowRight, Search, FileText, Code, TestTube, Rocket, Pause, Play, type LucideIcon } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  iconIndex: number;
}

interface ProcessClientProps {
  steps: Step[];
}

// Icons for process steps - defined in client component
const processIcons: LucideIcon[] = [Search, FileText, Code, TestTube, Rocket];

const AUTO_ADVANCE_DURATION = 5000; // 5 seconds per step

export default function ProcessClient({ steps }: ProcessClientProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate progress bar with requestAnimationFrame for smooth animation
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (!isPaused) {
      progressRef.current += deltaTime;
      const newProgress = (progressRef.current / AUTO_ADVANCE_DURATION) * 100;
      setProgress(Math.min(newProgress, 100));

      if (progressRef.current >= AUTO_ADVANCE_DURATION) {
        // Move to next step
        setActiveStep((prev) => (prev + 1) % steps.length);
        progressRef.current = 0;
        setProgress(0);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isPaused, steps.length]);

  // Start/stop animation based on visibility
  useEffect(() => {
    if (!isVisible) return;

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, animate]);

  // Reset progress when manually changing steps
  const handleStepClick = (index: number) => {
    setActiveStep(index);
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = 0;
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused((prev) => !prev);
    if (isPaused) {
      lastTimeRef.current = 0; // Reset timing on resume
    }
  };

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative py-24 lg:py-32 bg-background overflow-hidden"
      aria-labelledby="process-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-100/30 via-blue-100/30 to-violet-100/30 dark:from-violet-950/20 dark:via-blue-950/20 dark:to-violet-950/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <p className={`text-sm font-medium tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            How It Works
          </p>
          <h2
            id="process-heading"
            className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            From idea to launch
          </h2>
          <p className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            A simple, transparent process that gets your project done in weeks, not months.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          {/* Progress bar with timer */}
          <div className="relative mb-12">
            {/* Background track */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-border rounded-full -translate-y-1/2" />

            {/* Completed progress */}
            <div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full -translate-y-1/2 transition-all duration-300"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />

            {/* Current step progress indicator */}
            {activeStep < steps.length - 1 && (
              <div
                className="absolute top-1/2 h-1 bg-violet-300 dark:bg-violet-700 rounded-full -translate-y-1/2 transition-all duration-100"
                style={{
                  left: `${(activeStep / (steps.length - 1)) * 100}%`,
                  width: `${(progress / 100) * (100 / (steps.length - 1))}%`,
                }}
              />
            )}

            {/* Step indicators */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const IconComponent = processIcons[step.iconIndex] || processIcons[index] || Rocket;
                const isActive = index <= activeStep;
                const isCurrent = index === activeStep;

                return (
                  <button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className={`group relative flex flex-col items-center transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${index * 100 + 300}ms` }}
                    aria-label={`Go to step ${index + 1}: ${step.title}`}
                  >
                    {/* Icon circle */}
                    <div
                      className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isActive
                          ? 'bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30'
                          : 'bg-card border-2 border-border text-muted-foreground hover:border-violet-300 dark:hover:border-violet-700'
                      } ${isCurrent ? 'scale-110 ring-4 ring-violet-200 dark:ring-violet-800' : 'scale-100'}`}
                    >
                      <IconComponent className="w-6 h-6" />

                      {/* Progress ring for current step */}
                      {isCurrent && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                          <circle
                            cx="32"
                            cy="32"
                            r="30"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-violet-200 dark:text-violet-800"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="30"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${progress * 1.885} 188.5`}
                            className="text-white transition-all duration-100"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Step number badge */}
                    <span
                      className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pause/Play indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
              aria-label={isPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Paused - hover to pause</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Auto-advancing</span>
                </>
              )}
            </button>
          </div>

          {/* Active step content */}
          <div className="relative bg-card border border-border rounded-2xl p-8 min-h-[200px]">
            {steps.map((step, index) => {
              const IconComponent = processIcons[step.iconIndex] || processIcons[index] || Rocket;
              const isActive = index === activeStep;

              return (
                <div
                  key={index}
                  className={`absolute inset-0 p-8 flex items-center gap-8 transition-all duration-500 ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
                  }`}
                >
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
                    <IconComponent className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-grow">
                    <span className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2 block">
                      Step {step.number}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => {
            const IconComponent = processIcons[step.iconIndex] || processIcons[index] || Rocket;

            return (
              <div
                key={index}
                className={`relative flex gap-4 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 100 + 300}ms` }}
              >
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 flex-grow bg-gradient-to-b from-violet-500 to-border mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow pb-8">
                  <span className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1 block">
                    Step {step.number}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className={`mt-16 pt-16 border-t border-border transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="font-display text-lg font-medium text-foreground mb-1">
                Ready to start your project?
              </p>
              <p className="text-sm text-muted-foreground">
                Get a professional quote in under 30 seconds.
              </p>
            </div>
            <a
              href="#pricing"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-medium rounded-full transition-all hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5"
              aria-label="Start your project"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
