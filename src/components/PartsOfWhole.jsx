import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Container } from './ui/reused-ui/Container.jsx'
import { getRandomFood } from './Foods.jsx'


const PartsOfWhole = () => {
    // State Management
    const [numerator, setNumerator] = useState(2);
    const [denominator, setDenominator] = useState(2);
    const [numeratorInput, setNumeratorInput] = useState(1);
    const [denominatorInput, setDenominatorInput] = useState(1);
    const [numeratorColor, setNumeratorColor] = useState('red');
    const [denominatorColor, setDenominatorColor] = useState('yellow');

    // Choose a random food on mount
    const FoodComponentRef = useRef(null);
    if (FoodComponentRef.current === null) {
        FoodComponentRef.current = getRandomFood();
    }

    // Functions
    const generateFraction = () => {
        // Choose denominator 2..10 and numerator 1..denominator (proper fraction)
        const newDenominator = Math.floor(Math.random() * 9) + 2; // 2..10
        const newNumerator = Math.floor(Math.random() * newDenominator) + 1; // 1..denominator
        setDenominator(newDenominator);
        setNumerator(newNumerator);
        // setNumerator(10);
        // setDenominator(10);
    }

    useEffect(() => {
        generateFraction();
    }, []);

	return (
        <Container
            text="Fraction Foods" 
            showResetButton={false}
            borderColor="#FF7B00"
            showSoundButton={false}
        >
            {/* Intro Text */}
            <div className='text-center text-sm text-gray-500 p-5'>
                The following food items are cut into equal parts. Use your knowledge of fractions to figure out what fraction is being represented!
            </div>

            <div className='text-center p-5 pt-0'>
                What fraction of the pizza has pepperoni?
            </div>

            {/* Main Content */}
            <div className='flex flex-row justify-center items-center gap-5'>
                {/* Food Item */}
                <div className='w-auto h-auto flex justify-center items-center'>
                    {FoodComponentRef.current && (
                        <FoodComponentRef.current numerator={numerator} denominator={denominator} numeratorColor={numeratorColor} denominatorColor={denominatorColor} />
                    )}
                </div>

                {/* Fraction Input */}
                <div className='h-[100%] flex flex-row justify-center items-center text-center'>
                    <div className='h-[100%] flex flex-col justify-center items-center gap-2'>
                    <div className='flex flex-row justify-center items-center gap-2'>
                        <div className='w-16 h-10 flex items-center font-bold justify-center text-5xl text-red-400'>
                            {numeratorInput}
                        </div>
                        <div className='flex flex-col justify-center items-center gap-1'>
                            <button className='w-6 h-6 flex items-center font-bold justify-center text-xl text-red-400 border border-gray-300 rounded-md'>+</button>
                            <button className='w-6 h-6 flex items-center font-bold justify-center text-xl text-red-400 border border-gray-300 rounded-md'>-</button>
                        </div>
                    </div>
                    <div className='w-16 h-[2px] bg-gray-500 my-2 mx-auto mr-8'></div>
                    <div className='flex flex-row justify-center items-center gap-2'>
                        <div className='w-16 h-10 flex items-center font-bold justify-center text-5xl text-yellow-400'>
                            {denominatorInput}
                        </div>
                        <div className='flex flex-col justify-center items-center gap-1'>
                            <button className='w-6 h-6 flex items-center font-bold justify-center text-xl text-yellow-400 border border-gray-300 rounded-md'>+</button>
                            <button className='w-6 h-6 flex items-center font-bold justify-center text-xl text-yellow-400 border border-gray-300 rounded-md'>-</button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </Container>
)
};


export default PartsOfWhole;