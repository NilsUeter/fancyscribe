import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Tooltip,
	Legend,
	Title,
} from "chart.js";
import cardBackground from "../assets/cardBackground.png";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Tooltip,
	Legend,
	Title,
);

const normalizeName = (value = "") =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

const getNameMatchScore = (statName = "", modelName = "") => {
	const normalizedStat = normalizeName(statName);
	const normalizedModel = normalizeName(modelName);

	if (!normalizedStat || !normalizedModel) {
		return 0;
	}

	let score = 0;
	if (normalizedStat === normalizedModel) {
		score += 1000;
	}
	if (
		normalizedStat.includes(normalizedModel) ||
		normalizedModel.includes(normalizedStat)
	) {
		score += 300;
	}

	const statTokens = new Set(normalizedStat.split(" "));
	const modelTokens = new Set(normalizedModel.split(" "));
	for (const token of statTokens) {
		if (token && modelTokens.has(token)) {
			score += 30;
		}
	}

	const statHasSergeant = statTokens.has("sergeant");
	const modelHasSergeant = modelTokens.has("sergeant");
	if (statHasSergeant && modelHasSergeant) {
		score += 120;
	}
	if (statHasSergeant !== modelHasSergeant) {
		score -= 80;
	}
	if (statTokens.has("squad") && modelHasSergeant) {
		score -= 100;
	}

	let prefixMatches = 0;
	const maxPrefixLength = Math.min(
		normalizedStat.length,
		normalizedModel.length,
	);
	for (let i = 0; i < maxPrefixLength; i++) {
		if (normalizedStat[i] !== normalizedModel[i]) {
			break;
		}
		prefixMatches++;
	}

	return score + prefixMatches;
};

const getModelCountForStat = (unit, stat) => {
	const models = unit?.models || [];
	const modelStats = unit?.modelStats || [];

	if (!models.length) {
		return 1;
	}

	if (modelStats.length <= 1) {
		return models.reduce((sum, model) => sum + (model.count || 0), 0) || 1;
	}

	let bestModel = models[0];
	let bestScore = getNameMatchScore(stat?.name, bestModel?.name);
	for (const model of models.slice(1)) {
		const score = getNameMatchScore(stat?.name, model?.name);
		if (
			score > bestScore ||
			(score === bestScore && (model.count || 0) > (bestModel.count || 0))
		) {
			bestModel = model;
			bestScore = score;
		}
	}

	return bestModel?.count || 1;
};

const getUnitTotalWounds = (unit) =>
	unit?.modelStats?.reduce(
		(sum, stat) => sum + (stat.wounds || 0) * getModelCountForStat(unit, stat),
		0,
	) || 0;

const getUnitTotalOc = (unit) =>
	unit?.modelStats?.reduce(
		(sum, stat) => sum + (stat.oc || 0) * getModelCountForStat(unit, stat),
		0,
	) || 0;

const getUnitTotalModels = (unit) =>
	unit?.models?.reduce((sum, model) => sum + (model.count || 0), 0) || 1;

const getUnitPointsPerModel = (unit) => {
	const totalModels = getUnitTotalModels(unit);
	return totalModels > 0 ? (unit?.cost?.points || 0) / totalModels : 0;
};

const getDefensiveProfile = (unit, stat = {}, modelCount = 1) => {
	const toughness = stat.toughness || 0;
	const wounds = stat.wounds || 0;
	const save = stat.save || 0;
	const pointsPerModel = getUnitPointsPerModel(unit);
	const cheapBodies = pointsPerModel > 0 && pointsPerModel <= 10;
	const cheapMultiWoundBodies = pointsPerModel > 0 && pointsPerModel <= 15;
	const eliteCost = pointsPerModel >= 20;
	const numerousBodies = modelCount >= 15 || (modelCount >= 10 && cheapBodies);
	const hordeBodies =
		(wounds <= 2 && cheapBodies && numerousBodies) ||
		(toughness <= 4 && wounds <= 1);
	const swarmBodies = toughness <= 4 && wounds >= 3 && cheapMultiWoundBodies;

	if (toughness >= 10) {
		return "Heavy vehicles / monsters";
	}
	if (toughness >= 7) {
		return "Light vehicles / monsters";
	}
	if (hordeBodies || swarmBodies) {
		return "Horde / Swarm";
	}
	if (toughness >= 6 || (eliteCost && wounds >= 3) || (save > 0 && save <= 3)) {
		return "Elite bodies";
	}
	return "Mixed infantry";
};

