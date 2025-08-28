import React, { useState, useEffect } from 'react';

// Custom hook to detect small screens with configurable breakpoint
const useIsSmallScreen = (breakpoint = 351) => {
	const [isSmallScreen, setIsSmallScreen] = useState(false);

	useEffect(() => {
		const checkScreenSize = () => {
			setIsSmallScreen(window.innerWidth <= breakpoint);
		};

		// Check on mount
		checkScreenSize();

		// Add event listener for resize
		window.addEventListener('resize', checkScreenSize);

		// Cleanup
		return () => window.removeEventListener('resize', checkScreenSize);
	}, [breakpoint]);

	return isSmallScreen;
};

// Helper function to calculate scale factor based on screen width
const calculateScaleFactor = (width) => {
	if (width <= 356) {
		return 0.5; // Very small screens
	} else if (width <= 411) {
		return 0.75; // Small screens
	} else {
		return 1; // Normal screens
	}
};

// Custom hook for brownie scaling with multiple breakpoints
const useBrownieScaleFactor = () => {
	// Initialize with correct value if window is available
	const getInitialScaleFactor = () => {
		if (typeof window !== 'undefined') {
			return calculateScaleFactor(window.innerWidth);
		}
		return 1; // Default for SSR
	};

	const [scaleFactor, setScaleFactor] = useState(getInitialScaleFactor);

	useEffect(() => {
		const checkScreenSize = () => {
			const width = window.innerWidth;
			const newScaleFactor = calculateScaleFactor(width);
			
			setScaleFactor(newScaleFactor);
		};

		// Check on mount (in case initial calculation was wrong)
		checkScreenSize();

		// Add event listener for resize
		window.addEventListener('resize', checkScreenSize);

		// Cleanup
		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	return scaleFactor;
};

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

export const getFoodsArray = () => {
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
		},
		{ 
			component: Pancake, 
			name: 'Pancake',
			foodName: 'pancake',
			toppingName: 'blueberries',
			numeratorColor: '#1e3a8a', // dark blue
			denominatorColor: '#eca24d' // warm golden pancake
		},
		{ 
			component: Pie, 
			name: 'Pie',
			foodName: 'key lime pie',
			toppingName: 'lime slices',
			numeratorColor: '#84cc16', // lime green
			denominatorColor: '#d4a574' // graham cracker crust
		},
		{ 
			component: ChocolateBar, 
			name: 'Chocolate Bar',
			foodName: 'chocolate bar',
			toppingName: 'nuts',
			numeratorColor: '#d4a574', // golden nuts
			denominatorColor: '#451a03' // dark chocolate
		},
		{ 
			component: Donut, 
			name: 'Donut',
			foodName: 'donut',
			toppingName: 'sprinkles',
			numeratorColor: '#f59e0b', // colorful sprinkles (amber as base)
			denominatorColor: '#d4a574' // glazed donut
		}
	];
	
	return shuffleArray(foodTypes);
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
	const scaleFactor = useBrownieScaleFactor();
	const totalSegments = Math.max(1, Math.floor(denominator || 1));
	const filledSegments = Math.min(Math.max(0, Math.floor(numerator || 0)), totalSegments);

	// Rectangle geometry - use scaled dimensions
	const baseWidth = Math.round(size * 1.2);
	const baseHeight = Math.round(size * 0.8);
	const width = Math.round(baseWidth * scaleFactor);
	const height = Math.round(baseHeight * scaleFactor);
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

			const sprinkleWidth = 2 * scaleFactor;
			const sprinkleHeight = 8 * scaleFactor;
			const sprinkleBorderRadius = 2 * scaleFactor;

			sprinkleElements.push(
				<div
					key={`spr-${seg}-${i}`}
					className="absolute"
					style={{
						left: `${left}px`,
						top: `${top}px`,
						width: `${sprinkleWidth}px`,
						height: `${sprinkleHeight}px`,
						backgroundColor: color,
						borderRadius: `${sprinkleBorderRadius}px`,
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
					const lineWidth = 3 * scaleFactor;
					return (
						<div
							key={`brow-v-line-${i}`}
							className="absolute top-0 bottom-0 bg-white/60"
							style={{ 
								left: `${x}px`,
								width: `${lineWidth}px`
							}}
						/>
					);
				})}

			{/* Horizontal divider lines */}
			{showSliceLines && rows > 1 &&
				Array.from({ length: rows - 1 }, (_, i) => {
					const y = (i + 1) * (height / rows);
					const lineHeight = 3 * scaleFactor;
					return (
						<div
							key={`brow-h-line-${i}`}
							className="absolute left-0 right-0 bg-white/60"
							style={{ 
								top: `${y}px`,
								height: `${lineHeight}px`
							}}
						/>
					);
				})}
		</div>
	);
};

