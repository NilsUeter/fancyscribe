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

	return (
		<div
			className="print-display-none my-4 -mt-4 flex flex-wrap border-2 border-[var(--primary-color)]"
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
							</div>
						);
					})}
				</div>
			</div>

			<div className="flex w-full flex-col gap-2.5 border-[var(--primary-color)] p-4 md:w-[50%] md:flex-1 md:border-l-2">
				<div className="relative w-full" style={{ height: "150px" }}>
					<Bar
						data={{
							labels: groupedChartDataMovement.map(
								(data) => data.movement + '"',
							),
							datasets: [
								{
									label: "Total Cost (pts)",
									data: groupedChartDataMovement.map(
										(data) => data.totalPoints,
									),
									backgroundColor: primaryColor,
								},
							],
						}}
						options={{
							responsive: true,
							maintainAspectRatio: false,
							scales: {
								y: {
									beginAtZero: true,
								},
							},
							plugins: {
								title: {
									display: true,
									text: "MOVEMENT OF YOUR UNITS",
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
											const movement = context.label;
											const unitNames = groupedChartDataMovement.find(
												(data) => data.movement === parseInt(movement, 10),
											)?.unitNames;
											return unitNames;
										},
									},
								},
							},
						}}
					/>
				</div>

				<div className="relative w-full" style={{ height: "150px" }}>
					<Bar
						data={{
							labels: groupedChartDataToughness.map((data) => data.toughness),
							datasets: [
								{
									label: "Total Cost (pts)",
									data: groupedChartDataToughness.map(
										(data) => data.totalPoints,
									),
									backgroundColor: primaryColor,
								},
							],
						}}
						options={{
							responsive: true,
							maintainAspectRatio: false,
							scales: {
								y: {
									beginAtZero: true,
								},
							},
							plugins: {
								title: {
									display: true,
									text: "TOUGHNESS OF YOUR UNITS",
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
											const toughness = context.label;
											const unitNames = groupedChartDataToughness.find(
												(data) => data.toughness === parseInt(toughness, 10),
											)?.unitNames;
											return unitNames;
										},
									},
								},
							},
						}}
					/>
				</div>
			</div>
		</div>
	);
};
