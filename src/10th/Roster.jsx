import { useRef, useState, useEffect, Fragment } from "react";
import factionBackground from "../assets/factionBackground.png";
import keywordsBackground from "../assets/keywordsBackground.png";
import cardBackground from "../assets/cardBackground.png";
import dgBackground from "../assets/dgBackground.png";
import { Arrow, wavyLine } from "../assets/icons";
import { Weapons, hasDifferentProfiles } from "./Weapons";
import { useIndexedDB } from "../helpers/useIndexedDB"; // New hook for IndexedDB
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
	const [image, setImage] = useIndexedDB("image" + name); // Use IndexedDB hook
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
					backgroundImage:
						catalog === "Chaos - Death Guard"
							? `url(${dgBackground})`
							: `url(${factionBackground})`,
					backgroundSize: "cover",
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
					background: `url(${cardBackground})`,
					backgroundSize: "cover",
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
	const abilities = [...(abilitiesMap?.keys?.() || [])];
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
		switch (abilitiesMap.get(ability)?.trim()?.toLowerCase().replace(".", "")) {
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

			case "this model has a 2+ invulnerable save":
			case "this model has an invulnerable save of 2+":
			case "this unit has a 2+ invulnerable save":
			case "models in this unit have a 2+ invulnerable save":
			case "models in this unit have an invulnerable save of 2+":
			case "models in this units have an invulnerable save of 2+":
				return "2+";
			case "this model has a 3+ invulnerable save":
			case "this model has an invulnerable save of 3+":
			case "this unit has a 3+ invulnerable save":
			case "models in this unit have a 3+ invulnerable save":
			case "models in this unit have an invulnerable save of 3+":
			case "models in this units have an invulnerable save of 3+":
				return "3+";
			case "this model has a 4+ invulnerable save":
			case "this model has an invulnerable save of 4+":
			case "this unit has a 4+ invulnerable save":
			case "models in this unit have a 4+ invulnerable save":
			case "models in this unit have an invulnerable save of 4+":
			case "models in this units have an invulnerable save of 4+":
				return "4+";
			case "this model has a 5+ invulnerable save":
			case "this model has an invulnerable save of 5+":
			case "this unit has a 5+ invulnerable save":
			case "models in this unit have a 5+ invulnerable save":
			case "models in this unit have an invulnerable save of 5+":
			case "models in this units have an invulnerable save of 5+":
				return "5+";
			case "this model has a 6+ invulnerable save":
			case "this model has an invulnerable save of 6+":
			case "this unit has a 6+ invulnerable save":
			case "models in this unit have a 6+ invulnerable save":
			case "models in this unit have an invulnerable save of 6+":
			case "models in this units have an invulnerable save of 6+":
				return "6+";

			case "models in this unit have a 2+ invulnerable save against ranged weapons":
			case "models in this unit have a 2+ invulnerable save against ranged attacks":
			case "this model has a 2+ invulnerable save against ranged weapons":
			case "this model has a 2+ invulnerable save against ranged attacks":
				return "2+*";
			case "models in this unit have a 3+ invulnerable save against ranged weapons":
			case "models in this unit have a 3+ invulnerable save against ranged attacks":
			case "this model has a 3+ invulnerable save against ranged attacks":
			case "this model has a 3+ invulnerable save against ranged weapons":
				return "3+*";
			case "models in this unit have a 4+ invulnerable save against ranged weapons":
			case "models in this unit have a 4+ invulnerable save against ranged attacks":
			case "this model has a 4+ invulnerable save against ranged attacks":
			case "this model has a 4+ invulnerable save against ranged weapons":
				return "4+*";
			case "models in this unit have a 5+ invulnerable save against ranged weapons":
			case "models in this unit have a 5+ invulnerable save against ranged attacks":
			case "this model has a 5+ invulnerable save against ranged attacks":
			case "this model has a 5+ invulnerable save against ranged weapons":
				return "5+*";
			case "models in this unit have a 6+ invulnerable save against ranged weapons":
			case "models in this unit have a 6+ invulnerable save against ranged attacks":
			case "this model has a 6+ invulnerable save against ranged attacks":
			case "this model has a 6+ invulnerable save against ranged weapons":
				return "6+*";

			case "this model has a 2+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model":
				return "2+*";
			case "this model has a 3+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model":
				return "3+*";
			case "this model has a 4+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model":
				return "4+*";
			case "this model has a 5+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model":
				return "5+*";
			case "this model has a 6+ invulnerable save. you cannot re-roll invulnerable saving throws made for this model":
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
				// tailwind selector to give all svgs inside fill property of var(--primary-color), and the svg should have width 60px and height 60px
				className="flex items-center justify-center fill-[var(--primary-color)]"
				style={{
					background: `url(${keywordsBackground})`,
					backgroundSize: "contain",
					backgroundPosition: "center",
					minHeight: "75px",
					minWidth: "76px",
					transform: "rotate(45deg)",
				}}
			>
				{factionIcons[catalog] ||
					(catalog.includes("Imperium") ? factionIcons["Imperium"] || "" : "")}
			</div>
		</div>
	);
};

