import React from 'react';

export const NavButtons = ({ 
  currentStepIndex, 
  totalSteps, 
  onNavigate, 
  showNavigation = true,
  className = "",
  bgColor = null
}) => {
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < totalSteps - 1;

  const handleNavigate = (direction) => {
    if (direction === 'back' && canGoBack) {
      onNavigate('back', currentStepIndex - 1);
    } else if (direction === 'forward' && canGoForward) {
      onNavigate('forward', currentStepIndex + 1);
    }
  };

  if (!showNavigation) return null;

  return (
    <>
      <style>{`
        @property --r {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }

        .nav-button {
          opacity: 1;
          cursor: default !important;
          position: relative;
          z-index: 2;
          outline: 2px var(--bgColor, white) solid;
        }

        .nav-button-orbit {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(
            from var(--r),
            transparent 0%,
            rgb(0, 255, 132) 2%,
            rgb(0, 214, 111) 8%,
            rgb(0, 174, 90) 12%,
            rgb(0, 133, 69) 14%,
            transparent 15%
          );
          animation: rotating 3s linear infinite;
          z-index: 0;
        }

        .nav-button-orbit::before {
          content: "";
          position: absolute;
          inset: 2px;
          background: var(--bgColor, transparent);
          border-radius: 50%;
          z-index: 0;
        }

        .nav-button svg {
          position: relative;
          z-index: 1;
        }

        @keyframes rotating {
          0% {
            --r: 0deg;
          }
          100% {
            --r: 360deg;
          }
        }
      `}</style>
      
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div
          className="nav-orbit-wrapper"
          style={{
            position: 'relative',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            visibility: canGoBack ? 'visible' : 'hidden',
            opacity: canGoBack ? 1 : 0,
            pointerEvents: canGoBack ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
            ...(bgColor && { '--bgColor': bgColor })
          }}
        >
          <div className="nav-button-orbit"></div>
          <div style={{ 
            position: 'absolute', 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'white', 
            zIndex: 1 
          }}></div>
          <button
            onClick={() => handleNavigate('back')}
            className={`nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#008545]/20 text-[#008545] hover:bg-[#008545]/30 relative z-50`}
            style={bgColor ? { '--bgColor': bgColor } : {}}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>
        
        <span className="text-sm text-gray-500 min-w-[100px] text-center">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        
        <div
          className="nav-orbit-wrapper"
          style={{
            position: 'relative',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            visibility: canGoForward ? 'visible' : 'hidden',
            opacity: canGoForward ? 1 : 0,
            pointerEvents: canGoForward ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
            ...(bgColor && { '--bgColor': bgColor })
          }}
        >
          <div className="nav-button-orbit"></div>
          <div style={{ 
            position: 'absolute', 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'white', 
            zIndex: 1 
          }}></div>
          <button
            onClick={() => handleNavigate('forward')}
            className={`nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#008545]/20 text-[#008545] hover:bg-[#008545]/30 relative z-50`}
            style={bgColor ? { '--bgColor': bgColor } : {}}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};