const getSkewMeterData = (units) => {
	const profileWeights = new Map();
	let totalWeight = 0;
	let totalModels = 0;

	for (const unit of units) {
		const modelStats = unit.modelStats?.length ? unit.modelStats : [{}];
		totalModels += getUnitTotalModels(unit);
		const weightedProfiles = modelStats.map((stat) => {
			const modelCount = getModelCountForStat(unit, stat);
			const woundShare = Math.max((stat.wounds || 1) * modelCount, modelCount);
			return {
				profile: getDefensiveProfile(unit, stat, modelCount),
				woundShare,
			};
		});
		const unitWoundShare = weightedProfiles.reduce(
			(sum, profile) => sum + profile.woundShare,
			0,
		);

		for (const { profile, woundShare } of weightedProfiles) {
			const weight =
				unitWoundShare > 0
					? (unit.cost.points * woundShare) / unitWoundShare
					: 0;

			profileWeights.set(profile, (profileWeights.get(profile) || 0) + weight);
			totalWeight += weight;
		}
	}

	const profiles = Array.from(profileWeights, ([name, weight]) => ({
		name,
		weight,
		share: totalWeight > 0 ? weight / totalWeight : 0,
	})).sort((a, b) => b.weight - a.weight);
	const dominantProfile = profiles[0] || { name: "No profile", share: 0 };
	const score = Math.round(
		Math.min(100, Math.max(0, ((dominantProfile.share - 0.35) / 0.55) * 100)),
	);

	let label = "Balanced";
	if (score >= 80) {
		label = "Oops, all stat-check";
	} else if (score >= 50) {
		label = "Oh Lawd He Skewin";
	} else if (score >= 35) {
		label = "Moderate skew";
	} else if (score >= 20) {
		label = "Light skew";
	}

	return {
		score,
		label,
		dominantProfile,
		profiles,
		totalModels,
	};
};