const factionIcons = {
	Imperium: (
		<svg viewBox="0 0 1170.3264 800.00003">
			<g transform="matrix(1.2185834,0,0,1.2185834,-0.09141707,0)">
				<path d="m 123.6,225.4 c 55,8.1 94.4,4.3 139.7,-1.3 35.8,-4.4 77.3,-5.3 85.7,9.7 5.2,9.3 10.8,13.2 9.7,24.7 -0.9,9.7 1,13.3 -1.7,20.3 -2.2,5.9 -3,1.5 -4.7,7.7 -1.9,7.1 -2.5,9.1 4.3,21.7 8,14.7 21.8,31.5 28.9,37.9 1.6,1.4 4,-0.2 3.3,-2.2 -4.8,-13.9 -17.4,-51.9 -9.2,-86.1 4.5,-18.5 21.7,-20.7 24.7,-43.7 3,-22.8 -64,-23.7 -76.3,-23.7 -12.3,0 -82.7,10.3 -141.7,11.6 -59,1.3 -92,-3.3 -182.3,-23.3 -13.6,-3 11.1,33.3 29,36.3 21.9,3.7 54.3,5 90.6,10.4 z" />
				<path d="m 244.3,260.1 c 11.3,-1.7 22.8,-3.7 34.5,-6 19.4,-3.7 38,-7.8 55.6,-12.2 1.2,-0.3 2,-1.6 1.7,-2.8 -0.5,-1.8 -1.5,-4 -3.2,-6 -4.3,-5 -11.6,-7 -19,-5.3 -11.1,1.2 -22.6,2.3 -34.3,3.2 -26.3,1.9 -51.3,2.7 -75,2.5 0.6,3.7 2.2,9.9 6.9,15.5 11.6,13.8 31.2,11.3 32.8,11.1 z" />
				<path d="m 250.9,295.4 c 11.6,-3.3 23.5,-6.8 35.6,-10.7 22.6,-7.3 44,-15 64.1,-22.9 0.4,-0.9 1.9,-4.7 0.3,-9.1 -1.3,-3.8 -4.1,-5.7 -5,-6.3 -15.5,4.3 -32.4,8.3 -50.7,11.7 -25.1,4.6 -51,7.1 -72,8.3 -0.8,2.7 0.9,8.1 3,13.9 3.5,8.9 13.3,14.9 24.7,15.1 z" />
				<path d="m 270.4,323.9 c 6.9,-1.4 10.6,-2.5 18.4,-5 23.3,-7.6 39.5,-19 52.8,-28.8 1,-2.9 4.2,-7.5 3,-13.1 -0.3,-1.3 -0.6,-2.5 -1,-3.6 -18.6,8.2 -39.2,16.2 -62,23.3 -11.5,3.6 -22.6,6.7 -33.3,9.3 -0.1,1.1 -0.7,7.6 4,13 5.5,6.4 17.3,5 18.1,4.9 z" />
				<path d="m 278.8,355.7 c 4,1.9 9.9,0.7 12.1,0.4 6.4,-3.4 11,-6.2 17.7,-10.3 15.5,-9.5 29.1,-19.4 41,-29 0.3,-0.9 1.5,-4.9 -0.7,-9.3 -2,-4 -5.4,-5.6 -6.3,-6 -11,6.9 -23.8,14 -38.3,20.7 -12.7,5.8 -26.7,9.4 -37.7,13 -0.4,8.6 5.6,17.3 12.2,20.5 z" />
				<path d="m 308.4,383.9 c 5,1.1 9.3,0.4 12,-0.3 8.7,-7.2 18,-15.4 27.5,-25.8 6.7,-7.3 10.6,-14.5 15.7,-21.3 -0.4,-1.9 0.2,-8.5 -5.7,-12.3 -1.5,-1 -3,-1.6 -4.3,-2 -6.9,7 -15.2,14.5 -25,22 -12.9,9.8 -25.3,17.1 -36.2,22.6 -1.6,0.8 -2.1,2.8 -1.2,4.3 2.5,3.9 8,10.7 17.2,12.8 z" />
				<path d="m 327.6,392.3 c 2.9,1.4 7.5,3.1 10.7,3.8 4.4,0.9 9.2,2.3 10.3,1.8 2.4,-1.6 5.2,-7.5 7.7,-9.5 14.1,-11.6 19.8,-24.6 23.7,-35.1 -0.6,-1.3 -1.7,-3.1 -3.3,-4.9 -3.1,-3.2 -6.5,-4.4 -8.3,-4.9 -6.4,10.4 -13.2,18.1 -23.4,29.6 -4,4.5 -12.6,11.2 -17.8,15.7 -1.2,1 -1,2.8 0.4,3.5 z" />
				<path d="m 368.6,407.7 c 5,0.3 8.4,-2.8 9,-3.3 0.8,-6.4 2.6,-14.7 6.7,-23.7 2.1,-4.7 4.4,-8.7 6.7,-12 0,-0.3 0.4,-3.6 -2,-5.7 -1.2,-1 -2.6,-1.3 -3.2,-1.3 -2.1,3.3 -3.2,7.6 -5.4,11 -6.8,10.3 -14.7,19 -21.7,28 1.8,4 5.6,6.7 9.9,7 z" />
				<path d="m 70.4,258.7 c 34.8,-1 49.8,-3.2 92.2,-10.2 7.3,-1.2 18.5,-1.5 32.2,-2 1.5,-0.1 2.6,-1.3 2.5,-2.8 -0.2,-1.5 -0.7,-3.3 -2.2,-4.9 -2.4,-2.7 -5.6,-3 -6.2,-3 C 141.5,231.9 94,228 46.6,224.1 c -4.3,-0.1 -12.7,0.5 -21.1,5.7 -2.3,1.5 -4.3,3 -5.9,4.6 -0.9,0.8 -1,2.2 -0.4,3.2 1.8,3 4.3,6.5 7.6,10 5.3,5.5 10.7,8.9 14.7,10.9 6.3,0.2 16.4,0.6 28.9,0.2 z" />
				<path d="m 169.7,271.2 c 13.1,-4.1 25.6,-8.3 37.8,-12.8 0,-0.7 -0.1,-2.1 -1,-3.5 -1.4,-2.3 -3.7,-2.9 -4.3,-3 -38.5,7.7 -81.3,12.8 -127.7,13.2 -8.7,0.1 -17.3,0 -25.8,-0.2 -2,1.2 -8.1,5.2 -8.7,11.2 -0.9,8.2 8.2,18.5 23.5,20.5 33,-5.5 68.6,-13.7 106.2,-25.4 z" />
				<path d="m 215.4,282 c 0.6,-0.7 3.2,-4 2.8,-8.8 -0.1,-1.3 -0.4,-2.4 -0.8,-3.3 -0.8,-1.9 -2.9,-2.7 -4.8,-2.1 -21.6,6.6 -34.6,12.9 -63.9,19.9 -28.4,6.8 -54.6,12.1 -78.2,15.2 -0.8,0.6 -12.3,6.2 -11.5,15.2 0.9,9.6 15.3,20.7 31.3,18.2 34.3,-14.6 68.7,-29.5 103.2,-44.8 7.3,-3 14.6,-6.3 21.9,-9.5 z" />
				<path d="m 217.9,311.5 c 3.8,-2.4 7,-4.6 9.8,-6.5 2.5,-1.7 3.2,-5.2 1.5,-7.7 -0.8,-1.2 -1.8,-2.4 -3,-3.6 -2.1,-2 -4.3,-3.3 -6.1,-4.1 -1.8,-0.8 -3.9,-0.6 -5.5,0.6 -10.8,7.7 -20.2,10 -26.9,13.3 -27,13.4 -41.8,15 -73.4,31.2 -8.1,4.1 -14.7,7.9 -19.4,10.7 -1.4,0.9 -2.4,2.3 -2.7,4 -0.5,3.2 0.3,5.2 0.6,6 2.5,5.8 11.3,9.1 21.3,6.6 0.4,-0.1 0.7,-0.3 1.1,-0.4 25.2,-9.2 36.4,-16.3 49.5,-22 14,-6.2 34,-15.9 53.2,-28.1 z" />
				<path d="m 230.9,342.2 c 6.9,-3 15.5,-6.1 17.2,-13.1 1,-4.3 -0.3,-10.5 -4.5,-14.9 -2,-2 -4.1,-3.1 -5.5,-3.8 -2.5,1.1 -6.6,2.9 -11.5,5.2 -29.1,13.8 -40.5,22.9 -65.5,35.2 -6,2.9 -15,7.2 -26.5,11.8 -2.5,2.5 -5.6,6.2 -8.2,11.2 -3.3,6.2 -4.7,11.9 -5.2,15.8 2.5,1.5 6.3,3.4 11.2,4.5 7.4,1.6 13.6,0.6 17,-0.2 26.9,-15.9 27.1,-16.1 27.1,-16.1 47.6,-28.5 37.1,-28 54.4,-35.6 z" />
				<path d="m 240.9,378.5 c 9.2,-8.3 16.6,-13.5 22.7,-17.7 1.2,-0.8 1.7,-2.3 1.2,-3.6 -0.9,-2.7 -1.2,-6.7 -2.9,-9.9 -1.7,-3.1 -3.5,-5.8 -5.2,-7.9 -1.1,-1.4 -3.1,-1.6 -4.4,-0.5 -3.5,2.9 -8.3,6.7 -14.1,10.9 -23.4,17.3 -36,22.5 -57.8,37.8 -6.3,4.4 -15.2,11 -25.7,19.8 -1.2,1 -1.5,2.8 -0.6,4.1 2.1,3.2 5.7,7.4 11.3,10.4 8.9,4.7 17.8,3.3 21.2,2.8 20.4,-3.6 27.5,-22 54.3,-46.2 z" />
				<path d="m 282.2,375.2 c 0.8,-2.9 0.1,-5.9 -2,-8 -2.9,-3 -6.9,-2.3 -7.2,-2.2 -3.2,3.6 -8.5,9.2 -15.5,15.5 -15.2,13.7 -24.2,17.8 -38.5,29.8 -5.3,4.4 -13.6,10.3 -22.1,19.5 -1.3,1.5 -1.3,3.7 0.1,5.2 1.9,2 4.7,4.4 8,5.8 5.9,2.6 11.3,1.9 13.3,1.5 6.9,-4.6 14.3,-10 21.7,-16.5 19.7,-17.3 33.2,-35.6 42.2,-50.6 z" />
				<path d="m 298.4,405 c 2.3,-2.9 4.9,-6 6.8,-8.1 0.9,-1 0.6,-2.5 -0.5,-3.2 -1.5,-0.8 -3.3,-1.6 -5.3,-2.3 -4.4,-1.5 -8.3,-1.8 -11,-1.8 -10.5,8 -21.7,17.3 -33,28.2 -6.8,6.6 -13.1,13.2 -18.8,19.5 1.8,2.3 6.1,7 13.2,9.8 5.3,2 10,2.1 12.8,2 6.4,-4.5 10.9,-9 13.6,-12.1 9.5,-10.3 6.3,-11.6 22.2,-32 z" />
				<path d="m 327.2,401.6 c -5.1,-2.8 -9.9,-2.6 -12.1,-2.4 -5.9,7.6 -11.8,15.7 -17.8,24.5 -8.3,12.3 -15.5,24.2 -21.8,35.5 2.5,0.9 5.6,1.8 9.3,2.1 7.6,0.8 13.8,-0.8 17.5,-2.1 2.5,-3.3 5,-6.8 7.5,-10.5 9.9,-14.7 17.4,-29.2 23,-42.5 -1,-1.3 -2.9,-3.1 -5.6,-4.6 z" />
				<path d="m 336.7,469.7 c 3.4,-5.2 6.8,-8.4 10.2,-14.5 6.6,-11.7 12.2,-23.1 16.9,-33.8 0.5,-1.2 0.3,-2.6 -0.6,-3.6 -1.7,-2 -4.4,-4.5 -8.1,-6.5 -3.2,-1.7 -6.2,-2.6 -8.6,-3.1 -1.6,-0.3 -3.3,0.6 -3.9,2.2 -2.6,6.9 -5.1,12.4 -7.1,16.1 -7.3,14.3 -13.2,20.3 -19.8,35.5 -1.4,3.3 -2.5,6.2 -3.3,8.5 -0.6,1.7 0.2,3.5 1.8,4.2 0,0 0,0 0,0 8.2,3.6 16.8,-1.7 21,-3.9 0.7,-0.2 1.2,-0.6 1.5,-1.1 z" />
				<path d="m 378.2,419.5 c -1.5,1.9 -3.7,4.7 -6.2,8.2 -3.3,4.7 -13.2,19.1 -25,51 -2.8,7.5 -8.1,19.2 -11.4,30.9 -0.6,2.2 1.3,4.3 3.5,3.8 2.6,-0.6 5.4,-0.6 7.2,-2.2 38.5,-35.3 45.4,-63.1 46.8,-71.2 -0.1,-2.2 -0.8,-8 -5.2,-13.5 -3.6,-4.2 -7.7,-6.2 -9.7,-7 z" />
				<path d="m 956.5,184.5 c -90.3,20 -123.3,24.6 -182.3,23.3 -59,-1.3 -129.3,-11.6 -141.7,-11.6 -12.3,0 -79.3,0.9 -76.3,23.7 3,23 20.2,25.2 24.7,43.7 8.2,34.2 -4.4,72.2 -9.2,86.1 -0.7,2 1.7,3.6 3.3,2.2 7.1,-6.5 20.9,-23.2 28.9,-37.9 6.8,-12.6 5,-14.3 4.3,-21.7 -0.7,-7.3 -2.8,-4.8 -4.7,-7.7 -4.1,-6.3 -0.7,-10.6 -1.7,-20.3 -1.1,-11.4 4.5,-15.4 9.7,-24.7 8.3,-15 49.9,-14.1 85.7,-9.7 45.3,5.6 84.7,9.5 139.7,1.3 36.3,-5.4 68.7,-6.7 90.7,-10.3 17.9,-3.1 42.6,-39.4 28.9,-36.4 z" />
				<path d="m 681.7,259.9 c 11.8,2.2 23.3,4.2 34.5,6 1.6,0.2 21.2,2.7 32.8,-11.2 4.7,-5.7 6.3,-11.8 6.9,-15.5 -23.7,0.2 -48.7,-0.6 -75,-2.5 -11.7,-0.9 -23.2,-1.9 -34.3,-3.2 -7.4,-1.6 -14.7,0.3 -19,5.3 -1.7,2 -2.7,4.2 -3.2,6 -0.3,1.2 0.4,2.5 1.7,2.8 17.6,4.5 36.2,8.6 55.6,12.3 z" />
				<path d="m 609.5,258.5 c -1.5,4.4 0,8.2 0.3,9.1 20.1,7.9 41.5,15.7 64.1,22.9 12.1,3.9 24,7.4 35.6,10.7 11.5,-0.2 21.2,-6.2 24.6,-15.1 2.2,-5.8 3.8,-11.2 3,-13.9 -21,-1.2 -46.9,-3.7 -72,-8.3 -18.3,-3.3 -35.2,-7.4 -50.7,-11.7 -0.8,0.6 -3.5,2.5 -4.9,6.3 z" />
				<path d="m 708.2,324.8 c 4.7,-5.4 4.1,-11.9 4,-13 -10.7,-2.7 -21.9,-5.7 -33.3,-9.3 -22.8,-7.1 -43.4,-15.1 -62,-23.3 -0.4,1.1 -0.8,2.3 -1,3.6 -1.1,5.6 2,10.1 3,13.1 13.3,9.9 29.6,21.2 52.8,28.8 7.8,2.6 11.4,3.6 18.4,5 0.8,0.1 12.6,1.5 18.1,-4.9 z" />
				<path d="m 617.9,307.2 c -0.9,0.4 -4.4,2 -6.3,6 -2.1,4.4 -0.9,8.5 -0.7,9.3 11.9,9.6 25.5,19.5 41,29 6.7,4.1 11.3,6.9 17.7,10.3 2.2,0.3 8.1,1.6 12.1,-0.4 6.6,-3.2 12.6,-11.9 12.2,-20.6 -11,-3.6 -25,-7.2 -37.7,-13 -14.6,-6.7 -27.3,-13.8 -38.3,-20.6 z" />
				<path d="m 602.5,329.8 c -5.8,3.8 -5.3,10.4 -5.7,12.3 5.1,6.8 8.9,14 15.7,21.3 9.5,10.4 18.8,18.6 27.5,25.8 2.7,0.7 7,1.5 12,0.3 9.2,-2.1 14.7,-8.8 17.2,-12.9 0.9,-1.5 0.4,-3.5 -1.2,-4.3 -10.9,-5.5 -23.3,-12.8 -36.2,-22.6 -9.8,-7.5 -18.1,-15 -25,-22 -1.2,0.5 -2.7,1.1 -4.3,2.1 z" />
				<path d="m 583.9,354.2 c -1.7,1.7 -2.7,3.5 -3.3,4.9 3.9,10.5 9.6,23.5 23.7,35.1 2.5,2 5.2,8 7.7,9.5 1.2,0.5 6,-0.9 10.3,-1.8 3.2,-0.7 7.8,-2.4 10.7,-3.8 1.4,-0.7 1.6,-2.5 0.5,-3.5 -5.2,-4.5 -13.8,-11.2 -17.8,-15.7 -10.1,-11.5 -16.9,-19.2 -23.4,-29.6 -1.9,0.4 -5.4,1.7 -8.4,4.9 z" />
				<path d="m 574.8,367.5 c -0.6,0.1 -2,0.3 -3.2,1.3 -2.4,2.1 -2,5.4 -2,5.7 2.2,3.3 4.6,7.3 6.7,12 4.1,9 5.9,17.3 6.7,23.7 0.6,0.5 4,3.7 9,3.3 4.3,-0.3 8.1,-3 10,-7 -6.9,-9 -14.8,-17.7 -21.7,-28 -2.3,-3.4 -3.5,-7.7 -5.5,-11 z" />
				<path d="m 934.9,235.5 c -8.3,-5.2 -16.8,-5.7 -21.1,-5.7 -47.4,3.9 -94.9,7.8 -142.3,11.7 -0.6,0 -3.8,0.3 -6.2,3 -1.5,1.6 -2,3.5 -2.2,4.9 -0.2,1.5 1,2.7 2.5,2.8 13.7,0.5 24.8,0.8 32.2,2 42.5,7 57.4,9.2 92.2,10.2 12.5,0.4 22.7,0 28.8,-0.3 3.9,-2 9.4,-5.4 14.7,-10.9 3.4,-3.5 5.8,-7 7.6,-10 0.6,-1 0.5,-2.4 -0.4,-3.2 -1.5,-1.4 -3.4,-3 -5.8,-4.5 z" />
				<path d="m 911.8,270.8 c -8.4,0.2 -17,0.3 -25.8,0.2 -46.5,-0.4 -89.3,-5.6 -127.7,-13.2 -0.5,0.1 -2.8,0.7 -4.3,3 -0.9,1.4 -1,2.8 -1,3.5 12.1,4.4 24.7,8.7 37.8,12.8 37.6,11.7 73.2,19.8 106.2,25.5 15.3,-2 24.4,-12.3 23.5,-20.5 -0.6,-6.2 -6.7,-10.1 -8.7,-11.3 z" />
				<path d="m 890,308.8 c -23.7,-3.2 -49.9,-8.5 -78.2,-15.2 -29.2,-7 -42.2,-13.4 -63.9,-19.9 -2,-0.6 -4,0.2 -4.8,2.1 -0.4,0.9 -0.7,2.1 -0.8,3.3 -0.4,4.7 2.2,8.1 2.8,8.8 7.3,3.3 14.7,6.5 22,9.8 34.6,15.3 69,30.2 103.2,44.8 16,2.4 30.4,-8.6 31.2,-18.2 0.9,-9.4 -10.7,-15 -11.5,-15.5 z" />
				<path d="m 865.6,351.1 c -4.6,-2.8 -11.3,-6.5 -19.4,-10.7 -31.7,-16.2 -46.4,-17.8 -73.4,-31.2 -6.7,-3.3 -16.1,-5.6 -26.9,-13.3 -1.6,-1.1 -3.7,-1.4 -5.5,-0.6 -1.8,0.8 -4,2.1 -6.1,4.1 -1.2,1.2 -2.2,2.4 -3,3.6 -1.7,2.5 -1,6 1.5,7.7 2.7,1.9 6,4.1 9.8,6.5 19.3,12.2 39.3,21.9 53.2,28 13,5.7 24.2,12.8 49.5,22 0.4,0.1 0.7,0.3 1.1,0.4 10,2.6 18.7,-0.8 21.3,-6.6 0.3,-0.8 1.1,-2.9 0.6,-6 -0.3,-1.6 -1.3,-3 -2.7,-3.9 z" />
				<path d="m 825.8,368.5 c -11.5,-4.6 -20.5,-8.8 -26.5,-11.8 -25,-12.3 -36.4,-21.5 -65.5,-35.2 -4.9,-2.3 -9,-4.1 -11.5,-5.2 -1.4,0.6 -3.5,1.7 -5.5,3.8 -4.2,4.3 -5.5,10.6 -4.5,14.9 1.7,7 10.4,10.2 17.2,13.1 17.4,7.5 6.9,7 54.4,35.7 0,0 0.3,0.2 27.1,16.1 3.4,0.8 9.6,1.9 17,0.2 4.9,-1.1 8.7,-3 11.2,-4.5 -0.6,-3.9 -1.9,-9.6 -5.2,-15.8 -2.6,-5.1 -5.7,-8.8 -8.2,-11.3 z" />
				<path d="m 780,393.3 c -21.7,-15.2 -34.4,-20.5 -57.8,-37.8 -5.8,-4.3 -10.6,-8.1 -14.1,-10.9 -1.4,-1.1 -3.4,-0.9 -4.4,0.5 -1.7,2.2 -3.5,4.8 -5.2,7.9 -1.8,3.2 -2,7.3 -2.9,9.9 -0.5,1.3 0,2.8 1.2,3.6 6.1,4.2 13.5,9.4 22.7,17.7 26.8,24.3 33.9,42.6 54.2,46 3.5,0.6 12.3,1.9 21.2,-2.8 5.6,-2.9 9.2,-7.2 11.3,-10.4 0.9,-1.3 0.6,-3.1 -0.6,-4.1 -10.3,-8.7 -19.3,-15.3 -25.6,-19.6 z" />
				<path d="m 741.5,416 c -14.3,-12 -23.3,-16.1 -38.5,-29.8 -7,-6.3 -12.3,-11.9 -15.5,-15.5 -0.3,-0.1 -4.3,-0.7 -7.2,2.2 -2.1,2.1 -2.8,5.1 -2,8 9,15 22.5,33.3 42.2,50.5 7.4,6.5 14.8,11.9 21.7,16.5 2,0.4 7.4,1.1 13.3,-1.5 3.3,-1.4 6.1,-3.8 8,-5.8 1.4,-1.4 1.4,-3.7 0.1,-5.2 -8.5,-9.1 -16.8,-15 -22.1,-19.4 z" />
				<path d="m 705,423.8 c -11.3,-10.9 -22.5,-20.3 -33,-28.2 -2.7,0 -6.6,0.3 -11,1.8 -2,0.7 -3.8,1.5 -5.3,2.3 -1.2,0.6 -1.4,2.2 -0.5,3.2 1.9,2 4.5,5.1 6.8,8.1 15.9,20.4 12.8,21.7 22.1,32.1 2.8,3.1 7.2,7.6 13.6,12.1 2.8,0.1 7.5,0 12.8,-2 7.1,-2.7 11.4,-7.4 13.2,-9.8 -5.6,-6.5 -11.8,-13 -18.7,-19.6 z" />
				<path d="m 645.3,405 c -2.1,-0.2 -7,-0.3 -12.1,2.4 -2.7,1.5 -4.5,3.2 -5.7,4.6 5.6,13.3 13.1,27.8 23,42.5 2.5,3.7 5,7.2 7.5,10.5 3.7,1.3 9.9,2.9 17.5,2.1 3.7,-0.4 6.8,-1.2 9.3,-2.1 -6.2,-11.3 -13.4,-23.2 -21.8,-35.5 -5.9,-8.8 -11.8,-16.9 -17.7,-24.5 z" />
				<path d="M 644.5,467.8 C 638,452.6 632,446.6 624.7,432.3 c -1.9,-3.8 -4.5,-9.2 -7.1,-16.1 -0.6,-1.6 -2.2,-2.5 -3.9,-2.2 -2.4,0.5 -5.4,1.3 -8.6,3.1 -3.7,2 -6.4,4.6 -8.1,6.5 -0.9,1 -1.1,2.4 -0.6,3.6 4.8,10.8 10.3,22.1 16.9,33.8 3.4,6 6.8,9.3 10.2,14.5 0.3,0.5 0.8,0.9 1.3,1.2 4.1,2.1 12.8,7.5 21,3.9 0,0 0,0 0,0 1.6,-0.7 2.4,-2.6 1.8,-4.2 -0.6,-2.5 -1.7,-5.4 -3.1,-8.6 z" />
				<path d="m 613.5,484.5 c -11.8,-31.9 -21.7,-46.3 -25,-51 -2.5,-3.5 -4.7,-6.4 -6.2,-8.2 -2.1,0.8 -6.1,2.8 -9.5,7 -4.4,5.5 -5.1,11.3 -5.2,13.5 1.4,8.1 8.2,36 46.8,71.2 1.7,1.6 4.6,1.6 7.2,2.2 2.2,0.5 4.1,-1.6 3.5,-3.8 -3.4,-11.7 -8.8,-23.4 -11.6,-30.9 z" />
				<path d="m 415.8,148.5 c 0,1.5 1.2,2.7 2.7,2.8 l 26.3,2.8 1.7,16.1 c 0.3,3.1 1.5,7.6 3.5,12.3 1.5,3.5 5.3,10.5 5.3,10.5 l -0.1,8.9 c 7.7,-1.7 14.6,-2.4 19.8,-2.7 0,0 1.7,-0.1 4.8,-0.1 0,0 0,0 0.1,0 0,0 0,0 0.1,0 3,0 4.8,0.1 4.8,0.1 5,0.3 11.7,0.9 19.1,2.5 l -0.1,-8.5 c 0,0 3.8,-7 5.3,-10.5 2,-4.8 3.2,-9.2 3.5,-12.3 l 1.7,-16.1 26.3,-2.8 c 1.5,-0.1 2.7,-1.3 2.7,-2.8 V 138 c 0,-1 -0.8,-1.8 -1.8,-1.8 -14.6,-0.4 -30.8,-2 -45.7,-2.5 -4.8,-10.5 -4.7,-33.7 -4.4,-24.1 -1,-28.7 0.1,-44.4 3.3,-67.8 l 6,0.1 c 1.2,0 2.3,-1 2.3,-2.2 V 16.6 c 0,-1.2 -0.9,-2.1 -2,-2.2 -2.5,-0.2 -5,-0.4 -7.5,-0.6 C 493.4,12.6 492.6,7.5 488,3.7 485,1.2 481.8,0.6 480,0.4 V 0 c -1.4,0.1 -5.2,0.5 -8.7,3.4 -4.6,3.7 -5.4,8.9 -5.5,10.1 -2.5,0.2 -5,0.4 -7.5,0.6 -1.1,0.1 -2,1.1 -2,2.2 v 23.1 c 0,1.2 1,2.2 2.3,2.2 l 6,-0.1 c 3.2,23.5 4.3,39.2 3.3,67.8 0.3,-9.6 0.4,13.7 -4.4,24.1 -14.9,0.5 -31,2 -45.7,2.5 -1,0 -1.8,0.8 -1.8,1.8 v 10.8 z" />
				<path d="m 505.1,488.7 h -51.3 l -0.4,76.8 c -0.3,12.1 4.3,40.6 9.8,60.2 4.9,17.2 10.1,20.6 15.8,29.4 v 1.4 c 0.2,-0.2 0.3,-0.5 0.5,-0.7 0.1,0.2 0.2,0.3 0.3,0.5 v -0.9 c 5.8,-8.9 11,-12.2 15.8,-29.4 5.5,-19.6 10.1,-48.1 9.8,-60.2 z" />
				<path d="m 562.2,366 c -5.3,-6.7 20.9,-56.7 7.1,-100.8 -16.2,-51.8 -64.1,-59.9 -84.9,-60.9 0,0 -1.8,-0.1 -4.8,-0.1 0,0 0,0 -0.1,0 0,0 0,0 -0.1,0 -3,0 -4.8,0.1 -4.8,0.1 -20.7,1.1 -68.7,9.1 -84.8,60.9 -13.8,44.2 12.4,94.1 7.1,100.8 -21.3,27 7.7,69.8 11.6,73.3 7.1,6.4 29.8,-6.5 26.2,0.1 -2.7,5.1 -5.2,43.3 -5.2,43.3 h 7 l 3.4,-13.3 6,-0.1 1.2,13.4 h 12.3 l 1.2,-12.8 4.1,-0.6 0.6,13.4 h 9.9 l 0.5,-13.7 h 8.1 l 0.5,13.7 h 9.9 l 0.6,-13.4 4.1,0.6 1.2,12.8 H 512 l 1.2,-13.4 6,0.1 3.4,13.3 h 7 c 0,0 -2.5,-38.2 -5.2,-43.3 -3.6,-6.7 19.1,6.2 26.2,-0.1 3.9,-3.5 32.9,-46.3 11.6,-73.3 z m -95.9,28 c -2.8,3.4 -6.8,7.5 -12.2,10.8 -13.1,8.1 -26,6.9 -31.3,6.1 -0.3,0 -0.7,-0.2 -1,-0.4 -11.4,-7.9 -15.8,-20.3 -12.4,-28 0.5,-1.2 2.4,-5.1 8.4,-7.5 0.3,-0.1 0.7,-0.2 1,-0.2 7.2,0.7 16.2,2.3 26.2,5.7 8.1,2.7 14.9,6.1 20.5,9.3 1.5,0.8 1.9,2.8 0.8,4.2 z m 27.4,46.7 c 0,0.9 -1,1.2 -1.5,0.5 -1.2,-1.7 -2.9,-3.7 -5.2,-5.5 -2.4,-1.9 -4.7,-3.2 -6.6,-3.9 -1.8,0.7 -4.1,1.9 -6.6,3.9 -2.3,1.8 -4,3.8 -5.2,5.5 -0.5,0.7 -1.5,0.3 -1.5,-0.5 -0.4,-6.5 -0.1,-19.9 8.9,-29.6 1.2,-1.3 2.7,-2.4 4.4,-3.4 1.7,1.1 3.3,2.2 4.4,3.4 9,9.7 9.3,23.1 8.9,29.6 z m 43.8,-30.2 c -0.3,0.2 -0.6,0.3 -1,0.4 -5.2,0.8 -18.2,1.9 -31.3,-6.1 -5.4,-3.3 -9.4,-7.4 -12.2,-10.8 -1,-1.3 -0.7,-3.3 0.7,-4.1 5.6,-3.2 12.5,-6.5 20.5,-9.3 10,-3.4 19,-5 26.2,-5.7 0.3,0 0.7,0 1,0.2 6,2.4 7.9,6.3 8.4,7.5 3.5,7.6 -0.9,20 -12.3,27.9 z" />
			</g>
		</svg>
	),
	"Imperium - Adeptus Mechanicus": (
		<svg viewBox="0 0 736.5801 799.99998" width="44px" height="44px">
			<g transform="matrix(0.88583767,0,0,0.88583767,0.00608206,0)">
				<path d="m 380.2,0 c -2.7,0 -5.5,0 -8.2,0.1 v 77.1 l -45,4.5 v 65.2 c -22.3,3.5 -43.7,9.4 -64.1,17.5 l -34.4,-55.2 c -11,3 -25.7,8.2 -41.5,17.5 -16.4,9.7 -28.4,20.5 -36.5,29 0,0 22.6,35.9 34.1,53.7 -17.9,14.2 -34.3,30.3 -48.7,48 L 77,226.6 c -8.1,8.7 -17.7,20.8 -26.5,36.5 -9.2,16.5 -14.4,31.7 -17.5,43.5 18.3,11 36.6,22.1 55,33.1 -7.8,20 -13.5,40.9 -17,62.7 l -68.5,5.7 c -1.4,12.1 -2.4,25.5 -2.5,40 -0.1,17.1 0.9,32.7 2.5,46.5 22.6,1.1 45.3,2.2 67.9,3.3 3.5,23.5 9.7,46.1 18.2,67.6 L 33,594.7 c 2.5,10.4 6.7,23.5 14,37.5 10.2,19.7 22.6,33.8 32,43 l 54.6,-31.7 c 14.3,18 30.5,34.4 48.3,48.8 l -33,55.4 c 9.6,7.5 20.6,15.3 33,23 16.4,10.1 32,17.9 46,24 11,-18.7 22.1,-37.4 33.1,-56 21.1,8.4 43.3,14.6 66.4,18.3 v 60.8 c 9.7,4.1 24.2,8.4 41,6 1.2,-0.2 2.4,-0.4 3.5,-0.6 V 903 c 2.7,0 5.4,0.1 8.2,0.1 C 629.4,903.1 831.5,701 831.5,451.7 831.5,202.4 629.5,0 380.2,0 Z m 331.5,605.9 c -10.5,22.6 -23.3,44 -38,63.8 L 615,639.6 c -8.6,4.9 -17.9,14.7 -28.5,24 -11.6,10.2 -21.3,17.4 -27.5,26 4.1,7.5 8.2,15.1 12.3,22.7 6.8,12.6 14.9,27.8 20.2,38 -21.1,15 -43.8,27.8 -67.9,38.1 L 490,734.6 c -12.4,2.5 -25.5,6.5 -39,10 -12.7,3.3 -24.7,5.9 -36,9.5 0,20.6 0,41.2 0,61.8 -11.6,1.1 -23.3,1.7 -35.2,1.7 -1.3,0 -2.5,0 -3.8,0 0,-41.7 0,-83.3 0,-125 l -8,2.1 v -22.6 h -7.6 l -0.9,24.2 h -19.1 l -1.1,-23.6 -7.9,1.1 -2.2,22.5 h -23.6 l -2.2,-23.6 -11.6,0.1 -6.5,23.4 h -13.5 c 0,0 4.8,-67.3 10,-76.2 6.9,-11.7 -36.7,11 -50.4,-0.2 -7.6,-6.2 -63.4,-81.5 -22.3,-128.9 10.2,-11.8 -40.2,-99.6 -13.6,-177.4 31.2,-91.1 123.4,-105.3 163.3,-107.2 0,0 3.3,-0.2 9.2,-0.2 0,0 0,0 0.1,0 v 359.1 c 0.6,-0.3 1.2,-0.7 1.8,-1 3.3,1.9 6.3,3.8 8.5,6 17.3,17.1 17.8,40.7 17.1,52.1 -0.1,1.6 -2,2.2 -3,1 -2.4,-3 -5.6,-6.5 -10,-9.7 -4.7,-3.4 -9.1,-5.6 -12.6,-6.8 -0.6,0.2 -1.2,0.5 -1.8,0.7 v 64.6 h 7.9 l 0.9,24.2 H 396 l 1.1,-23.6 7.9,1.1 2.2,22.5 h 23.6 l 2.2,-23.6 11.6,0.1 6.5,23.4 h 13.5 c 0,0 -4.8,-67.3 -10,-76.2 -6.9,-11.7 36.7,10.9 50.4,-0.2 7.6,-6.2 63.4,-81.5 22.3,-128.9 C 517.1,479 567.4,391.2 540.9,313.5 509.7,222.4 417.5,208.2 377.6,206.3 V 86 c 0.8,0 1.6,0 2.4,0 10.2,0 20.3,0.4 30.3,1.2 l 4.9,59.4 c 9.2,3.9 20.5,5.7 32,9 16.2,4.7 30.1,9.4 43,11 12,-16.7 24,-33.5 36.1,-50.2 21.3,9.3 41.6,20.6 60.5,33.6 L 559,208.6 c 7.1,9.4 17,18.9 28,29.5 9.8,9.4 18.3,18.2 27,24.5 20.7,-8.4 41.4,-16.9 62.2,-25.3 14.2,19.6 26.5,40.6 36.6,62.8 L 655,334.6 c 2.1,11.6 6,24.4 10,38 4.6,15.4 8.8,29.1 14,41 21.6,0 43.1,0 64.7,0 1.3,12.6 2,25.3 2,38.2 0,13.1 -0.7,26.1 -2,38.8 H 680 c -5.4,9.1 -9.2,21.8 -14,36 -5.7,17 -10.1,31.2 -11,43 18.9,12.1 37.8,24.2 56.7,36.3 z m -316.2,-73 c 10.8,-5.6 24,-11.5 39.5,-16.3 19.2,-6 36.5,-8.8 50.4,-10 0.7,-0.1 1.3,0 2,0.3 11.5,4.2 15.2,11.1 16.2,13.1 6.5,13.6 -1.9,35.4 -24,49.3 -0.6,0.4 -1.2,0.6 -1.9,0.7 -10.1,1.4 -34.9,3.4 -60.2,-10.8 -10.5,-5.9 -18.2,-13 -23.5,-19 -1.9,-2.4 -1.3,-5.9 1.5,-7.3 z" />
				<path d="m 344.2,622.4 c 0.1,1.6 2,2.2 3,1 2.4,-3 5.6,-6.5 10,-9.7 3.9,-2.8 7.7,-4.8 10.8,-6.1 v -42.2 c -2.6,1.5 -4.9,3.2 -6.7,5 -17.3,17 -17.8,40.5 -17.1,52 z" />
				<path d="m 341.5,532.9 c -10.8,-5.6 -24,-11.5 -39.5,-16.3 -19.1,-6 -36.4,-8.8 -50.4,-10 -0.7,0 -1.3,0.1 -2,0.3 -11.6,4.2 -15.3,11.1 -16.2,13.1 -6.5,13.6 1.9,35.3 23.9,49.3 0.5,0.4 1.2,0.6 1.9,0.7 10.1,1.4 35,3.4 60.2,-10.8 10.5,-5.9 18.2,-13 23.5,-19 1.8,-2.4 1.3,-5.9 -1.4,-7.3 z" />
			</g>
		</svg>
	),
	"Chaos - Death Guard": (
		<svg
			viewBox="0 0 833.07203 800.00001"
			width="44px"
			height="44px"
			className="mt-1"
		>
			<g transform="scale(0.85901428)">
				<path d="m 749.9,395.1 101.7,-57.5 20.6,65.9 97.6,-261.9 -223,0.8 24.6,50.8 -63.6,46 c 0,-1.4 0.1,-2.9 0.1,-4.3 C 707.9,105.2 602.8,0 473,0 356.7,0 260.2,84.5 241.5,195.5 L 188.9,155.1 227,121 0,81.3 77,406.7 103.1,321 l 100,85.7 0.4,0.3 C 106.8,422.8 33,506.8 33,608 c 0,112.5 91.2,203.7 203.7,203.7 75.2,0 140.9,-40.8 176.2,-101.5 l 5.4,89.4 -33.3,-6.3 103.8,138 106.4,-148.4 -33.3,11.9 c 0,0 1.8,-58.7 3.8,-77.7 36.9,49.4 95.8,81.4 162.2,81.4 111.7,0 202.3,-90.6 202.3,-202.3 0,-104.3 -78.9,-190.1 -180.3,-201.1 z m -513.3,344 c -72.4,0 -131.1,-58.7 -131.1,-131.1 0,-72.4 58.7,-131.1 131.1,-131.1 72.4,0 131.2,58.6 131.2,131 0,72.4 -58.7,131.2 -131.2,131.2 z M 471.5,393.9 c -90,0 -162.9,-72.9 -162.9,-162.9 0,-90 72.9,-162.9 162.9,-162.9 90,0 162.9,72.9 162.9,162.9 0,90 -72.9,162.9 -162.9,162.9 z M 727.8,737.1 C 650,737.1 586.9,674 586.9,596.2 c 0,-77.8 63.2,-140.9 141,-140.9 77.8,0 140.8,63.1 140.8,140.9 0,77.8 -63.1,140.9 -140.9,140.9 z" />
				<path d="m 318.7,542.6 c -14.8,-43.3 -58.7,-50.1 -77.7,-51 0,0 -1.6,-0.1 -4.4,-0.1 0,0 0,0 -0.1,0 0,0 0,0 -0.1,0 -2.8,0 -4.4,0.1 -4.4,0.1 -18.9,0.9 -62.8,7.7 -77.6,51 -12.7,37 11.3,78.7 6.5,84.3 -19.5,22.6 7,58.4 10.6,61.3 6.5,5.3 27.3,-5.5 24,0.1 -2.5,4.2 -4.8,36.2 -4.8,36.2 h 6.4 l 3.1,-11.1 5.5,-0.1 1.1,11.2 H 218 l 1.1,-10.7 3.7,-0.5 0.5,11.2 h 9.1 L 233,713 h 7.4 l 0.4,11.5 h 9.1 l 0.5,-11.2 3.7,0.5 1.1,10.7 h 11.2 l 1.1,-11.2 5.5,0.1 3.1,11.1 h 6.4 c 0,0 -2.3,-32 -4.8,-36.2 -3.3,-5.6 17.5,5.2 24,-0.1 3.6,-3 30.1,-38.7 10.6,-61.3 -4.9,-5.7 19.1,-47.4 6.4,-84.3 z m -94.1,107.6 c -2.5,2.9 -6.2,6.2 -11.2,9 -12,6.7 -23.8,5.8 -28.6,5.1 -0.3,0 -0.6,-0.1 -0.9,-0.3 -10.5,-6.6 -14.5,-17 -11.4,-23.4 0.5,-1 2.2,-4.2 7.7,-6.2 0.3,-0.1 0.6,-0.1 1,-0.1 6.6,0.6 14.8,1.9 23.9,4.8 7.4,2.3 13.6,5.1 18.8,7.8 1.3,0.5 1.6,2.2 0.7,3.3 z m 25,39.1 c 0,0.7 -1,1 -1.4,0.5 -1.1,-1.4 -2.7,-3.1 -4.8,-4.6 -2.2,-1.6 -4.3,-2.6 -6,-3.2 -1.6,0.6 -3.8,1.6 -6,3.2 -2.1,1.5 -3.6,3.2 -4.8,4.6 -0.5,0.6 -1.4,0.3 -1.4,-0.5 -0.4,-5.5 -0.1,-16.6 8.1,-24.8 1.1,-1.1 2.4,-2 4.1,-2.9 1.6,0.9 3,1.8 4.1,2.9 8.2,8.2 8.5,19.4 8.1,24.8 z m 40.1,-25.2 c -0.3,0.2 -0.6,0.3 -0.9,0.3 -4.8,0.7 -16.6,1.6 -28.6,-5.1 -5,-2.8 -8.6,-6.2 -11.2,-9 -1,-1.1 -0.7,-2.8 0.6,-3.5 5.1,-2.7 11.4,-5.5 18.8,-7.8 9.1,-2.9 17.4,-4.2 23.9,-4.8 0.3,0 0.6,0 1,0.1 5.5,2 7.2,5.3 7.7,6.2 3.1,6.6 -0.8,17 -11.3,23.6 z" />
				<path d="m 812.3,528.9 c -15.3,-44.6 -60.4,-51.5 -79.9,-52.4 0,0 -1.7,-0.1 -4.5,-0.1 0,0 0,0 -0.1,0 0,0 0,0 -0.1,0 -2.9,0 -4.5,0.1 -4.5,0.1 -19.5,0.9 -64.6,7.9 -79.9,52.4 -13,38 11.6,81 6.6,86.8 -20.1,23.2 7.2,60.1 10.9,63.1 6.7,5.5 28.1,-5.6 24.7,0.1 -2.5,4.4 -4.9,37.3 -4.9,37.3 h 6.6 l 3.2,-11.5 5.7,-0.1 1.1,11.5 h 11.5 l 1.1,-11 3.8,-0.5 0.5,11.5 h 9.4 l 0.4,-11.8 h 7.6 l 0.4,11.8 h 9.4 l 0.5,-11.5 3.8,0.5 1.1,11 h 11.5 l 1.1,-11.5 5.7,0.1 3.2,11.5 h 6.6 c 0,0 -2.4,-32.9 -4.9,-37.3 -3.4,-5.7 18,5.3 24.7,-0.1 3.7,-3 31,-39.8 10.9,-63.1 -4.9,-5.9 19.8,-48.8 6.8,-86.8 z m -96.9,110.8 c -2.6,2.9 -6.4,6.4 -11.5,9.3 -12.3,6.9 -24.5,6 -29.4,5.3 -0.3,0 -0.7,-0.1 -0.9,-0.3 -10.8,-6.8 -14.9,-17.5 -11.7,-24.1 0.5,-1 2.3,-4.4 7.9,-6.4 0.3,-0.1 0.7,-0.1 1,-0.1 6.8,0.6 15.3,2 24.6,4.9 7.6,2.4 14,5.2 19.3,8 1.4,0.5 1.7,2.2 0.7,3.4 z m 25.7,40.2 c 0,0.8 -1,1.1 -1.5,0.5 -1.2,-1.5 -2.8,-3.2 -4.9,-4.8 -2.3,-1.7 -4.5,-2.7 -6.2,-3.3 -1.7,0.6 -3.9,1.7 -6.2,3.3 -2.1,1.6 -3.7,3.3 -4.9,4.8 -0.5,0.6 -1.4,0.3 -1.5,-0.5 -0.4,-5.6 -0.1,-17.1 8.3,-25.5 1.1,-1.1 2.5,-2 4.2,-2.9 1.6,0.9 3.1,1.9 4.2,2.9 8.7,8.4 8.9,19.9 8.5,25.5 z m 41.3,-26 c -0.3,0.2 -0.6,0.3 -0.9,0.3 -4.9,0.7 -17.1,1.7 -29.4,-5.3 -5.1,-2.9 -8.9,-6.4 -11.5,-9.3 -1,-1.1 -0.7,-2.9 0.7,-3.6 5.3,-2.8 11.8,-5.6 19.3,-8 9.4,-2.9 17.9,-4.3 24.6,-4.9 0.3,0 0.7,0 1,0.1 5.6,2.1 7.4,5.4 7.9,6.4 3.1,6.8 -1,17.5 -11.7,24.3 z" />
				<path d="M 578.6,140.6 C 559.2,84.1 502,75.3 477.3,74.1 c 0,0 -2.1,-0.1 -5.7,-0.1 0,0 0,0 -0.1,0 0,0 0,0 -0.1,0 -3.6,0 -5.7,0.1 -5.7,0.1 -24.7,1.2 -81.9,10 -101.3,66.5 -16.5,48.2 14.8,102.7 8.4,110 -25.4,29.4 9.2,76.1 13.8,80 8.5,6.9 35.6,-7.1 31.3,0.1 -3.2,5.5 -6.2,47.3 -6.2,47.3 h 8.4 l 4,-14.5 7.2,-0.1 1.4,14.6 h 14.6 l 1.4,-13.9 4.9,-0.7 0.7,14.6 h 11.9 l 0.6,-15 h 9.6 l 0.6,15 h 11.9 l 0.7,-14.6 4.9,0.7 1.4,13.9 h 14.6 l 1.4,-14.6 7.2,0.1 4,14.5 h 8.4 c 0,0 -3,-41.7 -6.2,-47.3 -4.3,-7.3 22.8,6.8 31.3,-0.1 4.7,-3.9 39.3,-50.5 13.8,-80 -6.6,-7.3 24.7,-61.8 8.2,-110 z M 455.8,281.1 c -3.3,3.7 -8.1,8.1 -14.6,11.8 -15.6,8.8 -31.1,7.5 -37.3,6.7 -0.4,0 -0.8,-0.2 -1.2,-0.4 -13.7,-8.7 -18.9,-22.1 -14.8,-30.6 0.6,-1.3 2.9,-5.5 10.1,-8.1 0.4,-0.1 0.8,-0.2 1.2,-0.2 8.7,0.8 19.4,2.5 31.2,6.2 9.6,3 17.8,6.6 24.5,10.1 1.7,0.9 2.1,3.1 0.9,4.5 z m 32.6,51 c 0,1 -1.2,1.3 -1.8,0.6 -1.5,-1.9 -3.5,-4 -6.2,-6 -2.9,-2.1 -5.7,-3.5 -7.8,-4.2 -2.1,0.8 -4.9,2.1 -7.8,4.2 -2.7,2 -4.7,4.1 -6.2,6 -0.6,0.7 -1.8,0.4 -1.8,-0.6 -0.5,-7.1 -0.1,-21.7 10.6,-32.3 1.4,-1.4 3.2,-2.6 5.3,-3.7 2.1,1.2 3.9,2.3 5.3,3.7 10.6,10.6 10.9,25.2 10.4,32.3 z m 52.3,-33 c -0.4,0.2 -0.7,0.4 -1.2,0.4 -6.3,0.9 -21.7,2.1 -37.3,-6.7 -6.5,-3.6 -11.3,-8.1 -14.6,-11.8 -1.2,-1.4 -0.9,-3.6 0.8,-4.5 6.7,-3.5 14.9,-7.1 24.5,-10.1 11.9,-3.7 22.6,-5.4 31.2,-6.2 0.4,0 0.8,0 1.2,0.2 7.1,2.6 9.4,6.9 10.1,8.1 4.2,8.5 -1,22 -14.7,30.6 z" />
			</g>
		</svg>
	),
	"Xenos - Tyranids": (
		<svg viewBox="0 0 750.48218 800" width="44px" height="44px">
			<path d="m 610.82899,689.05494 c -7.59855,-11.27818 -3.14337,-28.83487 10.60991,-40.26156 13.86054,-11.51745 32.1185,-12.60649 41.75487,-2.82161 14.29781,-16.40989 26.31028,-35.27012 36.41692,-56.4817 -2.31009,0.0578 -4.60368,-0.25576 -6.83127,-1.00653 -13.73678,-4.62018 -19.73476,-23.62892 -13.39852,-42.45615 6.33625,-18.82724 22.60588,-30.33643 36.34267,-25.71625 2.76385,0.93228 5.2142,2.45034 7.30978,4.43042 6.56726,-24.19819 11.73196,-50.44246 15.82411,-78.64206 -6.91376,4.14166 -14.65256,5.69272 -22.14386,3.79515 -18.0187,-4.57893 -27.78708,-27.36631 -21.81384,-50.89623 5.97323,-23.52991 25.42748,-38.89201 43.45444,-34.32133 3.25887,0.82503 6.23724,2.25234 8.91034,4.16641 1.2623,-15.92312 2.31834,-32.32476 3.21763,-49.20491 -0.71778,-21.21983 -2.84636,-41.31761 -6.23725,-60.30985 -4.28191,7.49955 -10.75841,13.25827 -18.94273,15.98912 -20.32054,6.79002 -43.45444,-7.64804 -51.67176,-32.24225 -8.20907,-24.5942 1.60881,-50.02994 21.92935,-56.81996 9.59513,-3.20112 19.80902,-1.67481 28.78537,3.41564 -27.86133,-68.50242 -62.59518,-105.950624 -120.9827,-136.955334 22.55638,14.83408 19.18199,28.73587 8.72059,46.86183 -10.98118,19.016984 -40.12131,22.737884 -65.09503,8.316324 -24.97372,-14.421564 -36.31791,-41.523874 -25.34499,-60.532604 9.36412,-16.22013 26.99505,-22.9524 48.9244,-15.15584 C 513.10394,5.3673655 451.74631,-3.4357245 385.01771,1.1597055 c 14.58657,5.74222 25.13873,16.0056205 28.00984,29.3051405 5.56897,25.7575 -19.72651,53.07431 -56.48994,61.02762 -36.76343,7.94506 -71.08477,-6.48475 -76.65373,-32.24225 -3.38263,-15.65086 4.63668,-31.86274 19.69351,-43.97421 C 164.37939,50.917386 42.769662,148.22993 8.687588,295.74566 c 31.499724,5.42871 45.616022,13.03551 45.616022,13.03551 17.20192,17.72168 49.88144,34.66784 87.87417,49.79893 -6.73227,-8.64634 -10.75842,-19.52026 -10.75842,-31.33472 0,-28.19134 22.85339,-51.04473 51.04473,-51.04473 28.19135,0 51.04474,22.85339 51.04474,51.04473 0,24.38795 -17.10292,44.76624 -39.97281,49.82369 26.54128,8.71234 53.47033,16.45939 77.98203,22.94414 -38.00922,-78.19654 35.8394,-128.16048 124.90161,-123.81256 0.91578,0.18151 1.83157,0.38776 2.74735,0.58577 l -10.3459,38.5125 -65.16928,10.85742 v 111.8661 l 38.00923,-76.02671 69.50895,9.77663 41.73012,-66.76159 c 26.21952,15.24659 48.45413,35.20412 61.75365,58.72578 l -58.95679,54.74088 -56.47345,-22.80389 -77.10749,76.02671 84.71429,-23.89293 53.21457,23.89293 75.03666,-38.50425 c 3.48164,22.93589 3.56414,44.04021 0.50327,63.1067 -7.22728,14.1328 -16.54189,26.14527 -28.84312,35.12987 l -71.67878,5.42871 -23.89293,-43.44619 -80.80364,14.69382 -2.82161,0.51152 60.82136,18.46422 8.68759,52.13378 72.45431,12.83749 c -44.70848,24.56946 -109.4735,29.4289 -188.66833,9.96639 4.34792,41.26811 7.59855,58.65153 16.29439,87.97317 -64.73202,-31.21921 -119.02738,-83.749 -162.91084,-156.39308 -19.33875,30.64994 -29.38764,62.80144 -33.66955,90.14301 L 0,438.02244 c 31.433722,137.02957 92.35409,259.56334 183.54488,347.54476 -3.63014,-36.04566 -8.68758,-72.25631 1.08905,-94.49093 78.69155,76.84349 169.8411,124.5056 289.98227,104.2593 l -44.32898,-70.49073 c 77.33026,2.21108 135.97354,-10.10665 180.54177,-35.7899 z M 182.46409,189.31652 c -19.25625,3.00312 -39.37053,10.58516 -59.73232,22.80389 5.34621,-40.82259 32.64652,-67.45462 72.76783,-85.80334 4.32317,12.64775 -0.66828,34.27184 -13.03551,62.99945 z" />
		</svg>
	),
	"Xenos - Orks": (
		<svg
			viewBox="0 0 980.54596 800"
			width="50px"
			height="50px"
			className="mt-1.5"
		>
			<g transform="matrix(1.0601643,0,0,1.0601643,-40.286243,-157.54041)">
				<path d="m 244.8,481.2 c 9.7,-39.3 16.2,-77 8.3,-107.6 L 175.3,367 c 6,-58.7 38,-133.4 76.1,-211.8 C 165.8,213.4 87.7,271.8 38,330.6 c 17.7,63.7 42.4,128.4 87.7,188.6 73.1,24.2 147.6,39.4 223.4,46.3 -44.4,-27.9 -81.6,-56 -104.3,-84.3 z" />
				<path d="m 759.5,148.6 c 35.3,76.3 66.3,148.6 69.5,195.3 -28.4,14.7 -65.7,23.7 -107.6,29.8 18.3,45.1 28.5,101.1 34.7,162.2 L 901.7,491.2 C 931.5,449.8 955,408.4 962.9,367.1 921.1,301.4 845.7,226.5 759.5,148.6 Z" />
				<path d="M 618.8,395.2 C 600.6,391.9 436.8,281 436.8,281 c -57,28.2 -110,61.3 -158.9,99.3 3.5,35.8 0.4,64.1 -8.3,86 23.2,39.7 107.6,89.4 120.8,97.6 l -9.9,283 61.2,-69.5 28.1,125.8 56.3,-155.5 33.1,124.1 23.2,-107.6 38.1,76.1 5,-268.1 c 13.5,-7.6 40,0.4 67.8,9.9 l 43,-38.1 c -6.6,-64.9 -16.6,-125 -34.7,-173.7 0,0.1 -64.6,28.2 -82.8,24.9 z m -241.6,117.5 -6.6,-64.5 c 36.3,11.7 86.8,11 134,5 0,0 39.7,46.3 39.7,62.9 0,6.6 -48,43 -48,43 -52.1,-29.5 -94.4,-47.9 -119.1,-46.4 z m 182,102.6 c -6.7,-9.6 -21.2,-12.4 -53,0 5.3,-24.2 12.3,-45.8 26.5,-56.3 h 26.5 c -8.6,16 -4.6,36 0,56.3 z m 49.7,-49.7 -49.6,-33.1 13.2,-16.5 102.6,-9.9 c -13.4,16.5 -38.8,43 -66.2,59.5 z" />
			</g>
		</svg>
	),
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
				background: `url(${keywordsBackground})`,
				backgroundSize: "cover",
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
		switch (value?.trim()?.toLowerCase().replace(".", "")) {
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

			case "models in this unit have a 2+ invulnerable save":
			case "models in this unit have a 3+ invulnerable save":
			case "models in this unit have a 4+ invulnerable save":
			case "models in this unit have a 5+ invulnerable save":
			case "models in this unit have a 6+ invulnerable save":
			case "models in this units have an invulnerable save of 2+":
			case "models in this units have an invulnerable save of 3+":
			case "models in this units have an invulnerable save of 4+":
			case "models in this units have an invulnerable save of 5+":
			case "models in this units have an invulnerable save of 6+":
			case "models in this unit have an invulnerable save of 2+":
			case "models in this unit have an invulnerable save of 3+":
			case "models in this unit have an invulnerable save of 4+":
			case "models in this unit have an invulnerable save of 5+":
			case "models in this unit have an invulnerable save of 6+":
			case "this model has a 2+ invulnerable save":
			case "this model has a 3+ invulnerable save":
			case "this model has a 4+ invulnerable save":
			case "this model has a 5+ invulnerable save":
			case "this model has a 6+ invulnerable save":
			case "this model has an invulnerable save of 2+":
			case "this model has an invulnerable save of 3+":
			case "this model has an invulnerable save of 4+":
			case "this model has an invulnerable save of 5+":
			case "this model has an invulnerable save of 6+":
			case "this unit has a 2+ invulnerable save":
			case "this unit has a 3+ invulnerable save":
			case "this unit has a 4+ invulnerable save":
			case "this unit has a 5+ invulnerable save":
			case "this unit has a 6+ invulnerable save":
				break;
			default:
				filteredAbilities.set(key, value);
		}
	}
	return filteredAbilities;
};

