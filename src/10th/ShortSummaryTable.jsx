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

export const ShortSummaryTable = ({ force, primaryColor, name, points }) => {
	const [hide, setHide] = useState(false);
	const { units, factionRules, rules, catalog } = force;

	const sortedUnits = units.sort((a, b) => {
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

	return (
		<>
			<div className="flex justify-end gap-3">
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
					<span>{name}</span>
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
									Cost (pts)
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
											{unit.modelStats?.reduce((sum, stat, index) => {
												const modelName = unit.models?.reduce(
													(bestMatch, model) => {
														const similarity = (str1, str2) => {
															let matches = 0;
															for (
																let i = 0;
																i < Math.min(str1.length, str2.length);
																i++
															) {
																if (str1[i] === str2[i]) matches++; // Match only if characters are at the same position
															}
															return matches;
														};
														const currentSimilarity = similarity(
															stat.name,
															model.name,
														);

														return currentSimilarity >
															similarity(stat.name, bestMatch.name)
															? model
															: bestMatch;
													},
													unit.models[0],
												);

												const modelCount =
													unit.modelStats?.length === 1
														? // sum of all counts of the models
															models?.reduce(
																(sum, model) => sum + model.count,
																0,
															) || 1
														: modelName?.count || 1;
												return sum + (stat.wounds || 0) * modelCount;
											}, 0)}
										</div>
										<div className="table-cell border border-dotted border-[#9e9fa1] px-4 py-1 text-right">
											{unit.modelStats?.reduce((sum, stat, index) => {
												const modelName = unit.models?.reduce(
													(bestMatch, model) => {
														const similarity = (str1, str2) => {
															let matches = 0;
															for (
																let i = 0;
																i < Math.min(str1.length, str2.length);
																i++
															) {
																if (str1[i] === str2[i]) matches++; // Match only if characters are at the same position
															}
															return matches;
														};
														const currentSimilarity = similarity(
															stat.name,
															model.name,
														);

														return currentSimilarity >
															similarity(stat.name, bestMatch.name)
															? model
															: bestMatch;
													},
													unit.models[0],
												);

												const modelCount =
													unit.modelStats?.length === 1
														? // sum of all counts of the models
															models?.reduce(
																(sum, model) => sum + model.count,
																0,
															) || 1
														: modelName?.count || 1;
												return sum + (stat.oc || 0) * modelCount;
											}, 0)}
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
									{sortedUnits.reduce((sum, unit) => {
										return (
											sum +
											unit.modelStats?.reduce((woundSum, stat, index) => {
												const modelName = unit.models?.reduce(
													(bestMatch, model) => {
														const similarity = (str1, str2) => {
															let matches = 0;
															for (
																let i = 0;
																i < Math.min(str1.length, str2.length);
																i++
															) {
																if (str1[i] === str2[i]) matches++; // Match only if characters are at the same position
															}
															return matches;
														};
														const currentSimilarity = similarity(
															stat.name,
															model.name,
														);

														return currentSimilarity >
															similarity(stat.name, bestMatch.name)
															? model
															: bestMatch;
													},
													unit.models[0],
												);

												const modelCount =
													unit.modelStats?.length === 1
														? // sum of all counts of the models
															unit?.models?.reduce(
																(sum, model) => sum + model.count,
																0,
															) || 1
														: modelName?.count || 1;
												return woundSum + (stat.wounds || 0) * modelCount;
											}, 0)
										);
									}, 0)}
								</div>
								<div className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right">
									{/* Sum of all OC values */}
									{sortedUnits.reduce((sum, unit) => {
										return (
											sum +
											unit.modelStats?.reduce((ocSum, stat, index) => {
												const modelName = unit.models?.reduce(
													(bestMatch, model) => {
														const similarity = (str1, str2) => {
															let matches = 0;
															for (
																let i = 0;
																i < Math.min(str1.length, str2.length);
																i++
															) {
																if (str1[i] === str2[i]) matches++; // Match only if characters are at the same position
															}
															return matches;
														};
														const currentSimilarity = similarity(
															stat.name,
															model.name,
														);

														return currentSimilarity >
															similarity(stat.name, bestMatch.name)
															? model
															: bestMatch;
													},
													unit.models[0],
												);

												const modelCount =
													unit.modelStats?.length === 1
														? // sum of all counts of the models
															unit?.models?.reduce(
																(sum, model) => sum + model.count,
																0,
															) || 1
														: modelName?.count || 1;
												return ocSum + (stat.oc || 0) * modelCount;
											}, 0)
										);
									}, 0)}
								</div>
								<div className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right">
									{sortedUnits.reduce((sum, unit) => sum + unit.cost.points, 0)}{" "}
									pts
								</div>
							</div>
						</div>
					</div>

					<div className="flex w-full flex-col gap-2.5 border-[var(--primary-color)] p-4 pb-2 pt-3.5 md:w-[50%] md:flex-1 md:border-l-2 print:w-[100%]">
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
