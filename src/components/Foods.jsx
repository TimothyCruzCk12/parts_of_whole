import React from 'react';

export const Pizza = ({
	/** Overall rendered size in pixels */
	size = 180,
	/** Whether to draw faint slice divider lines */
	showSliceLines = true,
	/** Number of slices that have pepperoni (the shaded fraction numerator) */
	numerator = 0,
	/** Total number of slices (the fraction denominator) */
	denominator = 8,
	className = '',
}) => {
	const totalSlices = Math.max(1, Math.floor(denominator || 1));
	const filledSlices = Math.min(Math.max(0, Math.floor(numerator || 0)), totalSlices);
	// Standardize first slice divider at 12 o'clock (requires 180deg rotation due to default downwards orientation)
	const sliceWidthDeg = 360 / totalSlices;
	const baseCssOffsetDeg = 180;
	const sliceAngles = Array.from({ length: totalSlices }, (_, i) => baseCssOffsetDeg + i * sliceWidthDeg);

	// Geometry helpers
	const center = size / 2;
	const cheeseInset = size * 0.08; // matches inset-[8%]
	const maxRadius = center - cheeseInset;
	const degToRad = (deg) => deg * (Math.PI / 180);

	// Pepperoni positions: place per selected slice, centered between its two divider lines
	const pepperoniCircles = [];
	for (let s = 0; s < filledSlices; s++) {
		// Angle measured clockwise from 12 o'clock
		const angleDegClockFromTop = (s + 0.5) * sliceWidthDeg;
		const angleRad = degToRad(angleDegClockFromTop);

		// Compute radius: aim for a middle distance, adjust outward only if wedge is too narrow
		const pepperoniDiameter = 24; // tailwind w-6 h-6 ~ 24px assuming 1rem=16px
		const pepperoniRadius = pepperoniDiameter / 2;
		const safetyMargin = 4; // px
		const halfSliceRad = degToRad(sliceWidthDeg) / 2;
		const maxCenterR = Math.max(0, maxRadius - pepperoniRadius - 1);
		const minCenterR = pepperoniRadius + 1;
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
			className={`relative select-none ${className}`}
			style={{ width: size, height: size }}
			aria-label="Pizza"
			role="img"
		>
			{/* Crust */}
			<div className="absolute inset-0 rounded-full bg-amber-700 shadow-md" />

			{/* Cheese layer */}
			<div className="absolute inset-[8%] rounded-full bg-amber-300 shadow-inner" />

			{/* Pepperoni toppings for filled slices */}
			{pepperoniCircles.map((pos, idx) => (
				<div
					key={`pep-${idx}`}
					className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 ring-2 ring-red-700 shadow-[inset_0_2px_0_rgba(0,0,0,0.2)]"
					style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
				/>
			))}

			{/* Slice divider lines */}
			{showSliceLines &&
				sliceAngles.map((deg, i) => (
					<div
						key={`line-${i}`}
						className="absolute left-1/2 top-1/2 origin-top bg-white/40"
						style={{
							width: '2px',
							height: size / 2 - size * 0.08,
							transform: `translate(-50%, 0) rotate(${deg}deg)`,
						}}
					/>
				))}
		</div>
	);
};


