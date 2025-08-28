import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Container } from './ui/reused-ui/Container.jsx'
import { getFoodsArray } from './Foods.jsx'


const PartsOfWhole = () => {
    // State Management
    const [numerator, setNumerator] = useState(2);
    const [denominator, setDenominator] = useState(2);
    const [numeratorInput, setNumeratorInput] = useState(1);
    const [denominatorInput, setDenominatorInput] = useState(1);
    const [numeratorColor, setNumeratorColor] = useState('red');
    const [denominatorColor, setDenominatorColor] = useState('yellow');
    const [currentFoodType, setCurrentFoodType] = useState(null);
    const [foodInfo, setFoodInfo] = useState({ foodName: 'food', toppingName: 'topping' });
    const [isWrongAnswer, setIsWrongAnswer] = useState(false);
    const [feedbackState, setFeedbackState] = useState('button'); // 'button', 'showText'
    
    // Food array management
    const [foodsArray, setFoodsArray] = useState([]);
    const [currentFoodIndex, setCurrentFoodIndex] = useState(0);

    // Initialize foods array on mount
    useEffect(() => {
        const newFoodsArray = getFoodsArray();
        setFoodsArray(newFoodsArray);
        setCurrentFoodIndex(0);
        
        // Set initial food properties
        if (newFoodsArray.length > 0) {
            const firstFood = newFoodsArray[0];
            setNumeratorColor(firstFood.numeratorColor);
            setDenominatorColor(firstFood.denominatorColor);
            setCurrentFoodType(firstFood.name);
            setFoodInfo({
                foodName: firstFood.foodName,
                toppingName: firstFood.toppingName
            });
        }
    }, []);

    // Functions
    const generateFraction = useCallback(() => {
        let newDenominator;
        
        if (currentFoodType === 'Brownie') {
            // For brownie, only use even denominators: 2, 4, 6, 8, 10, 12
            const evenDenominators = [2, 4, 6, 8, 10, 12];
            newDenominator = evenDenominators[Math.floor(Math.random() * evenDenominators.length)];
        } else {
            // For pizza, use any denominator 2..12
            newDenominator = Math.floor(Math.random() * 11) + 2; // 2..12
        }
        
        const newNumerator = Math.floor(Math.random() * newDenominator) + 1; // 1..denominator
        setDenominator(newDenominator);
        setNumerator(newNumerator);
    }, [currentFoodType]);

    const progressToNextFood = useCallback(() => {
        const nextIndex = currentFoodIndex + 1;
        
        if (nextIndex >= foodsArray.length) {
            // We've completed the array, generate a new one
            const newFoodsArray = getFoodsArray();
            setFoodsArray(newFoodsArray);
            setCurrentFoodIndex(0);
            
            // Set properties for the first food in the new array
            if (newFoodsArray.length > 0) {
                const firstFood = newFoodsArray[0];
                setNumeratorColor(firstFood.numeratorColor);
                setDenominatorColor(firstFood.denominatorColor);
                setCurrentFoodType(firstFood.name);
                setFoodInfo({
                    foodName: firstFood.foodName,
                    toppingName: firstFood.toppingName
                });
            }
        } else {
            // Move to next food in current array
            setCurrentFoodIndex(nextIndex);
            const nextFood = foodsArray[nextIndex];
            setNumeratorColor(nextFood.numeratorColor);
            setDenominatorColor(nextFood.denominatorColor);
            setCurrentFoodType(nextFood.name);
            setFoodInfo({
                foodName: nextFood.foodName,
                toppingName: nextFood.toppingName
            });
        }
    }, [currentFoodIndex, foodsArray]);

    useEffect(() => {
        generateFraction();
    }, [currentFoodType, generateFraction]);

    const handleNumeratorChange = (change) => {
        const newValue = numeratorInput + change;
        if (newValue >= 1 && newValue <= 12) {
            setNumeratorInput(newValue);
        }
    }

    const handleDenominatorChange = (change) => {
        const newValue = denominatorInput + change;
        if (newValue >= 2 && newValue <= 12) {
            setDenominatorInput(newValue);
        }
    }

    const handleCheckAnswer = () => {
        const isCorrect = numeratorInput === numerator && denominatorInput === denominator;
        
        if (isCorrect) {
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.5 }
            });
            
            // Immediately show "Great Job!" text
            setFeedbackState('showText');
            
            // After 3 seconds, return to button and progress to next food
            setTimeout(() => {
                setFeedbackState('button');
                progressToNextFood();
                generateFraction();
                setNumeratorInput(1);
                setDenominatorInput(1);
            }, 3000);
        } else {
            // Trigger shake animation
            setIsWrongAnswer(true);
            setTimeout(() => setIsWrongAnswer(false), 500);
        }
    }

	return (
        <Container
            text="Fraction Foods" 
            showResetButton={false}
            borderColor="#FF7B00"
            showSoundButton={true}
        >
            {/* Intro Text */}
            <div className='text-center text-sm text-gray-500 p-5 pb-3'>
                Use your knowledge of fractions to figure out what fraction is being represented by the following foods!
            </div>

            <div className='text-center p-5 pb-2 pt-0'>
                What fraction of the {foodInfo.foodName} has {foodInfo.toppingName}?
            </div>

            {/* Main Content */}
            <div className='w-[90%] flex-grow flex flex-row justify-between items-center'>
                {/* Food Item */}
                <div className='h-auto flex justify-center items-center'>
                    {foodsArray.length > 0 && currentFoodIndex < foodsArray.length && (
                        React.createElement(foodsArray[currentFoodIndex].component, {
                            numerator: numerator,
                            denominator: denominator,
                            numeratorColor: numeratorColor,
                            denominatorColor: denominatorColor
                        })
                    )}
                </div>

                {/* Fraction Input */}
                <div className='h-[100%] flex flex-row justify-center items-center text-center'>
                    <div className='h-[100%] flex flex-col justify-center items-center gap-2'>
                    <div className='flex flex-row justify-center items-center gap-2'>
                        <div className='w-16 h-10 flex items-center font-bold justify-center text-5xl' style={{ color: numeratorColor }}>
                            {numeratorInput}
                        </div>
                        <div className='flex flex-col justify-center items-center gap-1'>
                            <button className='w-6 h-6 flex items-center font-bold justify-center text-xl border border-gray-300 rounded-md' style={{ color: numeratorColor }} onClick={() => handleNumeratorChange(1)}>+</button>
                            <button className='w-6 h-6 flex items-center font-bold justify-center text-xl border border-gray-300 rounded-md' style={{ color: numeratorColor }} onClick={() => handleNumeratorChange(-1)}>-</button>
                        </div>
                    </div>
                    <div className='w-16 h-[2px] bg-gray-500 my-2 mx-auto mr-8'></div>
                    <div className='flex flex-row justify-center items-center gap-2'>
                        <div className='w-16 h-10 flex items-center font-bold justify-center text-5xl' style={{ color: denominatorColor }}>
                            {denominatorInput}
                        </div>
                        <div className='flex flex-col justify-center items-center gap-1'>
                            <button className='w-6 h-6 flex items-center font-bold justify-center text-xl border border-gray-300 rounded-md' style={{ color: denominatorColor }} onClick={() => handleDenominatorChange(1)}>+</button>
                            <button className='w-6 h-6 flex items-center font-bold justify-center text-xl border border-gray-300 rounded-md' style={{ color: denominatorColor }} onClick={() => handleDenominatorChange(-1)}>-</button>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Check Answer Button / Great Job Text */}
            <div className='w-[100%] flex flex-row justify-center items-center text-center pb-5'>
                {feedbackState === 'showText' ? (
                    <div className='text-3xl font-extrabold text-green-700'>
                        Great Job!
                    </div>
                ) : (
                    <button 
                        className={`w-30 p-3 flex items-center bg-green-200 border border-green-500 border-2 rounded-lg text-xl font-extrabold text-green-700 justify-center ${
                            isWrongAnswer ? 'animate-shake' : ''
                        }`} 
                        onClick={handleCheckAnswer}
                    >
                        Check Fraction
                    </button>
                )}
            </div>

            {/* CSS for shake animation */}
            <style jsx='true'>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </Container>
)
};


export default PartsOfWhole;