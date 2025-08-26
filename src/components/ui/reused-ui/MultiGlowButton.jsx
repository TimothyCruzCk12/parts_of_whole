import React, { useState } from 'react';
import '../reused-animations/scale.css';
import '../reused-animations/glow.css';

export function MultiGlowButton({ 
    buttons = [], // Array of button objects: { text, onClick, disabled, className, style }
    className = '',
    style = {},
    showGlow = true,
    animate = true,
    isShrinking = false,
    isGrowing = false,
    autoShrinkOnClick = true,
    disableShrinkOnClick = false,
    bgColor = null,
    layout = 'horizontal', // 'horizontal' or 'vertical'
    spacing = 'gap-2', // Tailwind spacing class
    responsive = true, // Enable responsive behavior
    minFontSize = 'text-xs', // Font size for small screens (320px-400px)
    maxFontSize = 'text-sm', // Font size for larger screens
    ...props 
}) {
    const [isShrinkingOut, setIsShrinkingOut] = useState(false);

    const handleButtonClick = (buttonIndex, buttonOnClick, e) => {
        const button = buttons[buttonIndex];
        if (button.disabled) return;
        
        // Auto-shrink on click if enabled and not explicitly disabled
        if (autoShrinkOnClick && !disableShrinkOnClick && animate) {
            setIsShrinkingOut(true);
        }
        
        if (buttonOnClick) {
            buttonOnClick(e);
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

    const containerClasses = `
        ${baseClasses}
        ${buttonAnimationClasses}
        ${animationClasses}
        ${nonAnimationClasses}
        ${layout === 'horizontal' ? 'flex flex-row' : 'flex flex-col'}
        ${spacing}
        items-center justify-center
        w-fit max-w-full
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

    const getButtonClasses = (button, index) => {
        const buttonBaseClasses = `
            bg-[#008545] hover:bg-[#00783E] text-white
            px-3 py-1.5
            ${maxFontSize}
            rounded
            font-medium select-none
            transition-colors duration-200
            ${button.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${button.className || ''}
            whitespace-nowrap
            responsive-button
        `;

        return buttonBaseClasses;
    };

    // Add CSS for media query if responsive is enabled
    React.useEffect(() => {
        if (responsive) {
            const styleId = 'multi-glow-button-responsive';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    @media (max-width: 365px) {
                        .responsive-button {
                            font-size: 0.75rem !important;
                            line-height: 1rem !important;
                            padding: 0.25rem 0.5rem !important;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }, [responsive]);

    return (
        <div className={glowClasses} style={{ ...glowStyle, ...style }}>
            <div className={containerClasses} {...props}>
                {buttons.map((button, index) => (
                    <button
                        key={index}
                        className={getButtonClasses(button, index)}
                        onClick={(e) => handleButtonClick(index, button.onClick, e)}
                        disabled={button.disabled}
                        style={{
                            transformOrigin: 'center',
                            borderRadius: '4px',
                            zIndex: 50,
                            pointerEvents: 'auto',
                            ...button.style
                        }}
                    >
                        {button.text}
                    </button>
                ))}
            </div>
        </div>
    );
}