import { useRef, useState, useEffect, Fragment } from "react";
import factionBackground from "../assets/factionBackground.png";
import adeptusAstartesIcon from "../assets/adeptusAstartesIcon.png";
import { Arrow, wavyLine } from "../assets/icons";
import { Weapons, hasDifferentProfiles } from "./Weapons";
import { useLocalStorage } from "../helpers/useLocalStorage";

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
	let {
		name,
		meleeWeapons,
		rangedWeapons,
		abilities,
		keywords,
		factions,
		rules,
		modelStats,
		modelList,
		cost,
	} = unit;
	const [image, setImage] = useLocalStorage("image" + name);
	const hasImage = image && image !== "undefined";

	const weapons = [...meleeWeapons, ...rangedWeapons];

	const weaponDescriptions = weapons
		.filter(
			(weapon) =>
				(weapon.range === "-" || weapon.range === "") && weapon.abilities,
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
					previousWeapon.name,
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

	const areAllModelsTheSame = (modelStats) => {
		if (modelStats.length === 1) return true;
		const firstModel = modelStats[0];
		return modelStats.every(
			(model) =>
				model.move === firstModel.move &&
				model.toughness === firstModel.toughness &&
				model.save === firstModel.save &&
				model.wounds === firstModel.wounds &&
				model.leadership === firstModel.leadership &&
				model.oc === firstModel.oc &&
				model.bs === firstModel.bs &&
				model.ws === firstModel.ws &&
				model.attacks === firstModel.attacks,
		);
	};
	if (areAllModelsTheSame(modelStats)) {
		modelStats = [modelStats[0]];
	}
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
					gap: 4,
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
								minWidth: "33%",
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
							/>
						))}
					</div>
				</div>
				<div
					style={{
						position: "absolute",
						right: 0,
						top: 0,
						height: "100%",
						bottom: 0,
						width: "45%",
					}}
				>
					{hasImage && (
						<img
							src={image}
							alt=""
							style={{ width: "100%", height: "100%", objectFit: "contain" }}
						/>
					)}
					<div className="absolute right-[1px] top-[2px] flex gap-1">
						<label
							className="button print-display-none"
							style={{
								border: "1px solid #999",
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
							{hasImage ? "Change image" : "Upload image "}
						</label>
						{hasImage && (
							<button
								className="button print-display-none"
								style={{
									border: "1px solid #999",
									padding: "1px 4px",
									fontSize: "0.8rem",
									backgroundColor: "#f0f0f0",
								}}
								onClick={() => {
									setImage(undefined);
								}}
							>
								Clear image
							</button>
						)}
					</div>
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
						<OtherAbilities abilities={abilities} />
					</table>
					<div style={{ flex: "1" }}></div>
					<table
						cellSpacing="0"
						className="weapons-table"
						style={{ width: "100%" }}
					>
						<tbody>
							{modelsWithDifferentProfiles.length > 0 &&
								!weaponDescriptions.length && (
									<tr className="emptyRow noBorderTop">
										<td
											style={{
												borderTop: "none",
												verticalAlign: "middle",
											}}
										>
											<div className="flex justify-center">{Arrow}</div>
										</td>
										<td
											colSpan={7}
											style={{
												textAlign: "left",
												fontSize: ".8em",
												paddingLeft: 0,
												verticalAlign: "middle",
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
				<div className=" relative max-w-[400px] flex-1 p-1 pb-[50px] print:p-[20px] sm:p-2 sm:pb-[50px] sm:print:p-[20px] sm:print:pb-[50px] md:p-[20px] md:pb-[50px] md:print:p-[20px] md:print:pb-[50px]">
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
					<FactionIcon catalog={catalog} />
				</div>
			</div>
		</div>
	);
};

const ModelStats = ({ modelStat, index, showName, modelList }) => {
	let { move, toughness, save, wounds, leadership, name, oc, bs, ws, attacks } =
		modelStat;
	if (!wounds) {
		wounds = "/";
	}

	const showWeapons = index === 0;
	return (
		<div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap" }}>
			<Characteristic title="M" characteristic={move} index={index} />
			<Characteristic title="T" characteristic={toughness} index={index} />
			<Characteristic title="SV" characteristic={save} index={index} />
			<Characteristic title="W" characteristic={wounds} index={index} />
			<Characteristic title="LD" characteristic={leadership} index={index} />
			<Characteristic title="OC" characteristic={oc} index={index} />
			<div style={{ display: "flex", alignItems: "center" }}>
				{showName && (
					<div
						style={{
							marginTop: index === 0 ? 16 : 0,
							whiteSpace: "nowrap",
						}}
					>
						{name}
					</div>
				)}
				{showWeapons && (
					<div
						style={{
							marginTop: 16,
							fontSize: "0.7em",
							paddingLeft: showName ? 8 : 0,
						}}
					>
						{modelList.map((model, index) => (
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
	const joinedKeywords = [...keywords].join(", ");
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
				width: "calc(100% - 0.9rem)",
				backgroundSize: "contain",
				minHeight: 54,
				gap: 3,
			}}
		>
			<span style={{ fontSize: "1.1em" }}>KEYWORDS:</span>
			<span
				style={{
					fontSize: joinedKeywords.length > 80 ? ".8em" : "1em",
					fontWeight: 800,
				}}
			>
				{joinedKeywords}
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
				width: "calc(100% - 0.9rem)",
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
				display: "flex",
				flexWrap: "wrap",
			}}
		>
			<span style={{ fontSize: ".8em" }}>RULES: </span>
			{[...rules.keys()].map((rule, index) => (
				<span
					key={rule}
					style={{ whiteSpace: "nowrap", fontSize: ".8em", fontWeight: 700 }}
				>
					{rule}
					{index < rules.size - 1 ? ", " : ""}
				</span>
			))}
		</div>
	);
};

const Abilities = ({ abilities }) => {
	if (!abilities) return null;
	let keys = [...abilities.keys()];

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
					minWidth: "3rem",
					minHeight: "3rem",
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

const OtherAbilities = ({ abilities }) => {
	let keys = [...Object.keys(abilities)?.filter((key) => key !== "Abilities")];
	return keys.map((key) => {
		return (
			<Fragment key={key}>
				<thead>
					<tr
						style={{
							backgroundColor: "var(--primary-color)",
							color: "#fff",
						}}
					>
						<th></th>
						<th colSpan="7" style={{ textAlign: "left" }}>
							{key}
						</th>
					</tr>
				</thead>
				<tbody>
					{[...abilities[key]].map(([name, value]) => (
						<tr key={name}>
							<td></td>
							<td
								colSpan={7}
								key={name}
								style={{
									fontSize: ".9em",
									lineHeight: 1.4,
									textAlign: "left",
									paddingTop: 4,
									paddingBottom: 4,
								}}
							>
								<span style={{ fontWeight: 700 }}>{name}:</span> {value}
							</td>
						</tr>
					))}
				</tbody>
			</Fragment>
		);
	});
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
					gap: 4,
					paddingBottom: 2,
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
