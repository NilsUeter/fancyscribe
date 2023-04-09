import factionBackground from "./assets/factionBackground.png";
import adeptusAstartesIcon from "./assets/adeptusAstartesIcon.png";
import meleeIcon from "./assets/meleeIcon.png";
import rangedIcon from "./assets/rangedIcon.png";
import { Arrow } from "./assets/icons";

export const Roster = ({ roster }) => {
	if (!roster) {
		return null;
	}
	const { _name, _forces } = roster;
	return (
		<>
			<div
				style={{
					backgroundColor: "#536766",
					color: "#fff",
					padding: "4px 16px",
					fontSize: " 1.7em",
					fontWeight: "800",
					textTransform: "uppercase",
				}}
			>
				{_name}
			</div>
			{_forces.map((force, index) => (
				<Force key={index} force={force} />
			))}
		</>
	);
};

const Force = ({ force }) => {
	const { _units, rules } = force;
	return (
		<>
			{_units.map((unit, index) => (
				<Unit key={index} unit={unit} />
			))}
			<ForceRules rules={rules} />
		</>
	);
};

const Unit = ({ unit }) => {
	const { _name, weapons, abilities, keywords, factions, rules, modelStats } =
		unit;

	const meleeWeapons = weapons
		.filter((weapon) => weapon._range === "Melee")
		.sort((a, b) => a._selectionName.localeCompare(b._selectionName));
	const rangedWeapons = weapons
		.filter((weapon) => weapon._range !== "Melee")
		.sort((a, b) => a._selectionName.localeCompare(b._selectionName));
	return (
		<div
			style={{
				fontSize: 13,
				fontWeight: 500,
				border: "2px solid #536766",
				backgroundColor: "#DFE0E2",
			}}
		>
			<div
				style={{
					padding: "24px 16px",
					paddingRight: 0,
					paddingBottom: 24 + 50 * (modelStats.length - 1),
					backgroundColor: "#2F2F31",
					color: "#fff",
				}}
			>
				<div
					style={{
						padding: "4px 16px",
						backgroundColor: "#53676680",
						color: "#fff",
						minHeight: 85,
					}}
				>
					<div
						style={{
							fontSize: "1.7em",
							fontWeight: 800,
							textTransform: "uppercase",
						}}
					>
						{_name}
					</div>
					<div
						style={{
							position: "absolute",
							display: "flex",
							flexDirection: "column",
							gap: 6,
						}}
					>
						{modelStats.map((model, index) => (
							<ModelStats
								key={index}
								modelStats={model}
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
						borderRight: "2px solid #536766",
						position: "relative",
						paddingBottom: 40,
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
					</table>
					<div style={{ flex: "1" }}></div>
					{
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
					}
					<Keywords keywords={keywords} />
				</div>
				<div
					style={{
						padding: 20,
						paddingBottom: 80,
						flex: "1",
						maxWidth: 375,
						position: "relative",
					}}
				>
					<div
						style={{
							fontSize: "1.1em",
							padding: "1px 8px",
							backgroundColor: "#536766",
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

const ModelStats = ({ modelStats, index, showName }) => {
	let { move, toughness, save, wounds, leadership, _name } = modelStats;
	if (!wounds) {
		wounds = "/";
	}
	return (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Characteristic title="M" characteristic={move} index={index} />
			<Characteristic title="T" characteristic={toughness} index={index} />
			<Characteristic title="SV" characteristic={save} index={index} />
			<Characteristic title="W" characteristic={wounds} index={index} />
			<Characteristic title="LD" characteristic={leadership} index={index} />
			{showName && (
				<div style={{ marginTop: index === 0 ? 16 : 0, marginLeft: -10 }}>
					{_name}
				</div>
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
				border: "2px solid #536766",
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
				border: "2px solid #536766",
				width: "calc(100% - 18px)",
				backgroundSize: "contain",
				minHeight: 54,
				gap: 3,
				color: "#101010",
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
				border: "2px solid #536766",
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
	return (
		<div
			style={{
				padding: "5px 2px",
				display: "flex",
				alignItems: "center",
				gap: 3,
				borderBottom: "1px dotted #9e9fa1",
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
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 8,
				color: "#213547",
				padding: "4px 2px",
				borderBottom: "1px dotted rgb(158, 159, 161)",
			}}
		>
			{[...abilities.keys()].map((ability) => (
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
				color: "#536766",
				padding: 2,
				background: "linear-gradient(-45deg, transparent 4px, #536766 0)",
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
							backgroundColor: "#536766",
							color: "#fff",
						}}
					>
						<th style={{ width: 37 }}>
							<div style={{ display: "flex" }}>
								<img src={isMelee ? meleeIcon : rangedIcon} />
							</div>
						</th>
						<th style={{ textAlign: "left" }}>{title}</th>
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
	const [type, attacks] = _type.split(" ");
	const bs = modelStats[0]._bs;
	const ws = modelStats[0]._ws;
	const strModel = modelStats[0].str;
	const meleeAttacks = modelStats[0]._attacks;

	const differentProfiles = _selectionName !== _name;
	const interestingType = type !== "Melee";
	if (differentProfiles && _name.endsWith(" grenades")) {
		_name = _name.replace(" grenades", "");
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
							style={{ fontSize: ".8em", fontWeight: 700, color: "#536766" }}
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
	if (strWeapon.startsWith("x"))
		return strModel * parseInt(strWeapon.replace("x", ""));
	return strModel + parseInt(strWeapon, 10);
};

const ForceRules = ({ rules }) => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 8,
				color: "#213547",
				padding: "20px 20px",
				backgroundColor: "#dfe0e2",
				border: "2px solid #536766",
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
