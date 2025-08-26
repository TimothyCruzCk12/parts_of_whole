import React from 'react';
import FlexiWave from '../../../assets/All Flexi Poses/PNG/Flexi_Wave.png';
import '../reused-animations/fade.css';

export function FlexiText({ 
    children, 
    className, 
    flexiImage = FlexiWave,
    flexiAlt = "Flexi Wave",
    showBubble = true,
    bubbleClassName = "",
    containerClassName = "",
    ...props 
}) {
    return (
        <>
            <style>
                {`
                    /* Speech Bubble Styles */
                    .flexi-wave-bottom-left {
                        position: absolute;
                        left: 0.4rem;
                        bottom: 0.4rem;
                        width: 70px;
                        max-width: 70px;
                        min-width: 40px;
                        width: 5rem;
                        height: auto;
                        z-index: 2;
                        pointer-events: none;
                    }
                    
                    .flexi-wave-bubble-container {
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        display: flex;
                        align-items: flex-end;
                        z-index: 3;
                    }
                    
                    .speech-bubble {
                        position: relative;
                        margin-left: 5rem;
                        margin-right: 1rem;
                        margin-bottom: 70px;
                        background: #fff;
                        border-radius: 18px;
                        padding: 7px 13px;
                        font-size: 0.95rem;
                        color: #222;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                        min-width: 160px;
                        max-width: 90vw;
                        word-break: break-word;
                    }
                    
                    .speech-bubble:after {
                        content: '';
                        position: absolute;
                        left: -8px;
                        bottom: -7px;
                        width: 0;
                        height: 0;
                        border-top: 12px solid transparent;
                        border-bottom: 12px solid transparent;
                        border-right: 18px solid #fff;
                        filter: drop-shadow(-5px 2px 2px rgba(0,0,0,0.08));
                        transform: rotate(-34deg);
                    }
                    
                    /* Responsive adjustments */
                    @media (max-width: 500px) {
                        .speech-bubble {
                            font-size: 0.875rem;
                            padding: 6px 10px;
                            min-width: 140px;
                        }
                        
                        .flexi-wave-bottom-left {
                            width: 60px;
                            left: 0.25rem;
                        }
                        
                        .speech-bubble {
                            margin-left: 4rem;
                        }
                    }
                `}
            </style>
            
            <div className={`flexi-wave-bubble-container ${containerClassName} ${className || ''}`} {...props}>
                <img 
                    src={flexiImage} 
                    alt={flexiAlt} 
                    className="flexi-wave-bottom-left" 
                />
                {showBubble && (
                    <div className={`speech-bubble ${bubbleClassName}`}>
                        {children}
                    </div>
                )}
            </div>
        </>
    );
}