export const ShortSummaryTable = ({
	force,
	primaryColor,
	name,
	subtitle,
	points,
}) => {
	const [hide, setHide] = useState(false);
	const [hideSkewMeter, setHideSkewMeter] = useState(false);
	const { units, factionRules, rules, catalog } = force;

	const sortedUnits = units.slice().sort((a, b) => {
		// sort by points cost desc first, then by name
		if (a.cost.points < b.cost.points) return 1;
		if (a.cost.points > b.cost.points) return -1;
		return a.name.localeCompare(b.name);
	});

	// Prepare data for the bar chart, group by toughness and sum points cost
	const groupedByToughness = units.reduce((acc, unit) => {
		const toughness = unit.modelStats?.[0]?.toughness || 0;
		if (!acc[toughness]) {
			acc[toughness] = { totalPoints: 0, unitNames: [] };
		}
		acc[toughness].totalPoints += unit.cost.points;
		if (!acc[toughness].unitNames.includes(unit.name)) {
			acc[toughness].unitNames.push(unit.name);
		}
		return acc;
	}, {});

	const groupedChartDataToughness = Object.entries(groupedByToughness)
		.map(([toughness, { totalPoints, unitNames }]) => ({
			toughness: Number.parseInt(toughness, 10),
			totalPoints,
			unitNames,
		}))
		.sort((a, b) => a.toughness - b.toughness);

	// Prepare data for the bar chart, group by movement and sum points cost
	const groupedByMovement = units.reduce((acc, unit) => {
		const movement = unit.modelStats?.[0]?.move || 0;
		if (!acc[movement]) {
			acc[movement] = { totalPoints: 0, unitNames: [] };
		}
		acc[movement].totalPoints += unit.cost.points;
		if (!acc[movement].unitNames.includes(unit.name)) {
			acc[movement].unitNames.push(unit.name);
		}
		return acc;
	}, {});

	const groupedChartDataMovement = Object.entries(groupedByMovement)
		.map(([movement, { totalPoints, unitNames }]) => ({
			movement: Number.parseInt(movement, 10),
			totalPoints,
			unitNames,
		}))
		.sort((a, b) => a.movement - b.movement);

	// Prepare data for the bar chart, group by save and sum points cost
	const groupedBySave = units.reduce((acc, unit) => {
		const save = unit.modelStats?.[0]?.save || 0;
		if (!acc[save]) {
			acc[save] = { totalPoints: 0, unitNames: [] };
		}
		acc[save].totalPoints += unit.cost.points;
		if (!acc[save].unitNames.includes(unit.name)) {
			acc[save].unitNames.push(unit.name);
		}
		return acc;
	}, {});

	const groupedChartDataSave = Object.entries(groupedBySave)
		.map(([save, { totalPoints, unitNames }]) => ({
			save: Number.parseInt(save, 10),
			totalPoints,
			unitNames,
		}))
		.sort((a, b) => a.save - b.save);

	const totalArmyWounds = sortedUnits.reduce(
		(sum, unit) => sum + getUnitTotalWounds(unit),
		0,
	);
	const totalArmyPoints = sortedUnits.reduce(
		(sum, unit) => sum + unit.cost.points,
		0,
	);
	const canShowSkewMeter = sortedUnits.length > 1 && totalArmyPoints >= 500;
	const showSkewMeter = canShowSkewMeter && !hideSkewMeter;
	const skewMeterData = showSkewMeter ? getSkewMeterData(sortedUnits) : null;

	return (
		<>
			<div className="flex justify-end gap-3">
				{canShowSkewMeter && (
					<label
						className="print-display-none"
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "flex-end",
							gap: 4,
							userSelect: "none",
						}}
					>
						<input
							type="checkbox"
							checked={hideSkewMeter}
							onChange={() => setHideSkewMeter(!hideSkewMeter)}
						/>
						<span className="print-display-none">Hide Skew-O-Meter</span>
					</label>
				)}
				<label
					className="print-display-none"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-end",
						gap: 4,
						userSelect: "none",
					}}
				>
					<input
						type="checkbox"
						checked={hide}
						onChange={() => setHide(!hide)}
					/>
					<span className="print-display-none">Don't print this card.</span>
				</label>
			</div>
			<div className={`flex flex-col ${hide ? "print-display-none" : ""}`}>
				<div
					className="flex justify-between"
					style={{
						backgroundColor: "var(--primary-color)",
						color: "#fff",
						padding: "4px 16px",
						fontSize: " 1.7em",
						fontWeight: "800",
						textTransform: "uppercase",
					}}
				>
					{subtitle ? (
						<span className="flex flex-col leading-none">
							<span>{name}</span>
							<span
								style={{
									fontSize: ".55em",
									fontWeight: 700,
									lineHeight: 1.15,
									marginTop: 2,
								}}
							>
								{subtitle}
							</span>
						</span>
					) : (
						<span>{name}</span>
					)}
					<span>{points} pts</span>
				</div>
				<div
					className="mb-4 flex flex-wrap items-start border-2 border-[var(--primary-color)] print:flex-nowrap"
					style={{
						background: `url(${cardBackground})`,
						backgroundSize: "cover",
					}}
				>
					<div className="mt-4 table w-full border-collapse overflow-hidden md:w-[50%] md:flex-1">
						<div className="table-header-group bg-[var(--primary-color)] font-bold uppercase text-white">
							<div className="table-row">
								<div
									className="table-cell border border-[var(--primary-color)] px-4 py-1"
									style={{
										fontSize: "1.1em",
										color: "#fff",
										fontWeight: 600,
									}}
								>
									Unit Name
								</div>
								<div
									className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right"
									style={{
										fontSize: "1.1em",
										color: "#fff",
										fontWeight: 600,
									}}
								>
									W
								</div>
								<div
									className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right"
									style={{
										fontSize: "1.1em",
										color: "#fff",
										fontWeight: 600,
									}}
								>
									OC
								</div>
								<div
									className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right"
									style={{
										fontSize: "1.1em",
										color: "#fff",
										fontWeight: 600,
									}}
								>
									Pts/W
								</div>
								<div
									className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right"
									style={{
										fontSize: "1.1em",
										color: "#fff",
										fontWeight: 600,
									}}
								>
									Pts
								</div>
							</div>
						</div>
						<div className="table-row-group" style={{ lineHeight: 1.05 }}>
							{sortedUnits.map((unit, index) => {
								const {
									name,
									cost,
									models,
									modelStats,
									abilities,
									rangedWeapons,
									meleeWeapons,
								} = unit;
								let count =
									models?.filter((model) => model.count > 0)?.length === 1
										? models?.[0]?.count || 1
										: 1;
								if (modelStats?.length === 1) {
									// sum of all counts of the models
									count =
										models?.reduce((sum, model) => sum + model.count, 0) || 1;
								}
								const totalWounds = getUnitTotalWounds(unit);
								return (
									<div
										key={name + index}
										className={`table-row ${index % 2 === 0 ? "" : "bg-[#c4c4c480]"}`}
									>
										<div className="table-cell border border-dotted border-[#9e9fa1] px-4 py-1">
											<div className="flex flex-wrap items-center gap-2 gap-y-1">
												{count > 1 ? `${count}x ` : ""}
												{name}
												{abilities?.Abilities?.keys()?.some?.(
													(key) => key === "Leader",
												) && (
													<span
														style={{
															fontSize: ".8em",
															fontWeight: 700,
															color: "var(--primary-color)",
															textTransform: "uppercase",
															lineHeight: 1.05,
														}}
													>
														[Leader]
													</span>
												)}
											</div>
										</div>
										<div className="table-cell border border-dotted border-[#9e9fa1] px-4 py-1 text-right">
											{totalWounds}
										</div>
										<div className="table-cell border border-dotted border-[#9e9fa1] px-4 py-1 text-right">
											{getUnitTotalOc(unit)}
										</div>
										<div className="table-cell border border-dotted border-[#9e9fa1] px-4 py-1 text-right">
											{totalWounds > 0
												? (cost.points / totalWounds).toFixed(1)
												: "—"}
										</div>
										<div className="table-cell border border-dotted border-[#9e9fa1] px-4 py-1 text-right">
											{cost.points} pts
										</div>
									</div>
								);
							})}
							<div className="table-row bg-[var(--primary-color)] font-bold text-white">
								<div className="table-cell border border-[var(--primary-color)] px-4 py-1">
									{sortedUnits.length} Units
								</div>
								<div className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right">
									{/* Sum of all wound values */}
									{sortedUnits.reduce(
										(sum, unit) => sum + getUnitTotalWounds(unit),
										0,
									)}
								</div>
								<div className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right">
									{/* Sum of all OC values */}
									{sortedUnits.reduce(
										(sum, unit) => sum + getUnitTotalOc(unit),
										0,
									)}
								</div>
								<div className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right">
									{" "}
									{totalArmyWounds > 0
										? (
												sortedUnits.reduce(
													(sum, unit) => sum + unit.cost.points,
													0,
												) / totalArmyWounds
											).toFixed(1)
										: "—"}
								</div>
								<div className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right">
									{" "}
									{sortedUnits.reduce(
										(sum, unit) => sum + unit.cost.points,
										0,
									)}{" "}
									pts
								</div>
							</div>
						</div>
					</div>

					<div className="flex w-full flex-col gap-2.5 self-stretch border-[var(--primary-color)] p-4 pb-2 pt-3.5 md:w-[50%] md:flex-1 md:border-l-2 print:w-[100%]">
						{showSkewMeter && (
							<SkewMeter data={skewMeterData} primaryColor={primaryColor} />
						)}

						<ChartComponent
							data={{
								labels: groupedChartDataMovement.map(
									(data) => `${data.movement}"`,
								),
								datasets: [
									{
										label: "Total Cost (pts)",
										data: groupedChartDataMovement.map(
											(data) => data.totalPoints,
										),
										backgroundColor: primaryColor,
										unitNames: groupedChartDataMovement.map(
											(data) => data.unitNames,
										),
									},
								],
							}}
							title="MOVEMENT OF YOUR UNITS"
						/>

						<ChartComponent
							data={{
								labels: groupedChartDataToughness.map(
									(data) => `${data.toughness}`,
								),
								datasets: [
									{
										label: "Total Cost (pts)",
										data: groupedChartDataToughness.map(
											(data) => data.totalPoints,
										),
										backgroundColor: primaryColor,
										unitNames: groupedChartDataToughness.map(
											(data) => data.unitNames,
										),
									},
								],
							}}
							title="TOUGHNESS OF YOUR UNITS"
						/>

						<ChartComponent
							data={{
								labels: groupedChartDataSave.map((data) => `${data.save}+`),
								datasets: [
									{
										label: "Total Cost (pts)",
										data: groupedChartDataSave.map((data) => data.totalPoints),
										backgroundColor: primaryColor,
										unitNames: groupedChartDataSave.map(
											(data) => data.unitNames,
										),
									},
								],
							}}
							title="SAVE CHARACTERISTIC OF YOUR UNITS"
						/>
					</div>
				</div>
			</div>
		</>
	);
};

