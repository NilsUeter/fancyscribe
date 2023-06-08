import { useRef, useState, useEffect } from "react";
import factionBackground from "./assets/factionBackground.png";
import adeptusAstartesIcon from "./assets/adeptusAstartesIcon.png";
import rangedIcon from "./assets/rangedIcon.png";
import { Arrow, wavyLine } from "./assets/icons";
import { Weapons, hasDifferentProfiles } from "./Weapons";

export const Roster = ({ roster, onePerPage }) => {
	if (!roster) {
		return null;
	}
	const { name, cost, forces } = roster;
	return (
		<div
			style={{
				position: "relative",
			}}
		>
			<div
				className="print-display-none"
				style={{
					backgroundColor: "var(--primary-color)",
					color: "#fff",
					padding: "4px 16px",
					fontSize: " 1.7em",
					fontWeight: "800",
					textTransform: "uppercase",
					marginBottom: "12px",
				}}
			>
				{name} [{cost.commandPoints} CP, {cost.points} pts]
			</div>
			{forces.map((force, index) => (
				<Force key={index} force={force} onePerPage={onePerPage} />
			))}
		</div>
	);
};

const Force = ({ force, onePerPage }) => {
	const { units, factionRules, rules, catalog } = force;
	var mergedRules = new Map([...factionRules, ...rules]);
	return (
		<div
			style={{
				display: "contents",
			}}
		>
			{units.map((unit, index) => (
				<Unit
					key={unit.name + index}
					index={index}
					unit={unit}
					catalog={catalog}
					onePerPage={onePerPage}
					forceRules={rules}
				/>
			))}
			<ForceRules rules={mergedRules} onePerPage={onePerPage} />
		</div>
	);
};

