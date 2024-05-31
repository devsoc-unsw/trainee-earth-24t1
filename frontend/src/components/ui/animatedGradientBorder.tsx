import React, { useRef, useEffect, CSSProperties } from 'react';

export const AnimatedGradientBorder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boxElement = boxRef.current;

    if (!boxElement) {
      return;
    }

    const updateAnimation = () => {
      const angle = (parseFloat(boxElement.style.getPropertyValue("--angle")) + 0.5) % 360;
      boxElement.style.setProperty("--angle", `${angle}deg`);
      requestAnimationFrame(updateAnimation);
    };

    requestAnimationFrame(updateAnimation);
  }, []);

  return (
    <div className='relative h-14 w-14'>
      <div
        ref={boxRef}
        style={
          {
            "--angle": "0deg",
            "--border-color": "linear-gradient(var(--angle), #282b34, #687aff)",
            "--bg-color": "linear-gradient(#282b34, #282b34)",
          } as CSSProperties
        }
        className="absolute rounded-md hover:border-[3px] border-transparent p-[3px] [background:padding-box_var(--bg-color),border-box_var(--border-color)] transition-transform duration-300 hover:scale-110 border-opacity-0 hover:border-opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        {children}
      </div>
    </div>
  );
};

