import React, { useState, useEffect } from 'react';

// Custom hook to detect small screens
const useIsSmallScreen = () => {
	const [isSmallScreen, setIsSmallScreen] = useState(false);

	useEffect(() => {
		const checkScreenSize = () => {
			setIsSmallScreen(window.innerWidth <= 351);
		};

		// Check on mount
		checkScreenSize();

		// Add event listener for resize
		window.addEventListener('resize', checkScreenSize);

		// Cleanup
		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	return isSmallScreen;
};

export const getRandomFood = (setNumeratorColor, setDenominatorColor, setCurrentFoodType, setFoodInfo) => {
	const foodTypes = [
		{ 
			component: Pizza, 
			name: 'Pizza',
			foodName: 'pizza',
			toppingName: 'pepperoni',
			numeratorColor: '#dc2626', // red
			denominatorColor: '#fcd34d' // yellow
		},
		{ 
			component: Brownie, 
			name: 'Brownie',
			foodName: 'brownie',
			toppingName: 'sprinkles',
			numeratorColor: '#3b82f6', // blue
			denominatorColor: '#8b4513' // brown
		}
	];
	
	const selectedFood = foodTypes[Math.floor(Math.random() * foodTypes.length)];
	
	// Set the colors and food type based on the selected food
	if (setNumeratorColor && setDenominatorColor) {
		setNumeratorColor(selectedFood.numeratorColor);
		setDenominatorColor(selectedFood.denominatorColor);
	}
	
	if (setCurrentFoodType) {
		setCurrentFoodType(selectedFood.name);
	}
	
	if (setFoodInfo) {
		setFoodInfo({
			foodName: selectedFood.foodName,
			toppingName: selectedFood.toppingName
		});
	}
	
	return selectedFood.component;
};

const Pizza = ({
	/** Overall rendered size in pixels */
	size = 160,
	/** Whether to draw faint slice divider lines */
	showSliceLines = true,
	/** Number of slices that have pepperoni (the shaded fraction numerator) */
	numerator = 0,
	/** Total number of slices (the fraction denominator) */
	denominator = 8,
	/** Color used to represent the numerator (filled fraction) */
	numeratorColor = '#dc2626',
	/** Color used to represent the denominator (unfilled/background fraction) */
	denominatorColor = '#fcd34d',
}) => {
	const isSmallScreen = useIsSmallScreen();
	const totalSlices = Math.max(1, Math.floor(denominator || 1));
	const filledSlices = Math.min(Math.max(0, Math.floor(numerator || 0)), totalSlices);
	// Standardize first slice divider at 12 o'clock (requires 180deg rotation due to default downwards orientation)
	const sliceWidthDeg = 360 / totalSlices;
	const baseCssOffsetDeg = 180;
	const sliceAngles = Array.from({ length: totalSlices }, (_, i) => baseCssOffsetDeg + i * sliceWidthDeg);

	// Responsive scaling factor for small screens
	const scaleFactor = isSmallScreen ? 0.75 : 1;
	
	// Geometry helpers - use scaled size for all calculations
	const effectiveSize = size * scaleFactor;
	const center = effectiveSize / 2;
	const cheeseInset = effectiveSize * 0.08; // matches inset-[8%]
	const maxRadius = center - cheeseInset;
	const degToRad = (deg) => deg * (Math.PI / 180);

	// Pepperoni positions: place per selected slice, centered between its two divider lines
	const pepperoniCircles = [];
	for (let s = 0; s < filledSlices; s++) {
		// Angle measured clockwise from 12 o'clock
		const angleDegClockFromTop = (s + 0.5) * sliceWidthDeg;
		const angleRad = degToRad(angleDegClockFromTop);

		// Compute radius: aim for a middle distance, adjust outward only if wedge is too narrow
		const basePepperoniDiameter = 24; // tailwind w-6 h-6 ~ 24px assuming 1rem=16px
		const pepperoniDiameter = basePepperoniDiameter * scaleFactor;
		const pepperoniRadius = pepperoniDiameter / 2;
		const safetyMargin = 4; // px
		const halfSliceRad = degToRad(sliceWidthDeg) / 2;
		const maxCenterR = Math.max(0, maxRadius - pepperoniRadius - 1);
		const minCenterR = pepperoniRadius + 1;
		// Target radius should be proportional to the scaled pizza
		const targetCenterR = Math.min(maxCenterR, Math.max(minCenterR, maxRadius * 0.6));
		const requiredRForAngularFit =
			totalSlices === 1 ? minCenterR : (pepperoniDiameter + safetyMargin) / (2 * Math.sin(halfSliceRad));
		const r = Math.min(Math.max(targetCenterR, requiredRForAngularFit, minCenterR), maxCenterR);

		// Convert top-origin clockwise polar to screen coords (y down)
		const x = center + r * Math.sin(angleRad);
		const y = center - r * Math.cos(angleRad);
		pepperoniCircles.push({ left: x, top: y });
	}

	return (
		<div
			className={`pizza-container relative w-auto h-auto select-none`}
			style={{ width: effectiveSize, height: effectiveSize }}
			aria-label="Pizza"
			role="img"
		>
			{/* Crust */}
			<div className="absolute inset-0 rounded-full bg-amber-700 shadow-md" />

			{/* Cheese layer */}
			<div
				className="absolute inset-[8%] rounded-full shadow-inner bg-yellow-300"
			/>

			{/* Pepperoni toppings for filled slices */}
			{pepperoniCircles.map((pos, idx) => {
				const responsivePepperoniSize = 24 * scaleFactor;
				return (
					<div
						key={`pep-${idx}`}
						className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-red-700 shadow-[inset_0_2px_0_rgba(0,0,0,0.2)]"
						style={{ 
							top: `${pos.top}px`, 
							left: `${pos.left}px`, 
							backgroundColor: numeratorColor,
							width: `${responsivePepperoniSize}px`,
							height: `${responsivePepperoniSize}px`
						}}
					/>
				);
			})}

			{/* Slice divider lines */}
			{showSliceLines &&
				sliceAngles.map((deg, i) => (
					<div
						key={`line-${i}`}
						className="absolute left-1/2 top-1/2 origin-top bg-white/60"
						style={{
							width: '3px',
							height: effectiveSize / 2,
							transform: `translate(-50%, 0) rotate(${deg}deg)`,
						}}
					/>
				))}
		</div>
	);
};


const Brownie = ({
	/** Overall size driver in pixels (controls both width and height proportionally) */
	size = 180,
	/** Whether to draw faint segment divider lines */
	showSliceLines = true,
	/** Number of decorated segments (sprinkled numerator) */
	numerator = 0,
	/** Total number of segments */
	denominator = 8,
	/** Primary sprinkle color (defaults to blue) */
	numeratorColor = '#3b82f6',
	/** Brownie base color */
	denominatorColor = '#8b4513',
	className = '',
}) => {
	const totalSegments = Math.max(1, Math.floor(denominator || 1));
	const filledSegments = Math.min(Math.max(0, Math.floor(numerator || 0)), totalSegments);

	// Rectangle geometry
	const width = Math.round(size * 1.2);
	const height = Math.round(size * 0.8);
	const insetPct = 0.08; // 8% content inset to mimic a rim
	const insetX = Math.round(width * insetPct);
	const insetY = Math.round(height * insetPct);
	const innerWidth = width - insetX * 2;
	const innerHeight = height - insetY * 2;

	// Grid layout for even denominators
	const getGridDimensions = (total) => {
		if (total === 2) return { cols: 2, rows: 1 };
		if (total === 4) return { cols: 2, rows: 2 };
		if (total === 6) return { cols: 3, rows: 2 };
		if (total === 8) return { cols: 4, rows: 2 };
		if (total === 10) return { cols: 5, rows: 2 };
		if (total === 12) return { cols: 4, rows: 3 };
		return { cols: total, rows: 1 }; // fallback
	};

	const { cols, rows } = getGridDimensions(totalSegments);
	const segmentWidth = innerWidth / cols;
	const segmentHeight = innerHeight / rows;

	// Secondary sprinkle color (blue)
	const numeratorSecondaryColor = '#3b82f6';

	// Simple deterministic pseudo-random for stable sprinkle layout
	const seededRandom = (seed) => {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	};

	// Generate sprinkle positions for numerator segments
	const sprinkleElements = [];
	const sprinklesPerSegment = 18;
	for (let seg = 0; seg < filledSegments; seg++) {
		// Convert segment index to grid position
		const gridCol = seg % cols;
		const gridRow = Math.floor(seg / cols);

		for (let i = 0; i < sprinklesPerSegment; i++) {
			const seedBase = seg * 1000 + i * 37;
			const rx = seededRandom(seedBase + 1);
			const ry = seededRandom(seedBase + 2);
			const rAngle = (seededRandom(seedBase + 3) - 0.5) * 90; // -45..45 deg
			const color = i % 2 === 0 ? numeratorColor : numeratorSecondaryColor;

			const left = insetX + gridCol * segmentWidth + rx * segmentWidth;
			const top = insetY + gridRow * segmentHeight + ry * segmentHeight;

			sprinkleElements.push(
				<div
					key={`spr-${seg}-${i}`}
					className="absolute"
					style={{
						left: `${left}px`,
						top: `${top}px`,
						width: '2px',
						height: '8px',
						backgroundColor: color,
						borderRadius: '2px',
						transform: `translate(-50%, -50%) rotate(${rAngle}deg)`,
						boxShadow: '0 0 0 1px rgba(0,0,0,0.05) inset',
					}}
				/>
			);
		}
	}

	return (
		<div
			className={`relative select-none`}
			style={{ width, height }}
			aria-label="Brownie"
			role="img"
		>
			{/* Brownie base */}
			<div className="absolute inset-0 rounded-lg shadow-md" style={{ backgroundColor: denominatorColor }} />

			{/* Inner surface (slight lightening) */}
			<div
				className="absolute rounded-md"
				style={{
					left: `${insetX}px`,
					right: `${insetX}px`,
					top: `${insetY}px`,
					bottom: `${insetY}px`,
					background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.05))',
				}}
			/>

			{/* Sprinkles for numerator segments */}
			{sprinkleElements}

			{/* Vertical divider lines */}
			{showSliceLines &&
				Array.from({ length: cols - 1 }, (_, i) => {
					const x = (i + 1) * (width / cols);
					return (
						<div
							key={`brow-v-line-${i}`}
							className="absolute top-0 bottom-0 bg-white/60"
							style={{ 
								left: `${x}px`,
								width: '3px'
							}}
						/>
					);
				})}

			{/* Horizontal divider lines */}
			{showSliceLines && rows > 1 &&
				Array.from({ length: rows - 1 }, (_, i) => {
					const y = (i + 1) * (height / rows);
					return (
						<div
							key={`brow-h-line-${i}`}
							className="absolute left-0 right-0 bg-white/60"
							style={{ 
								top: `${y}px`,
								height: '3px'
							}}
						/>
					);
				})}
		</div>
	);
};