const Unit = ({ unit, index, catalog, onePerPage, forceRules }) => {
	const [hide, setHide] = useState(false);
	const uploadRef = useRef();
	const [image, setImage] = useState(null);
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
		woundTracker,
	} = unit;

	const meleeWeapons = weapons
		.filter(
			(weapon) =>
				(weapon.range === "Melee" || weapon.type === "Melee") &&
				weapon.range !== ""
		)
		.sort((a, b) => a.selectionName.localeCompare(b.selectionName));
	if (meleeWeapons.length === 0) {
		meleeWeapons.push({
			name: "Close combat weapon",
			selectionName: "Close combat weapon",
			range: "Melee",
			damage: "1",
			type: "Melee",
			str: "+0",
			ap: "0",
		});
	}
	const rangedWeapons = weapons
		.filter(
			(weapon) =>
				weapon.range !== "Melee" && weapon.range !== "-" && weapon.range !== ""
		)
		.sort((a, b) => a.selectionName.localeCompare(b.selectionName));

	const weaponDescriptions = weapons
		.filter(
			(weapon) =>
				(weapon.range === "-" || weapon.range === "") && weapon.abilities
		)
		.sort((a, b) => a.selectionName.localeCompare(b.selectionName));
	const modelsWithDifferentProfiles = weapons.filter((weapon, index) => {
		const { selectionName, name } = weapon;
		const previousWeapon = weapons[index - 1];
		const nextWeapon = weapons[index + 1];
		return (
			hasDifferentProfiles(selectionName, name) &&
			((previousWeapon &&
				hasDifferentProfiles(
					previousWeapon.selectionName,
					previousWeapon.name
				) &&
				selectionName === previousWeapon.selectionName) ||
				(nextWeapon &&
					hasDifferentProfiles(nextWeapon.selectionName, nextWeapon.name) &&
					selectionName === nextWeapon.selectionName))
		);
	});

	const overridePrimary = getOverridePrimary(factions, keywords);

	useEffect(() => {
		// Check if the browser is Safari, and if so, remove the accept attribute
		// from the file input element. This is because Safari doesn't support
		// extensions on the accept attribute for input type=file
		// (https://caniuse.com/input-file-accept). If set, they will not allow any
		// file to be selected.
		if (
			navigator.userAgent.match(/AppleWebKit.*Safari/) &&
			!navigator.userAgent.includes("Chrome")
		) {
			uploadRef.current?.removeAttribute("accept");
		}
	}, []);

	return (
		<div
			className={
				"avoid-page-break" +
				(onePerPage ? " page-break" : "") +
				(hide ? " print-display-none" : "")
			}
			style={{
				fontWeight: 500,
				marginBottom: 32,

				"--primary-color": overridePrimary,
				"--primary-color-transparent": overridePrimary
					? overridePrimary + "60"
					: "",
			}}
		>
			<label
				className="print-display-none"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
				}}
			>
				<input type="checkbox" onChange={() => setHide(!hide)} />
				<span className="print-display-none">Don't print this card.</span>
			</label>
			<div
				style={{
					padding: "24px 0",
					paddingBottom: 24,
					background:
						"linear-gradient(90deg, rgba(20,21,25,1) 0%, rgba(48,57,62,1) 45%, rgba(73,74,79,1) 100%)",
					color: "#fff",
					minHeight: 200,
					position: "relative",
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
							fontFamily: "ConduitITCStd",
							fontSize: "2.5em",
							letterSpacing: ".1px",
							lineHeight: "1",
							fontWeight: 800,
							textTransform: "uppercase",
							zIndex: 1,
							position: "relative",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 2,
						}}
					>
						{name}
						<span style={{ textTransform: "initial", fontSize: "1.2rem" }}>
							{cost.points}pts
						</span>
					</div>
					<div
						style={{
							width: "100%",
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

						<WoundTracker woundTracker={woundTracker} />
					</div>
				</div>
				<div
					style={{
						position: "absolute",
						right: 0,
						top: 0,
						height: "100%",
						bottom: 0,
						width: "50%",
					}}
				>
					{image && (
						<img
							src={image}
							alt=""
							style={{ width: "100%", height: "100%", objectFit: "contain" }}
						/>
					)}
					<label
						className="button print-display-none"
						style={{
							position: "absolute",
							top: "0",
							right: 0,
							border: "1px solid #999",
							top: 1,
							right: 1,
							padding: "1px 4px",
							fontSize: "0.8rem",
							backgroundColor: "#f0f0f0",
						}}
					>
						<input
							ref={uploadRef}
							type="file"
							className="print-display-none"
							accept=".jpg,.png,.jpeg,.gif,.bmp,.tif,.tiff,.webp,.svg,.jfif,.pjpeg,.pjp,.avif,.apng,.ico,.cur,.ani"
							onChange={(e) => {
								if (e.target.files && e.target.files[0]) {
									let reader = new FileReader();
									reader.onload = function (ev) {
										setImage(ev.target.result);
									}.bind(this);
									reader.readAsDataURL(e.target.files[0]);
								}
							}}
							style={{
								display: "none",
							}}
						/>
						Upload image
					</label>
				</div>
			</div>
			<div
				style={{
					display: "flex",
					border: "2px solid var(--primary-color)",
					borderTop: "none",
					backgroundColor: "#DFE0E2",
				}}
			>
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
					<table
						cellSpacing="0"
						className="weapons-table"
						style={{ width: "100%" }}
					>
						<Weapons
							title="RANGED WEAPONS"
							weapons={rangedWeapons}
							modelStats={modelStats}
							forceRules={forceRules}
						/>
						<Weapons
							title="MELEE WEAPONS"
							weapons={meleeWeapons}
							modelStats={modelStats}
							forceRules={forceRules}
						/>
					</table>
					<div style={{ flex: "1" }}></div>
					<table
						cellSpacing="0"
						className="weapons-table"
						style={{ width: "100%" }}
					>
						<tbody>
							{weaponDescriptions.map((weapon, index) => (
								<tr key={index} className="emptyRow noBorderTop">
									<td style={{ width: 37, borderTop: "none" }}>{Arrow}</td>
									<td
										style={{
											textAlign: "left",
											fontSize: ".8em",
											paddingLeft: 0,
										}}
									>
										{weapon.name} - {weapon.abilities}
									</td>
								</tr>
							))}
							{modelsWithDifferentProfiles.length > 0 &&
								!weaponDescriptions.length && (
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
											Before selecting targets for this weapon, select one of
											its profiles to make attacks with.
										</td>
									</tr>
								)}
						</tbody>
					</table>

					<Keywords keywords={keywords} />
				</div>
				<div
					style={{
						padding: "var(--size-20) var(--size-20) 50px var(--size-20)",
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
					<Psykers psykers={psykers} />
					<Factions factions={factions} />
					<FactionIcon catalog={catalog} />
				</div>
			</div>
		</div>
	);
};

const ModelStats = ({ modelStat, index, showName, showWeapons, modelList }) => {
	let { move, toughness, save, wounds, leadership, name, bs, ws, attacks } =
		modelStat;
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

	return (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<Characteristic title="M" characteristic={move} index={index} />
			<Characteristic title="T" characteristic={toughness} index={index} />
			<Characteristic title="SV" characteristic={save} index={index} />
			<Characteristic title="W" characteristic={wounds} index={index} />
			<Characteristic title="LD" characteristic={leadership} index={index} />
			<div>
				{showName && (
					<div
						style={{
							marginTop: index === 0 ? 16 : 0,
							marginLeft: -10,
							whiteSpace: "nowrap",
						}}
					>
						{name}
					</div>
				)}
				{showWeapons && (
					<div
						style={{
							marginTop: index === 0 && !showName ? 16 : 0,
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
	let keys = [...abilities.keys()];
	keys = keys.filter(
		(key) => key !== "Stratagem: Warlord Trait" && key !== "Stratagem: Relic"
	);
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
				keys.map((ability) => (
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
			cellSpacing="0"
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
						<th style={{ textAlign: "left" }}>PSYKER</th>
						<th>CAST</th>
						<th>DENY</th>
						<th style={{ textAlign: "left", width: "100%" }} colSpan="4">
							POWERS KNOWN
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
						<td colSpan={4}></td>
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
			<td style={{ textAlign: "left" }}></td>
			<td>{cast}</td>
			<td>{deny}</td>
			<td style={{ textAlign: "left" }} colSpan="4">
				{powers}
			</td>
		</tr>
	);
};

const WoundTracker = ({ woundTracker }) => {
	if (!woundTracker || woundTracker.length === 0) return null;
	const uniqueWoundTracker = woundTracker.filter((woundTrack, index) => {
		const firstIndex = woundTracker.findIndex(
			(woundTrack2) => woundTrack2.name === woundTrack.name
		);
		return firstIndex === index;
	});

	return (
		<div style={{ display: "flex" }}>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<table
					cellSpacing="0"
					className="weapons-table"
					style={{ width: "100%", margin: "4px 2px", marginBottom: -16 }}
				>
					<thead>
						<tr
							style={{
								backgroundColor: "var(--primary-color)",
								color: "#fff",
							}}
						>
							{[...uniqueWoundTracker[0].table.keys()].map((key) => (
								<th key={key}>{key}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{uniqueWoundTracker.map((woundTrack, index) => (
							<tr key={index}>
								{[...woundTrack.table.values()].map((entry) => (
									<td key={entry} style={{ borderTop: "none" }}>
										{entry}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

const Spells = ({ title, spells }) => {
	return (
		<table
			cellSpacing="0"
			className="weapons-table"
			style={{ width: "100%", marginTop: "var(--size-20)" }}
		>
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

const ForceRules = ({ rules, onePerPage }) => {
	const [hide, setHide] = useState(false);
	return (
		<div
			className={
				"avoid-page-break " +
				(onePerPage ? "page-break" : "") +
				(hide ? " print-display-none" : "")
			}
		>
			<label
				className="print-display-none"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
				}}
			>
				<input type="checkbox" onChange={() => setHide(!hide)} />
				<span className="print-display-none">Don't print this card.</span>
			</label>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 8,
					padding: "var(--size-20)",
					backgroundColor: "#dfe0e2",
					border: "2px solid var(--primary-color)",
					marginBottom: 32,
				}}
			>
				{[...rules.keys()].map((rule) => (
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
		</div>
	);
};

const getOverridePrimary = (factions, keywords) => {
	if (
		factions.has("Khorne") &&
		factions.has("Tzeentch") &&
		factions.has("Nurgle") &&
		factions.has("Slaanesh")
	)
		return;
	if (factions.has("Khorne") || keywords.has("Khorne")) return "#883531";
	if (factions.has("Tzeentch") || keywords.has("Tzeentch")) return "#015d68";
	if (factions.has("Nurgle") || keywords.has("Nurgle")) return "#5c672b";
	if (factions.has("Slaanesh") || keywords.has("Slaanesh")) return "#634c74";
};
