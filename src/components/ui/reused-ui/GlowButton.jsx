import React, { useState } from 'react';
import '../reused-animations/scale.css';
import '../reused-animations/glow.css';

export function GlowButton({ 
    children, 
    onClick, 
    disabled = false,
    className = '',
    style = {},
    showGlow = true,
    animate = true,
    isShrinking = false,
    isGrowing = false,
    autoShrinkOnClick = true,
    disableShrinkOnClick = false,
    bgColor = null,
    ...props 
}) {
    const [isShrinkingOut, setIsShrinkingOut] = useState(false);

    const handleClick = (e) => {
        if (disabled) return;
        
        // Auto-shrink on click if enabled and not explicitly disabled
        if (autoShrinkOnClick && !disableShrinkOnClick && animate) {
            setIsShrinkingOut(true);
        }
        
        if (onClick) {
            onClick(e);
        }
    };

    // Detect animation classes from className
    const detectAnimationClasses = (classString) => {
        if (!classString) return { animationClasses: '', nonAnimationClasses: '' };
        
        const classes = classString.split(' ').filter(cls => cls.trim());
        const animationCls = classes.filter(cls => cls.includes('-animation'));
        const nonAnimationCls = classes.filter(cls => !cls.includes('-animation'));
        
        return {
            animationClasses: animationCls.join(' '),
            nonAnimationClasses: nonAnimationCls.join(' ')
        };
    };

    const { animationClasses, nonAnimationClasses } = detectAnimationClasses(className);

    const baseClasses = `
        relative select-none transition-colors duration-200
        ${disabled ? 'opacity-50' : 'cursor-pointer'}
    `;

    // Determine which animation to apply
    let buttonAnimationClasses = '';
    if (animate) {
        if (isShrinkingOut) {
            buttonAnimationClasses = 'shrink-out-animation';
        } else if (isShrinking) {
            buttonAnimationClasses = 'shrink-animation';
        } else if (isGrowing) {
            buttonAnimationClasses = 'grow-in-animation';
        }
    }

    const buttonClasses = `
        ${baseClasses}
        bg-[#008545] hover:bg-[#00783E] text-white
        px-3 py-1.5 text-sm
        ${buttonAnimationClasses}
        ${animationClasses}
        rounded
        text-sm font-medium select-none
        ${nonAnimationClasses}
        z-index: 100
    `;

    // Apply shrink animation to glow container as well, but not grow-in animations
    const finalAnimationClasses = isShrinkingOut ? 'shrink-out-animation' : animationClasses;
    
    // Only stop glow for shrink animations, not grow-in animations
    const shouldStopGlow = finalAnimationClasses && !animationClasses.includes('grow-in-animation');
    
    const glowClasses = showGlow ? 
        `glow-button simple-glow ${finalAnimationClasses}${shouldStopGlow ? ' stopped' : ''}` : 
        `glow-button ${finalAnimationClasses}`;

    // Apply custom glow background color if provided
    const glowStyle = bgColor ? { '--bgColor': bgColor } : {};

    return (
        <div className={glowClasses} style={{ ...glowStyle, ...style }}>
            <button
                className={buttonClasses}
                onClick={handleClick}
                disabled={disabled}
                style={{
                    transformOrigin: 'center',
                    borderRadius: '4px',
                    zIndex: 50,
                    pointerEvents: 'auto',
                    ...style
                }}
                {...props}
            >
                {children}
            </button>
        </div>
    );
}