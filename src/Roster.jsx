import factionBackground from "./assets/factionBackground.png";
import adeptusAstartesIcon from "./assets/adeptusAstartesIcon.png";
import rangedIcon from "./assets/rangedIcon.png";
import { Arrow, wavyLine } from "./assets/icons";
import { Weapons } from "./Weapons";

export const Roster = ({ roster }) => {
	if (!roster) {
		return null;
	}
	const { name, cost, forces } = roster;
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 32,
			}}
		>
			<div
				style={{
					backgroundColor: "#536766",
					color: "#fff",
					padding: "4px 16px",
					fontSize: " 1.7em",
					fontWeight: "800",
					textTransform: "uppercase",
					marginBottom: -16,
				}}
			>
				{name} [{cost.commandPoints} CP]
			</div>
			{forces.map((force, index) => (
				<Force key={index} force={force} />
			))}
		</div>
	);
};

const getPrimaryColor = (catalog) => {
	switch (catalog) {
		case "Adeptus Astartes":
			return "#536766";
		case "Adeptus Custodes":
			return "#536766";
		case "Adeptus Mechanicus":
			return "#536766";
		case "Astra Militarum":
			return "#536766";
		case "Chaos Daemons":
			return "#536766";
		case "Chaos Space Marines":
			return "#536766";
		case "Death Guard":
			return "#536766";
		case "Drukhari":
			return "#536766";
		case "Genestealer Cults":
			return "#536766";
		case "Grey Knights":
			return "#536766";
		case "Harlequins":
			return "#536766";
		case "Imperial Knights":
			return "#536766";
		case "Necrons":
			return "#536766";
		case "Orks":
			return "#536766";
		case "Sisters of Battle":
			return "#536766";
		case "Space Marines":
			return "#536766";
		case "Tau Empire":
			return "#536766";
		case "Thousand Sons":
			return "#536766";
		case "Tyranids":
			return "#44264C";
		case "Ynnari":
			return "#536766";
		default:
			return "#536766";
	}
};

const Force = ({ force }) => {
	const { units, rules, catalog } = force;

	const primaryColor = getPrimaryColor(catalog);
	return (
		<div
			style={{
				display: "contents",
				"--primary-color": primaryColor,
				"--primary-color-transparent": "#53676660",
			}}
		>
			{units.map((unit, index) => (
				<Unit key={index} unit={unit} catalog={catalog} />
			))}
			<ForceRules rules={rules} />
		</div>
	);
};

