import React from "react";
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

export const ShortSummaryTable = ({ force, primaryColor }) => {
	const { units, factionRules, rules, catalog } = force;

	const sortedUnits = units.sort((a, b) => {
		// sort by points cost desc first, then by name
		if (a.cost.points < b.cost.points) return 1;
		if (a.cost.points > b.cost.points) return -1;
		return a.name.localeCompare(b.name);
	});

	// Calculate total wound count
	const totalWoundCount = units.reduce((sum, unit) => {
		const modelCounts = unit.models?.map((model) => model.count) || [1];
		const totalWounds = unit.modelStats?.reduce((woundSum, stat, index) => {
			const count = modelCounts[index] || 1;
			return woundSum + (stat.wounds || 0) * count;
		}, 0);
		return sum + totalWounds;
	}, 0);

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
			toughness: parseInt(toughness, 10),
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
			movement: parseInt(movement, 10),
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
			save: parseInt(save, 10),
			totalPoints,
			unitNames,
		}))
		.sort((a, b) => a.save - b.save);

	return (
		<div
			className="print-display-none my-4 -mt-4 flex flex-wrap items-start border-2 border-[var(--primary-color)]"
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
							Cost (pts)
						</div>
						<div
							className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right"
							style={{
								fontSize: "1.1em",
								color: "#fff",
								fontWeight: 600,
							}}
						>
							Wounds
						</div>
					</div>
				</div>
				<div className="table-row-group" style={{ lineHeight: 1.05 }}>
					{sortedUnits.map((unit, index) => {
						let { name, cost, models } = unit;
						const count = models?.[0]?.count || 1;
						return (
							<div
								key={name + index}
								className={`table-row ${index % 2 === 0 ? "" : "bg-[#c4c4c480]"}`}
							>
								<div className="table-cell border border-dotted border-[#9e9fa1] px-4 py-1">
									{count > 1 ? count + "x " : ""}
									{name}
								</div>
								<div className="table-cell border border-dotted border-[#9e9fa1] px-4 py-1 text-right">
									{cost.points} pts
								</div>
								<div className="table-cell border border-dotted border-[#9e9fa1] px-4 py-1 text-right">
									{unit.modelStats?.reduce((sum, stat, index) => {
										const count = unit.models?.[index]?.count || 1;
										return sum + (stat.wounds || 0) * count;
									}, 0)}
								</div>
							</div>
						);
					})}
					<div className="table-row bg-[var(--primary-color)] font-bold text-white">
						<div className="table-cell border border-[var(--primary-color)] px-4 py-1">
							Total
						</div>
						<div className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right">
							{sortedUnits.reduce((sum, unit) => sum + unit.cost.points, 0)} pts
						</div>
						<div className="table-cell border border-[var(--primary-color)] px-4 py-1 text-right">
							{totalWoundCount}
						</div>
					</div>
				</div>
			</div>

			<div className="flex w-full flex-col gap-2.5 border-[var(--primary-color)] p-4 md:w-[50%] md:flex-1 md:border-l-2">
				<ChartComponent
					data={{
						labels: groupedChartDataMovement.map((data) => data.movement + '"'),
						datasets: [
							{
								label: "Total Cost (pts)",
								data: groupedChartDataMovement.map((data) => data.totalPoints),
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
							(data) => data.toughness + "",
						),
						datasets: [
							{
								label: "Total Cost (pts)",
								data: groupedChartDataToughness.map((data) => data.totalPoints),
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
						labels: groupedChartDataSave.map((data) => data.save + "+"),
						datasets: [
							{
								label: "Total Cost (pts)",
								data: groupedChartDataSave.map((data) => data.totalPoints),
								backgroundColor: primaryColor,
								unitNames: groupedChartDataSave.map((data) => data.unitNames),
							},
						],
					}}
					title="SAVE CHARACTERISTIC OF YOUR UNITS"
				/>
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
								title: function (context) {
									return "";
								},
								label: function (context) {
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
