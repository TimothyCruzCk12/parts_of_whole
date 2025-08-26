import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Container } from './ui/reused-ui/Container.jsx'
import { Pizza } from './Foods.jsx'


const PartsOfWhole = () => {
    // State Management
    const [numerator, setNumerator] = useState(2);
    const [denominator, setDenominator] = useState(2);
    const [numeratorInput, setNumeratorInput] = useState(1);
    const [denominatorInput, setDenominatorInput] = useState(1);

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

            {/* Food Item */}
            <div className='w-[100%] h-auto flex flex-col justify-center pl-5'>
                <Pizza numerator={numerator} denominator={denominator} />
            </div>

            {/* Fraction Input */}
            <div className='flex flex-col justify-center items-center text-center p-5 pt-0'>
                <div className='w-16 h-8 text-center text-lg border border-gray-300 rounded-md'>
                    {numeratorInput}
                </div>
                <div className='w-16 h-[2px] bg-gray-500 my-2 mx-auto'></div>
                <div className='w-16 h-8 text-center text-lg border border-gray-300 rounded-md'
                >
                    {denominatorInput}
                </div>
            </div>

        </Container>
)
};


export default PartsOfWhole;