const Unit = ({ unit, catalog }) => {
	let {
		name,
		weapons,
		abilities,
		keywords,
		factions,
		rules,
		modelStats,
		modelList,
		psykers,
		spells,
		cost,
	} = unit;

	const hasDifferentProfiles = weapons.some(
		(weapon) =>
			weapon.selectionName !== weapon.name &&
			!weapon.name.includes("(Shooting)") &&
			!weapon.name.includes("(Melee)")
	);
	const meleeWeapons = weapons
		.filter((weapon) => weapon.range === "Melee" && weapon.range !== "-")
		.sort((a, b) => a.selectionName.localeCompare(b.selectionName));
	if (meleeWeapons.length === 0) {
		meleeWeapons.push({
			name: "Close combat weapon",
			selectionName: "Close combat weapon",
			range: "Melee",
			damage: "1",
			type: "Melee",
			str: "0",
			ap: "0",
		});
	}
	const rangedWeapons = weapons
		.filter((weapon) => weapon.range !== "Melee" && weapon.range !== "-")
		.sort((a, b) => a.selectionName.localeCompare(b.selectionName));
	if (!modelStats.some((model) => model.name.includes("wounds remaining)"))) {
		modelStats = modelStats.sort((a, b) => b.name.length - a.name.length); // Sort by length of name, so that for example "Primaris Intercessor Sergeant" is before "Primaris Intercessor"
	}
	return (
		<div
			className="avoid-page-break"
			style={{
				fontWeight: 500,
				border: "2px solid var(--primary-color)",
				backgroundColor: "#DFE0E2",
			}}
		>
			<div
				style={{
					padding: "24px 0",
					paddingBottom: 24,
					background:
						"linear-gradient(90deg, rgba(20,21,25,1) 0%, rgba(48,57,62,1) 45%, rgba(73,74,79,1) 100%)",
					color: "#fff",
				}}
			>
				<div
					style={{
						padding: "4px 16px",
						color: "#fff",
						position: "relative",
					}}
				>
					<div
						style={{
							position: "absolute",
							left: 0,
							top: 0,
							width: "100%",
							display: "flex",
						}}
					>
						<div
							style={{
								backgroundColor: "var(--primary-color-transparent)",
								height: 80,
								minWidth: 340,
							}}
						></div>
						<div
							style={{
								height: 80,
								display: "flex",
								flexDirection: "column",
							}}
						>
							<div
								style={{
									backgroundColor: "var(--primary-color-transparent)",
									height: 40,
								}}
							></div>
							{wavyLine}
						</div>
						<div
							style={{
								flex: "10",
								backgroundColor: "var(--primary-color-transparent)",
								height: 40,
							}}
						></div>
					</div>
					<div
						style={{
							fontSize: "1.7em",
							fontWeight: 800,
							textTransform: "uppercase",
							zIndex: 1,
							position: "relative",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						{name}
						<span style={{ textTransform: "initial", fontSize: "1.1rem" }}>
							{cost.points}pts
						</span>
					</div>
					<div
						style={{
							width: "calc(100% - 32px)",
							display: "flex",
							flexDirection: "column",
							gap: 6,
							zIndex: 1,
							position: "relative",
						}}
					>
						{modelStats.map((model, index) => (
							<ModelStats
								key={index}
								modelStats={modelStats}
								modelStat={model}
								modelList={modelList}
								index={index}
								showName={modelStats.length > 1}
								showWeapons={
									modelList.length > 1 || modelList[0].includes("x ") // show Weapons when multiple weapons of same type, for example (2x Atomiser Beam, Reanimator's Claws)
								}
							/>
						))}
					</div>
				</div>
			</div>
			<div style={{ display: "flex" }}>
				<div
					style={{
						flex: "1",
						borderRight: "2px solid var(--primary-color)",
						position: "relative",
						paddingBottom: 40,
						display: "flex",
						flexDirection: "column",
					}}
				>
					<Spells title="PSYCHIC" spells={spells} />
					<table className="weapons-table" style={{ width: "100%" }}>
						<Weapons
							title="RANGED WEAPONS"
							weapons={rangedWeapons}
							modelStats={modelStats}
						/>
						<Weapons
							title="MELEE WEAPONS"
							weapons={meleeWeapons}
							modelStats={modelStats}
						/>
					</table>
					<div style={{ flex: "1" }}></div>
					{hasDifferentProfiles && (
						<table className="weapons-table" style={{ width: "100%" }}>
							<tbody>
								<tr className="emptyRow noBorderTop">
									<td style={{ width: 37, borderTop: "none" }}>{Arrow}</td>
									<td
										colSpan={7}
										style={{
											textAlign: "left",
											fontSize: ".8em",
											paddingLeft: 0,
										}}
									>
										Before selecting targets for this weapon, select one of its
										profiles to make attacks with.
									</td>
								</tr>
							</tbody>
						</table>
					)}
					<Keywords keywords={keywords} />
				</div>
				<div
					style={{
						padding: 20,
						paddingBottom: 50,
						flex: "1",
						maxWidth: 400,
						position: "relative",
					}}
				>
					<div
						style={{
							fontSize: "1.1em",
							padding: "1px 8px",
							backgroundColor: "var(--primary-color)",
							color: "#fff",
							fontWeight: 600,
							minHeight: 27,
							display: "flex",
							alignItems: "center",
						}}
					>
						ABILITIES
					</div>
					<Rules rules={rules} />
					<Abilities abilities={abilities.Abilities} />
					<Psykers title="PSYKER" psykers={psykers} />
					<Factions factions={factions} />
					<FactionIcon catalog={catalog} />
				</div>
			</div>
		</div>
	);
};

const ModelStats = ({
	modelStats,
	modelStat,
	index,
	showName,
	showWeapons,
	modelList,
}) => {
	let { move, toughness, save, wounds, leadership, name, bs, ws } = modelStat;
	if (!wounds) {
		wounds = "/";
	}
	if (!name.includes("Sgt")) {
		modelList = modelList.filter((model) => !model.includes("Sgt"));
	}
	if (!name.includes("Sergeant")) {
		modelList = modelList.filter((model) => !model.includes("Sergeant"));
	}
	let modelListMatches = modelList.filter((model) =>
		model.includes(name + " w")
	);
	if (modelListMatches.length === 0) {
		modelListMatches = modelList.filter((model) => model.includes(name));
	}
	modelListMatches = modelListMatches.map((model) =>
		model.replaceAll(name, "")
	);
	const bsChange = Math.abs(parseInt(modelStats[0].bs, 10) - parseInt(bs, 10));
	const wsChange = Math.abs(parseInt(modelStats[0].ws, 10) - parseInt(ws, 10));

	return (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Characteristic title="M" characteristic={move} index={index} />
			<Characteristic title="T" characteristic={toughness} index={index} />
			<Characteristic title="SV" characteristic={save} index={index} />
			<Characteristic title="W" characteristic={wounds} index={index} />
			<Characteristic title="LD" characteristic={leadership} index={index} />

			{showName && (
				<div
					style={{
						marginTop: index === 0 ? 16 : 0,
						marginLeft: -10,
						whiteSpace: "nowrap",
					}}
				>
					{name}
					{name.toLowerCase().includes("wounds remaining") &&
						(bsChange !== 0 || wsChange !== 0) &&
						` Each time this model makes an attack, subtract ${
							bsChange ? `${bsChange} from the balistic skill` : ""
						}${bsChange !== 0 && wsChange !== 0 ? " and " : ""}${
							wsChange ? `${wsChange} from the weapon skill` : ""
						}.`}
				</div>
			)}
			{showWeapons && (
				<div
					style={{
						marginTop: index === 0 ? 16 : 0,
						marginLeft: -10,
						fontSize: "0.7em",
					}}
				>
					{modelListMatches.map((model, index) => (
						<div key={model}>{model}</div>
					))}
				</div>
			)}
		</div>
	);
};

const FactionIcon = ({ catalog }) => {
	return (
		<div
			style={{
				position: "absolute",
				left: -28,
				bottom: -16,
				width: 54,
				height: 54,
				transform: "rotate(-45deg)",
				border: "2px solid var(--primary-color)",
				overflow: "hidden",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<div
				style={{
					background: catalog.includes("Imperium")
						? `url(${adeptusAstartesIcon})`
						: "#bcbcbe",
					backgroundPosition: "center",
					minHeight: "75px",
					minWidth: "76px",
					transform: "rotate(45deg)",
				}}
			></div>
		</div>
	);
};

const Keywords = ({ keywords }) => {
	keywords = Array.from(keywords).filter(
		(keyword) => keyword !== "Configuration"
	);
	return (
		<div
			style={{
				position: "absolute",
				right: -2,
				bottom: -16,
				padding: "0 8px",
				paddingRight: 42,
				display: "flex",
				alignItems: "center",
				backgroundColor: "#BCBCBE",
				border: "2px solid var(--primary-color)",
				width: "calc(100% - 18px)",
				backgroundSize: "contain",
				minHeight: 54,
				gap: 3,
			}}
		>
			<span style={{ fontSize: "1.1em" }}>KEYWORDS:</span>
			<span style={{ fontSize: "1em", fontWeight: 800 }}>
				{[...keywords].join(", ")}
			</span>
		</div>
	);
};

const Factions = ({ factions }) => {
	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				bottom: -16,
				padding: "0 4px",
				paddingLeft: 42,
				display: "flex",
				justifyContent: "center",
				flexDirection: "column",
				background: `url(${factionBackground})`,
				color: "#fff",
				border: "2px solid var(--primary-color)",
				borderLeft: "none",
				width: "calc(100% - 18px)",
				backgroundSize: "contain",
				minHeight: 54,
			}}
		>
			<span style={{ fontSize: ".9em", lineHeight: 1.3 }}>
				FACTION KEYWORDS:
			</span>
			<span style={{ fontSize: ".9em", fontWeight: 600 }}>
				{[...factions].join(", ")}
			</span>
		</div>
	);
};

const Rules = ({ rules }) => {
	if (!rules || rules.size === 0) return null;
	return (
		<div
			style={{
				padding: "5px 2px",
				gap: 3,
				borderBottom: "1px dotted #9e9fa1",
				lineHeight: 1.3,
			}}
		>
			<span style={{ fontSize: ".8em" }}>RULES: </span>
			<span style={{ fontSize: ".8em", fontWeight: 700 }}>
				{[...rules.keys()].map((rule) => rule).join(", ")}
			</span>
		</div>
	);
};

const Abilities = ({ abilities }) => {
	if (!abilities) return null;
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 8,
				padding: "4px 2px",
				borderBottom: "1px dotted rgb(158, 159, 161)",
			}}
		>
			{abilities &&
				[...abilities.keys()].map((ability) => (
					<div
						key={ability}
						style={{
							fontSize: ".8em",
							lineHeight: 1.4,
						}}
					>
						<span style={{ fontWeight: 700 }}>{ability}:</span>{" "}
						{abilities.get(ability)}
					</div>
				))}
		</div>
	);
};