const Pancake = ({
	/** Overall rendered size in pixels */
	size = 160,
	/** Whether to draw faint slice divider lines */
	showSliceLines = true,
	/** Number of slices that have blueberries (the shaded fraction numerator) */
	numerator = 0,
	/** Total number of slices (the fraction denominator) */
	denominator = 8,
	/** Color used to represent the numerator (filled fraction) */
	numeratorColor = '#1e3a8a',
	/** Color used to represent the denominator (unfilled/background fraction) */
	denominatorColor = '#eca24d',
}) => {
	const isSmallScreen = useIsSmallScreen(351);
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
	const pancakeInset = effectiveSize * 0.05; // smaller inset than pizza
	const maxRadius = center - pancakeInset;
	const degToRad = (deg) => deg * (Math.PI / 180);

	// Blueberry positions: place per selected slice, centered between its two divider lines
	const blueberryCircles = [];
	for (let s = 0; s < filledSlices; s++) {
		// Angle measured clockwise from 12 o'clock
		const angleDegClockFromTop = (s + 0.5) * sliceWidthDeg;
		const angleRad = degToRad(angleDegClockFromTop);

		// Compute radius: aim for a middle distance, adjust outward only if wedge is too narrow
		const baseBlueberryDiameter = 16; // smaller than pepperoni
		const blueberryDiameter = baseBlueberryDiameter * scaleFactor;
		const blueberryRadius = blueberryDiameter / 2;
		const safetyMargin = 3; // px
		const halfSliceRad = degToRad(sliceWidthDeg) / 2;
		const maxCenterR = Math.max(0, maxRadius - blueberryRadius - 1);
		const minCenterR = blueberryRadius + 1;
		// Target radius should be proportional to the scaled pancake
		const targetCenterR = Math.min(maxCenterR, Math.max(minCenterR, maxRadius * 0.65));
		const requiredRForAngularFit =
			totalSlices === 1 ? minCenterR : (blueberryDiameter + safetyMargin) / (2 * Math.sin(halfSliceRad));
		const r = Math.min(Math.max(targetCenterR, requiredRForAngularFit, minCenterR), maxCenterR);

		// Convert top-origin clockwise polar to screen coords (y down)
		const x = center + r * Math.sin(angleRad);
		const y = center - r * Math.cos(angleRad);
		blueberryCircles.push({ left: x, top: y });
	}

	return (
		<div
			className={`pancake-container relative w-auto h-auto select-none`}
			style={{ width: effectiveSize, height: effectiveSize }}
			aria-label="Pancake"
			role="img"
		>
			{/* Pancake base with light edge */}
			<div 
				className="absolute inset-0 rounded-full shadow-lg" 
				style={{ 
					background: 'radial-gradient(circle, #eca24d 70%, #fff2a4 100%)' 
				}} 
			/>

			{/* Pancake surface highlight */}
			<div
				className="absolute rounded-full"
				style={{
					left: `${pancakeInset}px`,
					right: `${pancakeInset}px`,
					top: `${pancakeInset}px`,
					bottom: `${pancakeInset}px`,
					background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.05))',
				}}
			/>

			{/* Blueberry toppings for filled slices */}
			{blueberryCircles.map((pos, idx) => {
				const responsiveBlueberrySize = 16 * scaleFactor;
				return (
					<div
						key={`blueberry-${idx}`}
						className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm"
						style={{ 
							top: `${pos.top}px`, 
							left: `${pos.left}px`, 
							backgroundColor: numeratorColor,
							width: `${responsiveBlueberrySize}px`,
							height: `${responsiveBlueberrySize}px`,
							boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)'
						}}
					/>
				);
			})}

			{/* Slice divider lines */}
			{showSliceLines &&
				sliceAngles.map((deg, i) => (
					<div
						key={`line-${i}`}
						className="absolute left-1/2 top-1/2 origin-top bg-amber-800/40"
						style={{
							width: '2px',
							height: effectiveSize / 2,
							transform: `translate(-50%, 0) rotate(${deg}deg)`,
						}}
					/>
				))}
		</div>
	);
};