const SkewMeter = ({ data, primaryColor }) => {
	const topProfiles = data.profiles;

	return (
		<div className="w-full border-2 border-[var(--primary-color)] bg-white/80 p-3 text-black">
			<div className="flex items-end justify-between gap-3">
				<div>
					<div className="text-[0.8em] font-bold uppercase leading-none text-[var(--primary-color)]">
						Skew-O-Meter
					</div>
					<div className="text-[1.35em] font-extrabold uppercase leading-tight">
						{data.label}
					</div>
				</div>
				<div className="text-right text-[1.6em] font-extrabold leading-none">
					{data.score}
					<span className="text-[0.48em] font-bold">/100</span>
				</div>
			</div>

			<div className="mt-2 h-3 overflow-hidden border border-[var(--primary-color)] bg-white">
				<div
					className="h-full"
					style={{
						width: `${data.score}%`,
						backgroundColor: primaryColor,
					}}
				/>
			</div>

			<div className="mt-2 grid gap-1 text-[0.76em] font-semibold leading-tight">
				{topProfiles.map((profile, index) => (
					<div
						key={profile.name}
						className={`grid grid-cols-[1fr_3rem] items-center gap-2 ${index === 0 ? "font-extrabold uppercase" : ""}`}
					>
						<div className="flex items-center gap-1.5">
							<span
								className="inline-block h-2 w-2 shrink-0"
								style={{ backgroundColor: primaryColor }}
							/>
							<span>{profile.name}</span>
						</div>
						<span className="text-right">
							{Math.round(profile.share * 100)}%
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

const ChartComponent = ({ data, title }) => {
	return (
		<div className="relative w-full" style={{ height: "150px" }}>
			<Bar
				data={data}
				options={{
					responsive: true,
					maintainAspectRatio: false,
					scales: {
						y: {
							beginAtZero: true,
							ticks: {
								color: "#000", // Set y-axis tick color
							},
						},
						x: {
							ticks: {
								color: "#000", // Set x-axis tick color
							},
						},
					},
					plugins: {
						title: {
							display: true,
							text: title,
							font: {
								size: 14,
								weight: "bold",
								family: "Noto Sans",
							},
							color: "#000",
							align: "start",
						},
						legend: {
							display: false,
						},
						tooltip: {
							displayColors: false,
							callbacks: {
								title: (context) => "",
								label: (context) => {
									// return unit names for the bar
									return context.dataset.unitNames[context.dataIndex];
								},
							},
						},
					},
				}}
			/>
		</div>
	);
};