const boldKeywords = [
	"infantry",
	"character",
	"monster",
	"vehicle",
	"psyker",
	"titanic",
	"mounted",
	"battleline",

	"warlord",

	"death guard",
	"heretic astartes",
	"adeptus astartes",
	"adeptus mechanicus",
	"adeptus custodes",
	"adeptus sororitas",
	"tyranids",
	"orks",
];

const weaponKeywords = [
	"lethal hits",
	"blast",
	"assault",
	"lance",
	"heavy",
	"torrent",
	"indirect fire",
	"sustained hits 1",
	"sustained hits 2",
	"devastating wounds",
];

const Abilities = ({ abilities }) => {
	if (!abilities) return null;
	const filteredAbilities = removeInvulnsWithoutSpecialRules(abilities);

	let keys = [...filteredAbilities.keys()];

	const replacedAbilities = new Map();
	// in the value of the filtered abilites, make certain keywords bold
	for (let [key, value] of filteredAbilities) {
		let newValue = value;
		for (let keyword of boldKeywords) {
			newValue = newValue.replace(
				new RegExp(`\\b${keyword}\\b`, "gi"),
				`<strong>${keyword.toUpperCase()}</strong>`,
			);
		}

		// weaponKeywords could be with [] or without
		for (let keyword of weaponKeywords) {
			newValue = newValue.replace(
				new RegExp(`\\[${keyword}\\]`, "gi"),
				`<span style="font-weight: 700; color: var(--primary-color); text-transform: uppercase; line-height: 1.05;">[${keyword.toUpperCase()}]</span>`,
			);
			if (keyword !== "assault") {
				newValue = newValue.replace(
					new RegExp(`\\b${keyword}\\b`, "gi"),
					`<span style="font-weight: 700; color: var(--primary-color); text-transform: uppercase; line-height: 1.05;">${keyword.toUpperCase()}</span>`,
				);
			}
		}

		replacedAbilities.set(key, newValue);
	}

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
						<span
							className="whitespace-pre-line"
							dangerouslySetInnerHTML={{
								__html: replacedAbilities.get(ability),
							}}
						></span>
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
					background: `url(${cardBackground})`,
					backgroundSize: "cover",
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