const Pie = ({
	/** Overall rendered size in pixels */
	size = 160,
	/** Whether to draw faint slice divider lines */
	showSliceLines = true,
	/** Number of slices that have lime slices (the shaded fraction numerator) */
	numerator = 0,
	/** Total number of slices (the fraction denominator) */
	denominator = 8,
	/** Color used to represent the numerator (filled fraction) */
	numeratorColor = '#84cc16',
	/** Color used to represent the denominator (unfilled/background fraction) */
	denominatorColor = '#d4a574',
}) => {
	const isSmallScreen = useIsSmallScreen(351);
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
	const crustInset = effectiveSize * 0.1; // deeper inset for pie crust rim
	const maxRadius = center - crustInset;
	const degToRad = (deg) => deg * (Math.PI / 180);

	// Lime slice positions: place per selected slice, centered between its two divider lines
	const limeSlices = [];
	for (let s = 0; s < filledSlices; s++) {
		// Angle measured clockwise from 12 o'clock
		const angleDegClockFromTop = (s + 0.5) * sliceWidthDeg;
		const angleRad = degToRad(angleDegClockFromTop);

		// Compute radius: aim for a middle distance, adjust outward only if wedge is too narrow
		const baseLimeWidth = 18; // oval width
		const baseLimeHeight = 12; // oval height
		const limeWidth = baseLimeWidth * scaleFactor;
		const limeHeight = baseLimeHeight * scaleFactor;
		const limeRadius = Math.max(limeWidth, limeHeight) / 2;
		const safetyMargin = 4; // px
		const halfSliceRad = degToRad(sliceWidthDeg) / 2;
		const maxCenterR = Math.max(0, maxRadius - limeRadius - 1);
		const minCenterR = limeRadius + 1;
		// Target radius should be proportional to the scaled pie
		const targetCenterR = Math.min(maxCenterR, Math.max(minCenterR, maxRadius * 0.6));
		const requiredRForAngularFit =
			totalSlices === 1 ? minCenterR : (limeWidth + safetyMargin) / (2 * Math.sin(halfSliceRad));
		const r = Math.min(Math.max(targetCenterR, requiredRForAngularFit, minCenterR), maxCenterR);

		// Convert top-origin clockwise polar to screen coords (y down)
		const x = center + r * Math.sin(angleRad);
		const y = center - r * Math.cos(angleRad);
		limeSlices.push({ left: x, top: y, width: limeWidth, height: limeHeight, angle: angleDegClockFromTop });
	}

	return (
		<div
			className={`pie-container relative w-auto h-auto select-none`}
			style={{ width: effectiveSize, height: effectiveSize }}
			aria-label="Pie"
			role="img"
		>
			{/* Graham cracker crust base */}
			<div className="absolute inset-0 rounded-full shadow-lg" style={{ backgroundColor: '#d4a574' }} />

			{/* Graham cracker crust rim (raised edge) */}
			<div
				className="absolute rounded-full border-2"
				style={{
					left: `${crustInset}px`,
					right: `${crustInset}px`,
					top: `${crustInset}px`,
					bottom: `${crustInset}px`,
					backgroundColor: '#e6b88a',
					borderColor: '#f4d2a7',
					boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
				}}
			/>

			{/* Key lime filling */}
			<div
				className="absolute rounded-full"
				style={{
					left: `${crustInset + 4}px`,
					right: `${crustInset + 4}px`,
					top: `${crustInset + 4}px`,
					bottom: `${crustInset + 4}px`,
					backgroundColor: '#d9f99d',
					background: 'radial-gradient(circle, #f7fee7 20%, #d9f99d 100%)',
				}}
			/>

			{/* Lime slice toppings for filled slices */}
			{limeSlices.map((slice, idx) => (
				<div
					key={`lime-${idx}`}
					className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm"
					style={{ 
						top: `${slice.top}px`, 
						left: `${slice.left}px`, 
						backgroundColor: numeratorColor,
						width: `${slice.width}px`,
						height: `${slice.height}px`,
						borderRadius: '50%',
						transform: `translate(-50%, -50%) rotate(${slice.angle}deg)`,
						boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.15)'
					}}
				/>
			))}

			{/* Slice divider lines */}
			{showSliceLines &&
				sliceAngles.map((deg, i) => (
					<div
						key={`line-${i}`}
						className="absolute left-1/2 top-1/2 origin-top bg-orange-700/40"
						style={{
							width: '2px',
							height: effectiveSize / 2,
							transform: `translate(-50%, 0) rotate(${deg}deg)`,
						}}
					/>
				))}
		</div>
	);
};

