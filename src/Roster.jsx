import factionBackground from "./assets/factionBackground.png";
import adeptusAstartesIcon from "./assets/adeptusAstartesIcon.png";
import meleeIcon from "./assets/meleeIcon.png";
import rangedIcon from "./assets/rangedIcon.png";
import { Arrow } from "./assets/icons";

export const Roster = ({ roster }) => {
	if (!roster) {
		return null;
	}
	const { _name, _cost, _forces } = roster;
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
					backgroundColor: "var(--primary-color)",
					color: "#fff",
					padding: "4px 16px",
					fontSize: " 1.7em",
					fontWeight: "800",
					textTransform: "uppercase",
				}}
			>
				{_name} [{_cost._commandPoints} CP]
			</div>
			{_forces.map((force, index) => (
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
	const { _units, rules, _catalog } = force;

	const primaryColor = getPrimaryColor(_catalog);
	return (
		<div
			style={{
				display: "contents",
				"--primary-color": primaryColor,
				"--primary-color-transparent": "#53676660",
			}}
		>
			{_units.map((unit, index) => (
				<Unit key={index} unit={unit} />
			))}
			<ForceRules rules={rules} />
		</div>
	);
};

const Unit = ({ unit }) => {
	let {
		_name,
		weapons,
		abilities,
		keywords,
		factions,
		rules,
		modelStats,
		_modelList,
		_psykers,
	} = unit;

	const hasDifferentProfiles = weapons.some(
		(weapon) =>
			weapon._selectionName !== weapon._name &&
			!weapon._name.includes("(Shooting)") &&
			!weapon._name.includes("(Melee)")
	);
	const meleeWeapons = weapons
		.filter((weapon) => weapon._range === "Melee" && weapon._range !== "-")
		.sort((a, b) => a._selectionName.localeCompare(b._selectionName));
	const rangedWeapons = weapons
		.filter((weapon) => weapon._range !== "Melee" && weapon._range !== "-")
		.sort((a, b) => a._selectionName.localeCompare(b._selectionName));
	modelStats = modelStats.sort((a, b) => b._name.length - a._name.length); // Sort by length of name, so that for example "Primaris Intercessor Sergeant" is before "Primaris Intercessor"
	return (
		<div
			className="avoid-page-break"
			style={{
				fontSize: 13,
				fontWeight: 500,
				border: "2px solid var(--primary-color)",
				backgroundColor: "#DFE0E2",
			}}
		>
			<div
				style={{
					padding: "24px 16px",
					paddingRight: 0,
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
						minHeight: 85,
						position: "relative",
					}}
				>
					<div
						style={{
							position: "absolute",
							left: 0,
							top: 0,
							backgroundColor: "var(--primary-color-transparent)",
							minHeight: 85,
							width: "100%",
						}}
					></div>
					<div
						style={{
							fontSize: "1.7em",
							fontWeight: 800,
							textTransform: "uppercase",
							zIndex: 1,
							position: "relative",
						}}
					>
						{_name}
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
								modelStats={model}
								modelList={_modelList}
								index={index}
								showName={modelStats.length > 1}
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
					<table
						className="weapons-table"
						style={{ width: "100%", marginTop: 20 }}
					>
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
						<Psykers title="PSYKER" psykers={_psykers} />
					</table>
					<div style={{ flex: "1" }}></div>
					{hasDifferentProfiles && (
						<table className="weapons-table" style={{ width: "100%" }}>
							<tr className="emptyRow">
								<td style={{ width: 37 }}>{Arrow}</td>
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
					<Factions factions={factions} />
					<FactionIcon />
				</div>
			</div>
		</div>
	);
};

const ModelStats = ({ modelStats, index, showName, modelList }) => {
	let { move, toughness, save, wounds, leadership, _name } = modelStats;
	if (!wounds) {
		wounds = "/";
	}
	const modelListMatches = modelList
		.filter((model) => model.includes(_name))
		.map((model) => "(" + model.split("(")[1]);
	return (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Characteristic title="M" characteristic={move} index={index} />
			<Characteristic title="T" characteristic={toughness} index={index} />
			<Characteristic title="SV" characteristic={save} index={index} />
			<Characteristic title="W" characteristic={wounds} index={index} />
			<Characteristic title="LD" characteristic={leadership} index={index} />
			{showName && (
				<>
					<div
						style={{
							marginTop: index === 0 ? 16 : 0,
							marginLeft: -10,
							whiteSpace: "nowrap",
						}}
					>
						{_name}
					</div>
					<div
						style={{
							marginTop: index === 0 ? 16 : 0,
							marginLeft: -10,
							fontSize: "0.7em",
						}}
					>
						{modelListMatches.map((model, index) => (
							<div>{model}</div>
						))}
					</div>
				</>
			)}
		</div>
	);
};

const FactionIcon = () => {
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
					background: `url(${adeptusAstartesIcon})`,
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
				}}
			>
				<div style={{ fontSize: "1.6em", fontWeight: 800 }}>{children}</div>
			</div>
		</div>
	);
};

const Weapons = ({ title, weapons, modelStats }) => {
	const isMelee = title === "MELEE WEAPONS";
	return (
		<>
			{weapons.length > 0 && (
				<thead>
					<tr
						style={{
							backgroundColor: "var(--primary-color)",
							color: "#fff",
						}}
					>
						<th style={{ width: 37 }}>
							<div style={{ display: "flex" }}>
								<img src={isMelee ? meleeIcon : rangedIcon} />
							</div>
						</th>
						<th style={{ textAlign: "left", width: "44%" }}>{title}</th>
						<th>RANGE</th>
						<th>A</th>
						<th>{isMelee ? "WS" : "BS"}</th>
						<th>S</th>
						<th>AP</th>
						<th>D</th>
					</tr>
				</thead>
			)}
			<tbody>
				{weapons.map((weapon, index) => (
					<Weapon
						key={weapon._name}
						weapon={weapon}
						modelStats={modelStats}
						isMelee={isMelee}
						index={index}
					/>
				))}
				{weapons.length > 0 && (
					<tr className="emptyRow">
						<td colSpan={8}></td>
					</tr>
				)}
			</tbody>
		</>
	);
};

const Weapon = ({ weapon, modelStats, isMelee, index }) => {
	let { _name, _selectionName, _range, _type, str, _ap, _damage } = weapon;
	var lastWhiteSpace = _type.lastIndexOf(" ");
	const type = _type.substring(0, lastWhiteSpace);
	const attacks = _type.substring(lastWhiteSpace + 1);
	const bs = modelStats[0]._bs;
	const ws = modelStats[0]._ws;
	const strModel = modelStats[0].str;
	const meleeAttacks = modelStats[0]._attacks;

	if (_name === "Krak grenades") {
		_name = "Krak grenade";
	}
	const differentProfiles =
		_selectionName !== _name &&
		!_name.includes("(Shooting)") &&
		!_name.includes("(Melee)");
	const interestingType = type && type !== "Melee";
	if (differentProfiles && _name.endsWith(" grenades")) {
		_name = _name.replace(" grenades", "");
	}
	if (differentProfiles && _name.endsWith(" grenade")) {
		_name = _name.replace(" grenade", "");
	}
	if (differentProfiles && _name.includes(" - ")) {
		_name = _name.split(" - ")[1];
	}
	return (
		<tr
			className={
				(differentProfiles ? "differentProfiles" : "") +
				" " +
				(index % 2 ? "rowOtherColor" : "")
			}
		>
			<td style={{ borderBottom: "none", backgroundColor: "#dfe0e2" }}>
				{differentProfiles && Arrow}
			</td>
			<td style={{ textAlign: "left" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "0 4px",
					}}
				>
					{differentProfiles && _selectionName + " - "}
					{_name}
					{interestingType && (
						<span
							style={{
								fontSize: ".8em",
								fontWeight: 700,
								color: "var(--primary-color)",
							}}
						>
							[{type}]
						</span>
					)}
				</div>
			</td>
			<td>{_range}</td>
			<td>{isMelee ? meleeAttacks : attacks}</td>
			<td>{isMelee ? ws : bs}</td>
			<td>{isMelee ? calculateWeaponStrength(strModel, str) : str}</td>
			<td>{_ap}</td>
			<td>{_damage}</td>
		</tr>
	);
};

const calculateWeaponStrength = (strModel, strWeapon) => {
	if (strWeapon.startsWith("User")) return strModel;
	if (strWeapon.startsWith("x"))
		return strModel * parseInt(strWeapon.replace("x", ""));
	return strModel + parseInt(strWeapon, 10);
};

const Psykers = ({ title, psykers }) => {
	return (
		<>
			{psykers.length > 0 && (
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
					<Psyker key={psyker._name} psyker={psyker} index={index} />
				))}
				{psykers.length > 0 && (
					<tr className="emptyRow">
						<td colSpan={8}></td>
					</tr>
				)}
			</tbody>
		</>
	);
};

const Psyker = ({ psyker, index }) => {
	let { _name, _cast, _deny, _powers } = psyker;

	return (
		<tr className={index % 2 ? "rowOtherColor" : ""}>
			<td style={{ borderBottom: "none", backgroundColor: "#dfe0e2" }}></td>
			<td style={{ textAlign: "left" }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "0 4px",
					}}
				>
					{_name}
				</div>
			</td>
			<td>{_cast}</td>
			<td>{_deny}</td>
			<td style={{ textAlign: "left" }} colSpan="4">
				{_powers}
			</td>
		</tr>
	);
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
							fontSize: ".8em",
							lineHeight: 1.4,
						}}
					>
						<span style={{ fontWeight: 700 }}>{rule}:</span> {rules.get(rule)}
					</div>
				))}
		</div>
	);
};
