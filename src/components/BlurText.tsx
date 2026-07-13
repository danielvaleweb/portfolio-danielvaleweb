import { motion } from 'motion/react';
import { useEffect, useRef, useState, useMemo } from 'react';

interface KeyframeStep {
  [key: string]: string | number;
}

const buildKeyframes = (from: KeyframeStep, steps: KeyframeStep[]) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);

  const keyframes: { [key: string]: (string | number)[] } = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: KeyframeStep;
  animationTo?: KeyframeStep[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.35
}: BlurTextProps) => {
  const words = useMemo(() => text.split(' '), [text]);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current!);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));

  // If animating by letters, we group by word so we don't break/wrap mid-word
  if (animateBy === 'letters') {
    let globalIndex = 0;
    const totalLetters = text.replace(/\s/g, '').length;
    const isNoWrap = className.includes('nowrap') || className.includes('flex-nowrap');

    return (
      <p 
        ref={ref} 
        className={`${className} flex ${isNoWrap ? 'flex-nowrap' : 'flex-wrap'} justify-center items-center`} 
        style={{ 
          display: 'flex', 
          flexWrap: isNoWrap ? 'nowrap' : 'wrap', 
          justifyContent: 'center', 
          alignItems: 'center',
          overflow: 'visible'
        }}
      >
        {words.map((word, wordIndex) => {
          const letters = word.split('');
          return (
            <span key={wordIndex} className="inline-block whitespace-nowrap">
              {letters.map((char, charIndex) => {
                const currentIndex = globalIndex++;
                const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
                const spanTransition = {
                  duration: totalDuration,
                  times,
                  delay: (currentIndex * delay) / 1000,
                  ease: easing
                };

                return (
                  <motion.span
                    className="inline-block pb-4 pt-1 will-change-[transform,filter,opacity]"
                    key={charIndex}
                    initial={fromSnapshot}
                    animate={inView ? animateKeyframes : fromSnapshot}
                    transition={spanTransition}
                    onAnimationComplete={currentIndex === totalLetters - 1 ? onAnimationComplete : undefined}
                  >
                    {char}
                  </motion.span>
                );
              })}
              {/* Add spacing after word if it is not the last word */}
              {wordIndex < words.length - 1 && (
                <span className="inline-block select-none">&nbsp;</span>
              )}
            </span>
          );
        })}
      </p>
    );
  }

  // Fallback to words animation (original style but with flex container support)
  const isNoWrapFallback = className.includes('nowrap') || className.includes('flex-nowrap');
  return (
    <p 
      ref={ref} 
      className={`${className} flex ${isNoWrapFallback ? 'flex-nowrap' : 'flex-wrap'} justify-center items-center`} 
      style={{ 
        display: 'flex', 
        flexWrap: isNoWrapFallback ? 'nowrap' : 'wrap', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'visible'
      }}
    >
      {words.map((word, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing
        };

        return (
          <motion.span
            className="inline-block pb-4 pt-1 will-change-[transform,filter,opacity]"
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={index === words.length - 1 ? onAnimationComplete : undefined}
          >
            {word}
            {index < words.length - 1 && <span className="inline-block select-none">&nbsp;</span>}
          </motion.span>
        );
      })}
    </p>
  );
};

export default BlurText;