const ChocolateBar = ({
	/** Overall size driver in pixels (controls both width and height proportionally) */
	size = 180,
	/** Whether to draw faint segment divider lines */
	showSliceLines = true,
	/** Number of decorated segments (with nuts numerator) */
	numerator = 0,
	/** Total number of segments */
	denominator = 8,
	/** Primary nut color */
	numeratorColor = '#d4a574',
	/** Chocolate bar base color */
	denominatorColor = '#451a03',
	className = '',
}) => {
	const scaleFactor = useBrownieScaleFactor();
	const totalSegments = Math.max(1, Math.floor(denominator || 1));
	const filledSegments = Math.min(Math.max(0, Math.floor(numerator || 0)), totalSegments);

	// Rectangle geometry - chocolate bar proportions
	const baseWidth = Math.round(size * 1.1); // narrower chocolate bar
	const baseHeight = Math.round(size * 0.6); // thinner than brownie
	const width = Math.round(baseWidth * scaleFactor);
	const height = Math.round(baseHeight * scaleFactor);
	const insetPct = 0.06; // smaller inset for chocolate bar
	const insetX = Math.round(width * insetPct);
	const insetY = Math.round(height * insetPct);
	const innerWidth = width - insetX * 2;
	const innerHeight = height - insetY * 2;

	// Grid layout for segments (similar to brownie)
	const getGridDimensions = (total) => {
		if (total === 2) return { cols: 2, rows: 1 };
		if (total === 4) return { cols: 4, rows: 1 };
		if (total === 6) return { cols: 6, rows: 1 };
		if (total === 8) return { cols: 4, rows: 2 };
		if (total === 10) return { cols: 5, rows: 2 };
		if (total === 12) return { cols: 6, rows: 2 };
		return { cols: total, rows: 1 }; // fallback
	};

	const { cols, rows } = getGridDimensions(totalSegments);
	const segmentWidth = innerWidth / cols;
	const segmentHeight = innerHeight / rows;

	// Simple deterministic pseudo-random for stable nut layout
	const seededRandom = (seed) => {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	};

	// Generate nut positions for numerator segments
	const nutElements = [];
	const nutsPerSegment = 8; // fewer nuts than sprinkles for more realistic look
	for (let seg = 0; seg < filledSegments; seg++) {
		// Convert segment index to grid position
		const gridCol = seg % cols;
		const gridRow = Math.floor(seg / cols);

		for (let i = 0; i < nutsPerSegment; i++) {
			const seedBase = seg * 1000 + i * 47;
			const rx = seededRandom(seedBase + 1);
			const ry = seededRandom(seedBase + 2);
			const rAngle = (seededRandom(seedBase + 3) - 0.5) * 60; // -30..30 deg
			const nutType = i % 3; // 3 different nut colors/types

			// Different nut colors for variety
			let nutColor;
			if (nutType === 0) nutColor = numeratorColor; // golden
			else if (nutType === 1) nutColor = '#a3a3a3'; // silver (cashews)
			else nutColor = '#92400e'; // brown (walnuts)

			const left = insetX + gridCol * segmentWidth + rx * segmentWidth;
			const top = insetY + gridRow * segmentHeight + ry * segmentHeight;

			const nutWidth = (3 + seededRandom(seedBase + 4) * 2) * scaleFactor; // 3-5px
			const nutHeight = (4 + seededRandom(seedBase + 5) * 3) * scaleFactor; // 4-7px

			nutElements.push(
				<div
					key={`nut-${seg}-${i}`}
					className="absolute"
					style={{
						left: `${left}px`,
						top: `${top}px`,
						width: `${nutWidth}px`,
						height: `${nutHeight}px`,
						backgroundColor: nutColor,
						borderRadius: '40%',
						transform: `translate(-50%, -50%) rotate(${rAngle}deg)`,
						boxShadow: '0 0 0 1px rgba(0,0,0,0.2) inset',
					}}
				/>
			);
		}
	}

	return (
		<div
			className={`relative select-none`}
			style={{ width, height }}
			aria-label="Chocolate Bar"
			role="img"
		>
			{/* Chocolate bar base */}
			<div className="absolute inset-0 shadow-lg" style={{ backgroundColor: denominatorColor }} />

			{/* Chocolate surface (slight sheen) */}
			<div
				className="absolute"
				style={{
					left: `${insetX}px`,
					right: `${insetX}px`,
					top: `${insetY}px`,
					bottom: `${insetY}px`,
					background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
				}}
			/>

			{/* Nuts for numerator segments */}
			{nutElements}

			{/* Vertical divider lines */}
			{showSliceLines &&
				Array.from({ length: cols - 1 }, (_, i) => {
					const x = (i + 1) * (width / cols);
					const lineWidth = 2 * scaleFactor;
					return (
						<div
							key={`choc-v-line-${i}`}
							className="absolute top-0 bottom-0 bg-amber-900/60"
							style={{ 
								left: `${x}px`,
								width: `${lineWidth}px`
							}}
						/>
					);
				})}

			{/* Horizontal divider lines */}
			{showSliceLines && rows > 1 &&
				Array.from({ length: rows - 1 }, (_, i) => {
					const y = (i + 1) * (height / rows);
					const lineHeight = 2 * scaleFactor;
					return (
						<div
							key={`choc-h-line-${i}`}
							className="absolute left-0 right-0 bg-amber-900/60"
							style={{ 
								top: `${y}px`,
								height: `${lineHeight}px`
							}}
						/>
					);
				})}
		</div>
	);
};

