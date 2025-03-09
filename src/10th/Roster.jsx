import { useRef, useState, useEffect, Fragment } from "react";
import factionBackground from "../assets/factionBackground.png";
import adeptusAstartesIcon from "../assets/adeptusAstartesIcon.png";
import { Arrow, wavyLine } from "../assets/icons";
import { Weapons, hasDifferentProfiles } from "./Weapons";
import { useLocalStorage } from "../helpers/useLocalStorage";
import { ImgEditor } from "./ImgEditor";

export const Roster = ({ roster, onePerPage, colorUserChoice }) => {
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
				<Force
					key={index}
					force={force}
					onePerPage={onePerPage}
					colorUserChoice={colorUserChoice}
				/>
			))}
		</div>
	);
};

const Force = ({ force, onePerPage, colorUserChoice }) => {
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
					colorUserChoice={colorUserChoice}
				/>
			))}
			<ForceRules rules={mergedRules} onePerPage={onePerPage} />
		</div>
	);
};

const Unit = ({
	unit,
	index,
	catalog,
	onePerPage,
	forceRules,
	colorUserChoice,
}) => {
	const [hide, setHide] = useState(false);
	const [hideModelCount, setHideModelCount] = useState(false);
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
	const [bgRemoved, setBgRemoved] = useState(false);

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

	const overridePrimary = colorUserChoice
		? ""
		: getOverridePrimary(factions, keywords);

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
	if (modelList.length === 1) {
		modelList[0] = modelList[0]
			.replace(name, "")
			.replace("(", "")
			.replace(")", "");
	}

	const removeWhiteBackground = (imageSrc) => {
		return new Promise((resolve) => {
			const img = new Image();
			img.crossOrigin = "Anonymous";
			img.src = imageSrc;
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const data = imageData.data;

				for (let i = 0; i < data.length; i += 4) {
					if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
						data[i + 3] = 0; // Set alpha to 0
					}
				}

				ctx.putImageData(imageData, 0, 0);
				resolve(canvas.toDataURL());
			};
		});
	};

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
						className="hide-model-selection"
						type="checkbox"
						onChange={(e) => setHideModelCount(e.target.checked)}
					/>
					<span className="print-display-none">Hide model selection</span>
				</label>
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
					<input type="checkbox" onChange={() => setHide(!hide)} />
					<span className="print-display-none">Don't print this card.</span>
				</label>
			</div>
			<div
				className="min-h-[15rem]"
				style={{
					paddingTop: 24,
					paddingBottom: 4,
					background:
						"linear-gradient(90deg, rgba(20,21,25,1) 0%, rgba(48,57,62,1) 45%, rgba(73,74,79,1) 100%)",
					color: "#fff",
					position: "relative",
				}}
			>
				<div
					style={{
						padding: "4px 16px",
						paddingBottom: 0,
						color: "#fff",
						position: "relative",
						marginLeft: "1.3rem",
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
					<div className="relative flex gap-4">
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 6,
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
									abilities={abilities.Abilities}
								/>
							))}
						</div>
						{!hideModelCount && modelStats?.[0] && (
							<div
								className={`pointer-events-none mt-[17px] ${
									modelStats.length > 1 ? "" : "self-center"
								}`}
								style={{
									fontSize: "0.7em",
									zIndex: 101,
								}}
							>
								{modelList.map((model, index) => (
									<div key={model}>{model}</div>
								))}
							</div>
						)}
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
						zIndex: 100,
						overflow: "hidden",
					}}
				>
					{hasImage && <ImgEditor image={image} name={name} />}
					<div className="absolute right-[1px] top-[2px] flex gap-1">
						{hasImage && !bgRemoved && (
							<button
								className="button print-display-none"
								style={{
									border: "1px solid #999",
									padding: "1px 4px",
									fontSize: "0.8rem",
									backgroundColor: "#f0f0f0",
								}}
								onClick={async () => {
									// reset uploadRef
									uploadRef.current.value = "";
									const resultUrl = await removeWhiteBackground(image);
									setImage(resultUrl);
									setBgRemoved(true);
								}}
								title="Very basic background removal. Use a proper online tool for better results."
							>
								Remove white from image
							</button>
						)}
						{!hasImage && (
							<a
								className="button print-display-none"
								style={{
									border: "1px solid #999",
									padding: "1px 4px",
									fontSize: "0.8rem",
									backgroundColor: "#f0f0f0",
								}}
								href={`https://www.google.com/search?udm=2&q=${name}+warhammer+40k+miniature`}
								target="_blank"
							>
								Search for image
							</a>
						)}
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
									posthog?.capture?.("user_uploaded_image", {
										unit_name: name,
									});
									if (e.target.files && e.target.files[0]) {
										let reader = new FileReader();
										reader.onload = function (ev) {
											setImage(ev.target.result);
											setBgRemoved(false);
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
									setBgRemoved(false);
								}}
							>
								Clear image
							</button>
						)}
					</div>
				</div>
			</div>
			<div
				// hide border left and right when width smaller than 600px
				className="border-b-2 border-t-0 border-[var(--primary-color)] sm:border-l-2 sm:border-r-2"
				style={{
					display: "flex",
					backgroundColor: "#DFE0E2",
				}}
			>
				<div
					className="flex-[1.2] pt-5"
					style={{
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
				<div className="relative max-w-[400px] flex-1 p-1 pb-[50px] pt-5 sm:p-2 sm:pb-[50px] sm:pt-5 md:p-[20px] md:pb-[50px] md:pt-5 print:p-[20px] sm:print:p-[20px] sm:print:pb-[50px] md:print:p-[20px] md:print:pb-[50px]">
					<div
						style={{
							fontSize: "1.1em",
							padding: "1px 6px",
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

const checkAbilitiesForInvul = (abilitiesMap, name) => {
	const abilities = [...abilitiesMap.keys()];
	for (let ability of abilities) {
		if (ability.includes(":")) {
			// if : then only match if the name is the same
			if (
				!name
					.trim()
					.toLowerCase()
					.includes(ability.split(":")[1].trim().toLowerCase())
			) {
				continue;
			}
		}
		switch (abilitiesMap.get(ability)?.trim()?.toLowerCase()) {
			case "2+":
				if (ability?.toLowerCase().includes("invulnerable save")) return "2+";
				break;
			case "3+":
				if (ability?.toLowerCase().includes("invulnerable save")) return "3+";
				break;
			case "4+":
				if (ability?.toLowerCase().includes("invulnerable save")) return "4+";
				break;
			case "5+":
				if (ability?.toLowerCase().includes("invulnerable save")) return "5+";
				break;
			case "6+":
				if (ability?.toLowerCase().includes("invulnerable save")) return "6+";
				break;

			case "this model has a 2+ invulnerable save.":
			case "this unit has a 2+ invulnerable save":
			case "this unit has a 2+ invulnerable save.":
				return "2+";
			case "this model has a 3+ invulnerable save.":
			case "this unit has a 3+ invulnerable save":
			case "this unit has a 3+ invulnerable save.":
				return "3+";
			case "this model has a 4+ invulnerable save.":
			case "this unit has a 4+ invulnerable save":
			case "this unit has a 4+ invulnerable save.":
				return "4+";
			case "this model has a 5+ invulnerable save.":
			case "this unit has a 5+ invulnerable save":
			case "this unit has a 5+ invulnerable save.":
				return "5+";
			case "this model has a 6+ invulnerable save.":
			case "this unit has a 6+ invulnerable save":
			case "this unit has a 6+ invulnerable save.":
				return "6+";

			case "models in this unit have a 2+ invulnerable save.":
				return "2+";
			case "models in this unit have a 3+ invulnerable save.":
				return "3+";
			case "models in this unit have a 4+ invulnerable save.":
				return "4+";
			case "models in this unit have a 5+ invulnerable save.":
				return "5+";
			case "models in this unit have a 6+ invulnerable save.":
				return "6+";

			case "models in this unit have a 2+ invulnerable save against ranged weapons.":
			case "models in this unit have a 2+ invulnerable save against ranged attacks.":
			case "this model has a 2+ invulnerable save against ranged weapons.":
			case "this model has a 2+ invulnerable save against ranged attacks.":
				return "2+*";
			case "models in this unit have a 3+ invulnerable save against ranged weapons.":
			case "models in this unit have a 3+ invulnerable save against ranged attacks.":
			case "this model has a 3+ invulnerable save against ranged attacks.":
			case "this model has a 3+ invulnerable save against ranged weapons.":
				return "3+*";
			case "models in this unit have a 4+ invulnerable save against ranged weapons.":
			case "models in this unit have a 4+ invulnerable save against ranged attacks.":
			case "this model has a 4+ invulnerable save against ranged attacks.":
			case "this model has a 4+ invulnerable save against ranged weapons.":
				return "4+*";
			case "models in this unit have a 5+ invulnerable save against ranged weapons.":
			case "models in this unit have a 5+ invulnerable save against ranged attacks.":
			case "this model has a 5+ invulnerable save against ranged attacks.":
			case "this model has a 5+ invulnerable save against ranged weapons.":
				return "5+*";
			case "models in this unit have a 6+ invulnerable save against ranged weapons.":
			case "models in this unit have a 6+ invulnerable save against ranged attacks.":
			case "this model has a 6+ invulnerable save against ranged attacks.":
			case "this model has a 6+ invulnerable save against ranged weapons.":
				return "6+*";

			case "this model has a 2+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model.":
				return "2+*";
			case "this model has a 3+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model.":
				return "3+*";
			case "this model has a 4+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model.":
				return "4+*";
			case "this model has a 5+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model.":
				return "5+*";
			case "this model has a 6+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model.":
				return "6+*";
		}
	}
	return false;
};

const ModelStats = ({ modelStat, index, showName, abilities }) => {
	let { move, toughness, save, wounds, leadership, name, oc, bs, ws, attacks } =
		modelStat;
	if (!wounds) {
		wounds = "/";
	}

	const hasInvul = checkAbilitiesForInvul(abilities, name);
	return (
		<div className="flex flex-col">
			<div style={{ display: "flex", gap: "1.2rem" }}>
				<Characteristic title="M" characteristic={move} index={index} />
				<Characteristic title="T" characteristic={toughness} index={index} />
				<Characteristic title="SV" characteristic={save} index={index} />
				<Characteristic title="W" characteristic={wounds} index={index} />
				<Characteristic title="LD" characteristic={leadership} index={index} />
				<Characteristic title="OC" characteristic={oc} index={index} />
				{showName && (
					<div
						className="flex flex-wrap items-center gap-2"
						style={{
							marginTop: index === 0 ? 16 : 0,
							marginLeft: "-0.2rem",
							textShadow: "0px 0px 5px rgb(0 0 0)",
						}}
					>
						<div style={{ whiteSpace: "nowrap" }}>{name}</div>
					</div>
				)}
			</div>
			<InvulRow hasInvul={hasInvul} />
		</div>
	);
};

const InvulRow = ({ hasInvul }) => {
	if (!hasInvul) return null;

	const isSpecialInvul = hasInvul.includes("*");
	const invulWithoutSpecial = hasInvul.replace("*", "");
	return (
		<div
			className="relative flex gap-6 py-1.5 pb-1"
			style={{
				display: "flex",
				alignItems: "center",
			}}
		>
			<div className="flex" style={{ gap: "1.2rem", left: 0, top: -16 }}>
				<FancyBox className={"invisible"}></FancyBox>
				<FancyBox className={"invisible"}></FancyBox>
				<FancyShield>{invulWithoutSpecial}</FancyShield>
			</div>
			<span
				className="font-semibold uppercase"
				style={{
					marginTop: -2,
					marginLeft: "-6rem",
					paddingLeft: "6.4rem",
					paddingRight: "1.2rem",
					paddingTop: 2,
					paddingBottom: 1,
					backgroundColor: "var(--primary-color)",
				}}
			>
				INVULNERABLE SAVE{isSpecialInvul ? "*" : ""}
			</span>
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
					fontSize: joinedKeywords.length > 70 ? ".8em" : "1em",
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

const removeInvulnsWithoutSpecialRules = (abilities) => {
	const filteredAbilities = new Map();
	for (let [key, value] of abilities) {
		switch (value?.trim()?.toLowerCase()) {
			case "2+":
				if (!key?.toLowerCase().includes("invulnerable save"))
					filteredAbilities.set(key, value);
				break;
			case "3+":
				if (!key?.toLowerCase().includes("invulnerable save"))
					filteredAbilities.set(key, value);
				break;
			case "4+":
				if (!key?.toLowerCase().includes("invulnerable save"))
					filteredAbilities.set(key, value);
				break;
			case "5+":
				if (!key?.toLowerCase().includes("invulnerable save"))
					filteredAbilities.set(key, value);
				break;
			case "6+":
				if (!key?.toLowerCase().includes("invulnerable save"))
					filteredAbilities.set(key, value);
				break;

			case "models in this unit have a 2+ invulnerable save.":
			case "models in this unit have a 3+ invulnerable save.":
			case "models in this unit have a 4+ invulnerable save.":
			case "models in this unit have a 5+ invulnerable save.":
			case "models in this unit have a 6+ invulnerable save.":
			case "this model has a 2+ invulnerable save.":
			case "this model has a 3+ invulnerable save.":
			case "this model has a 4+ invulnerable save.":
			case "this model has a 5+ invulnerable save.":
			case "this model has a 6+ invulnerable save.":
			case "this unit has a 2+ invulnerable save":
			case "this unit has a 3+ invulnerable save":
			case "this unit has a 4+ invulnerable save":
			case "this unit has a 5+ invulnerable save":
			case "this unit has a 6+ invulnerable save":
			case "this unit has a 2+ invulnerable save.":
			case "this unit has a 3+ invulnerable save.":
			case "this unit has a 4+ invulnerable save.":
			case "this unit has a 5+ invulnerable save.":
			case "this unit has a 6+ invulnerable save.":
				break;
			default:
				filteredAbilities.set(key, value);
		}
	}
	return filteredAbilities;
};

const Abilities = ({ abilities }) => {
	if (!abilities) return null;
	const filteredAbilities = removeInvulnsWithoutSpecialRules(abilities);

	let keys = [...filteredAbilities.keys()];

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
			{filteredAbilities &&
				keys.map((ability) => (
					<div
						key={ability}
						style={{
							fontSize: ".8em",
							lineHeight: 1.4,
						}}
					>
						<span style={{ fontWeight: 700 }}>{ability}:</span>{" "}
						{filteredAbilities.get(ability)}
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

const FancyBox = ({ children, className, style }) => {
	return (
		<div
			className={className}
			style={{
				color: "var(--primary-color)",
				padding: 2,
				background: "var(--primary-color)",
				clipPath:
					"polygon(12% 0, 100% 0, 100% 20%, 100% 88%, 88% 100%, 20% 100%, 0 100%, 0 12%)",
				...style,
			}}
		>
			<div
				style={{
					minWidth: "3rem",
					minHeight: "3rem",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#E8EDE7",
					clipPath:
						"polygon(10% 0, 100% 0, 100% 20%, 100% 90%, 90% 100%, 20% 100%, 0 100%, 0 10%)",
					padding: "3px 1px",
					fontSize: "1.6em",
					fontWeight: 800,
				}}
			>
				{children}
			</div>
		</div>
	);
};

const FancyShield = ({ children, className, style }) => {
	return (
		<div
			className={className}
			style={{
				color: "var(--primary-color)",
				background: "var(--primary-color)",
				clipPath:
					"polygon(0% 0%, 100% 0%, 100% 41.42%, 99.13% 49.08%, 96.48% 58.58%, 90.13% 69.72%, 81.6% 79.45%, 72.02% 87.52%, 50% 100%, 28.68% 87.52%, 18.31% 79.45%, 9.46% 69.72%, 3.65% 58.58%, 1.13% 49.08%, 0% 41.42%)",
				...style,
			}}
		>
			<div
				style={{
					margin: 2,
					minWidth: "calc(3rem - 1px)",
					minHeight: "3.6rem",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#E8EDE7",
					clipPath:
						"polygon(0% 0%, 100% 0%, 100% 41.42%, 99.13% 49.08%, 96.48% 58.58%, 90.13% 69.72%, 81.6% 79.45%, 72.02% 87.52%, 50% 100%, 28.68% 87.52%, 18.31% 79.45%, 9.46% 69.72%, 3.65% 58.58%, 1.13% 49.08%, 0% 41.42%)",

					fontSize: "1.6em",
					fontWeight: 800,
				}}
			>
				<div style={{ marginTop: -5 }}>{children}</div>
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