const Characteristic = ({ title, characteristic, index }) => {
	return (
		<div
			style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
		>
			{index === 0 && (
				<div style={{ fontSize: ".9em", fontWeight: 800 }}>{title}</div>
			)}
			<FancyBox>{characteristic}</FancyBox>
		</div>
	);
};

const FancyBox = ({ children }) => {
	return (
		<div
			style={{
				color: "var(--primary-color)",
				padding: 2,
				background:
					"linear-gradient(-45deg, transparent 4px, var(--primary-color) 0)",
			}}
		>
			<div
				style={{
					minWidth: 40,
					minHeight: 40,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(315deg, transparent 3px, #E8EDE7 0)",
					padding: 3,
					fontSize: "1.6em",
					fontWeight: 800,
				}}
			>
				{children}
			</div>
		</div>
	);
};

const Psykers = ({ title, psykers }) => {
	return (
		<table
			className="weapons-table"
			style={{ width: "100%", margin: "4px 2px" }}
		>
			{psykers.length > 0 && (
				<thead>
					<tr
						style={{
							backgroundColor: "var(--primary-color)",
							color: "#fff",
						}}
					>
						<th style={{ textAlign: "left" }}>{title}</th>
						<th>Cast</th>
						<th>Deny</th>
						<th style={{ textAlign: "left" }} colSpan="4">
							Powers Known
						</th>
					</tr>
				</thead>
			)}
			<tbody>
				{psykers.map((psyker, index) => (
					<Psyker key={psyker.name} psyker={psyker} index={index} />
				))}
				{psykers.length > 0 && (
					<tr className="emptyRow">
						<td style={{ width: 37 }}></td>
						<td colSpan={7}></td>
					</tr>
				)}
			</tbody>
		</table>
	);
};

const Psyker = ({ psyker, index }) => {
	let { name, cast, deny, powers } = psyker;

	return (
		<tr
			className={index % 2 ? "rowOtherColor" : ""}
			style={{ fontSize: ".8em" }}
		>
			<td style={{ textAlign: "left" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "0 4px",
					}}
				>
					{name}
				</div>
			</td>
			<td>{cast}</td>
			<td>{deny}</td>
			<td style={{ textAlign: "left" }} colSpan="4">
				{powers}
			</td>
		</tr>
	);
};

const Spells = ({ title, spells }) => {
	return (
		<table className="weapons-table" style={{ width: "100%", marginTop: 20 }}>
			{spells.length > 0 && (
				<thead>
					<tr
						style={{
							backgroundColor: "var(--primary-color)",
							color: "#fff",
						}}
					>
						<th style={{ width: 37 }}>
							<div style={{ display: "flex" }}>
								<img src={rangedIcon} />
							</div>
						</th>
						<th style={{ textAlign: "left" }}>{title}</th>
						<th>RANGE</th>
						<th>WARP CHARGE</th>
					</tr>
				</thead>
			)}
			<tbody>
				{spells.map((spell, index) => (
					<Spell
						key={spell.name}
						spell={spell}
						index={index}
						className={getSpellClassNames(spells, index)}
					/>
				))}
				{spells.length > 0 && (
					<tr className="emptyRow">
						<td style={{ width: 37, borderTop: "none" }}></td>
						<td colSpan={7}></td>
					</tr>
				)}
			</tbody>
		</table>
	);
};

const Spell = ({ spell, index, className }) => {
	let { name, range, manifest, details } = spell;
	return (
		<>
			<tr className={className}>
				<td style={{ borderTop: "none", backgroundColor: "#dfe0e2" }}></td>
				<td style={{ textAlign: "left" }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "0 4px",
						}}
					>
						{name}
					</div>
				</td>
				<td>{range}</td>
				<td>{manifest}</td>
			</tr>
			<tr className={className + " noBorderTop"}>
				<td style={{ backgroundColor: "#dfe0e2" }}></td>
				<td
					colSpan="7"
					style={{
						textAlign: "left",
						fontSize: "0.8em",
						paddingTop: 0,
						paddingBottom: 1,
						lineHeight: 1.4,
					}}
				>
					{details}
				</td>
			</tr>
		</>
	);
};

const getSpellClassNames = (spells, index) => {
	let differentColor = false;
	for (let i = 1; i <= index; i++) {
		let { name } = spells[i];
		if (name !== spells[i - 1].name) {
			differentColor = !differentColor;
		}
	}
	const classes = [];
	if (differentColor) classes.push("rowOtherColor");
	if (index === 0) classes.push("noBorderTop");
	if (index > 0 && spells[index].name === spells[index - 1].name)
		classes.push("noBorderTop");
	return classes.join(" ");
};

const ForceRules = ({ rules }) => {
	return (
		<div
			className="avoid-page-break"
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 8,
				padding: "20px 20px",
				backgroundColor: "#dfe0e2",
				border: "2px solid var(--primary-color)",
			}}
		>
			{[...rules.keys()]
				.filter((rule) => !rule.startsWith("Explodes"))
				.map((rule) => (
					<div
						key={rule}
						style={{
							lineHeight: 1.4,
						}}
					>
						<span style={{ fontWeight: 700 }}>{rule}:</span> {rules.get(rule)}
					</div>
				))}
		</div>
	);
};