const Donut = ({
	/** Overall rendered size in pixels */
	size = 160,
	/** Whether to draw faint slice divider lines */
	showSliceLines = true,
	/** Number of slices that have sprinkles (the shaded fraction numerator) */
	numerator = 0,
	/** Total number of slices (the fraction denominator) */
	denominator = 8,
	/** Color used to represent the numerator (filled fraction) */
	numeratorColor = '#f59e0b',
	/** Color used to represent the denominator (unfilled/background fraction) */
	denominatorColor = '#d4a574',
}) => {
	const isSmallScreen = useIsSmallScreen(351);
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
	const donutInset = effectiveSize * 0.08; // outer edge inset
	const holeRadius = effectiveSize * 0.25; // donut hole radius
	const maxRadius = center - donutInset;
	const minRadius = holeRadius + 10; // ensure sprinkles don't overlap hole
	const degToRad = (deg) => deg * (Math.PI / 180);

	// Simple deterministic pseudo-random for stable sprinkle layout
	const seededRandom = (seed) => {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	};

	// Sprinkle positions: scattered randomly in filled slices
	const sprinkleElements = [];
	const sprinklesPerSlice = 12;
	for (let s = 0; s < filledSlices; s++) {
		// Angle boundaries for this slice
		const sliceStartAngle = s * sliceWidthDeg;
		const sliceEndAngle = (s + 1) * sliceWidthDeg;
		
		for (let i = 0; i < sprinklesPerSlice; i++) {
			const seedBase = s * 1000 + i * 43;
			const angleRandom = seededRandom(seedBase + 1);
			const radiusRandom = seededRandom(seedBase + 2);
			const colorRandom = seededRandom(seedBase + 3);
			const sizeRandom = seededRandom(seedBase + 4);
			const rotationRandom = seededRandom(seedBase + 5);

			// Random angle within the slice
			const angleDeg = sliceStartAngle + angleRandom * sliceWidthDeg + 180; // +180 for CSS offset
			const angleRad = degToRad(angleDeg);

			// Random radius between hole and outer edge
			const r = minRadius + radiusRandom * (maxRadius - minRadius);

			// Convert to screen coordinates
			const x = center + r * Math.sin(angleRad - degToRad(180));
			const y = center - r * Math.cos(angleRad - degToRad(180));

			// Random sprinkle color
			const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
			const sprinkleColor = colors[Math.floor(colorRandom * colors.length)];

			// Random sprinkle size and rotation
			const sprinkleWidth = (2 + sizeRandom * 1.5) * scaleFactor; // 2-3.5px
			const sprinkleHeight = (6 + sizeRandom * 3) * scaleFactor; // 6-9px
			const rotation = rotationRandom * 180; // 0-180 degrees

			sprinkleElements.push(
				<div
					key={`sprinkle-${s}-${i}`}
					className="absolute"
					style={{
						left: `${x}px`,
						top: `${y}px`,
						width: `${sprinkleWidth}px`,
						height: `${sprinkleHeight}px`,
						backgroundColor: sprinkleColor,
						borderRadius: '2px',
						transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
						boxShadow: '0 0 0 0.5px rgba(0,0,0,0.1) inset',
					}}
				/>
			);
		}
	}

	return (
		<div
			className={`donut-container relative w-auto h-auto select-none`}
			style={{ width: effectiveSize, height: effectiveSize }}
			aria-label="Donut"
			role="img"
		>
			{/* Donut base */}
			<div className="absolute inset-0 rounded-full" style={{ backgroundColor: denominatorColor }} />

			{/* Sprinkle toppings for filled slices */}
			{sprinkleElements}

			{/* Donut hole - placed after sprinkles so it covers center area */}
			<div
				className="absolute rounded-full"
				style={{
					left: `${center - holeRadius}px`,
					top: `${center - holeRadius}px`,
					width: `${holeRadius * 2}px`,
					height: `${holeRadius * 2}px`,
					backgroundColor: 'white',
				}}
			/>

			{/* Slice divider lines - only on the donut, not in the hole */}
			{showSliceLines &&
				sliceAngles.map((deg, i) => {
					const angleRad = (deg - 180) * (Math.PI / 180); // Convert to radians and adjust for CSS offset
					const startX = center + holeRadius * Math.sin(angleRad);
					const startY = center - holeRadius * Math.cos(angleRad);
					const endX = center + center * Math.sin(angleRad); // Go to full edge
					const endY = center - center * Math.cos(angleRad);
					const lineLength = center - holeRadius; // Full length from hole to edge
					
					return (
						<div
							key={`line-${i}`}
							className="absolute bg-amber-800/60"
							style={{
								left: `${startX}px`,
								top: `${startY}px`,
								width: '3px',
								height: `${lineLength}px`,
								transformOrigin: 'center top',
								transform: `translate(-50%, 0) rotate(${deg}deg)`,
							}}
						/>
					);
				})}
		</div>
	);
};

