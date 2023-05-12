import meleeIcon from "./assets/meleeIcon.png";
import rangedIcon from "./assets/rangedIcon.png";
import { Arrow } from "./assets/icons";

export const Weapons = ({ title, weapons, modelStats, forceRules }) => {
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
						key={weapon.name}
						weapon={weapon}
						modelStats={modelStats}
						isMelee={isMelee}
						className={getWeaponClassNames(weapons, index)}
						forceRules={forceRules}
					/>
				))}
				{weapons.length > 0 && (
					<tr className="emptyRow">
						<td style={{ width: 37, borderTop: "none" }}></td>
						<td colSpan={7}></td>
					</tr>
				)}
			</tbody>
		</>
	);
};

const Weapon = ({ weapon, modelStats, isMelee, className, forceRules }) => {
	let { name, selectionName, range, type, str, ap, damage, abilities } = weapon;
	var lastWhiteSpace = type.lastIndexOf(" ");
	const attacks = type.substring(lastWhiteSpace + 1);
	type = type.substring(0, lastWhiteSpace);

	let bs = modelStats.map((modelStat) => modelStat.bs);
	let ws = modelStats.map((modelStat) => modelStat.ws);
	const strModel = modelStats[0].str;
	let meleeAttacks = modelStats.map((modelStat) => modelStat.attacks);

	if (name === "Krak grenades") {
		name = "Krak grenade";
	}
	const differentProfiles =
		selectionName &&
		selectionName !== name &&
		!name.includes("(Shooting)") &&
		!name.includes("(Melee)");

	if (differentProfiles && name.endsWith(" grenades")) {
		name = name.replace(" grenades", "");
	}
	if (differentProfiles && name.endsWith(" grenade")) {
		name = name.replace(" grenade", "");
	}
	if (name.startsWith("Missile launcher, ")) {
		name = name.replace("Missile launcher, ", "");
	}
	if (differentProfiles && name.includes(" - ")) {
		name = name.split(" - ")[1];
	}

	const replaceAbilityWithType = (
		occurences,
		typeName,
		ruleTextForForceRules
	) => {
		if (!abilities) return;
		if (occurences.some((occurence) => abilities.includes(occurence))) {
			for (let i = 0; i < occurences.length; i++) {
				abilities = abilities.replaceAll(occurences[i], "");
			}
			if (type) {
				type += `, ${typeName}`;
			} else {
				type = typeName;
			}

			if (ruleTextForForceRules) {
				forceRules.set(typeName, ruleTextForForceRules);
			}
		}

		return abilities;
	};

	replaceAbilityWithType(["Blast.", "Blast"], "Blast");
	replaceAbilityWithType(
		[
			"Each time an attack is made with this weapon, that attack automatically hits the target.",
			"This weapon automatically hits its target.",
			"When resolving an attack made with this weapon, do not make a hit roll: it automatically scores a hit.",
		],
		"Torrent",
		"When resolving an attack made with this weapon, do not make a hit roll: it automatically scores a hit."
	);
	replaceAbilityWithType(
		["This weapon can target units that are not visible to the bearer."],
		"Indirect Fire",
		"This weapon can target units that are not visible to the bearer."
	);
	replaceAbilityWithType(["Plague Weapon.", "Plague Weapon"], "Plague Weapon");
	replaceAbilityWithType(["Sonic Weapon.", "Sonic Weapon"], "Sonic Weapon");
	replaceAbilityWithType(
		["Turret Weapon.", "Turret weapon.", "Turret Weapon", "Turret weapon"],
		"Turret Weapon"
	);
	replaceAbilityWithType(
		[
			"Each time an attack made with this weapon targets an enemy within half range, that attack has a Damage characteristic of D6+2.",
			"Each time an attack made with this weapon targets a unit within half range, that attack has a Damage characteristic of D6+2.",
			"Each time an attack made with this weapon targets a unit within half range, that attack has a Damage characteristic of D6+2",
		],
		"Melta 2",
		"Each time an attack made with this weapon targets a unit within half range, that attack attack has a Damage characteristic of D6+2."
	);
	replaceAbilityWithType(
		[
			"Each time an attack made with this weapon targets an enemy within half range, that attack has a Damage characteristic of D6+4.",
			"Each time an attack made with this weapon targets a unit within half range, that attack has a Damage characteristic of D6+4.",
		],
		"Melta 4",
		"Each time an attack made with this weapon targets a unit within half range, that attack attack has a Damage characteristic of D6+4."
	);
	replaceAbilityWithType(
		[
			"Each time an attack is made with this weapon profile, an unmodified hit roll of 6 automatically wounds the target.",
			"Each unmodified hit roll of 6 made for this weapon's attacks automatically hits and results in a wound (do not make a wound roll for that attack).",
		],
		"Lethal Hits",
		"Each time an attack is made with this weapon profile, an unmodified hit roll of 6 automatically wounds the target."
	);

	if (
		abilities?.includes(
			"Each time an attack is made with this weapon, subtract 1 from that attack’s hit roll."
		) ||
		abilities?.includes(
			"Each time an attack is made with this weapon, subtract 1 from that attack's hit roll."
		) ||
		abilities?.includes(
			"Each time an attack is made with this weapon profile, subtract 1 from that attack's hit roll."
		) ||
		abilities?.includes(
			"Each time an attack is made with this weapon, you must subtract 1 from the hit roll."
		) ||
		abilities?.includes(
			"When attacking with this weapon, you must subtract 1 from the hit rolls."
		)
	) {
		abilities = abilities
			.replaceAll(
				"Each time an attack is made with this weapon, subtract 1 from that attack’s hit roll.",
				""
			)
			.replaceAll(
				"Each time an attack is made with this weapon, subtract 1 from that attack's hit roll.",
				""
			)
			.replaceAll(
				"Each time an attack is made with this weapon profile, subtract 1 from that attack's hit roll.",
				""
			)
			.replaceAll(
				"Each time an attack is made with this weapon, you must subtract 1 from the hit roll.",
				""
			)
			.replaceAll(
				"When attacking with this weapon, you must subtract 1 from the hit rolls.",
				""
			);
		ws = ws.map((ws) => `${parseInt(ws, 10) + 1}+`);
	}

	if (
		abilities?.includes(
			"Each time an attack is made with this weapon profile, make 2 hit rolls instead of 1."
		) ||
		abilities?.includes(
			"Each time an attack is made with this weapon, make 2 attack rolls instead of 1."
		) ||
		abilities?.includes(
			"Each time an attack is made with this weapon, make 2 hit rolls instead of 1."
		) ||
		abilities?.includes(
			"Each time an attack is made wit this weapon profile, make 2 hit rolls instead of 1."
		)
	) {
		abilities = abilities
			.replaceAll(
				"Each time an attack is made with this weapon profile, make 2 hit rolls instead of 1.",
				""
			)
			.replaceAll(
				"Each time an attack is made with this weapon, make 2 attack rolls instead of 1.",
				""
			)
			.replaceAll(
				"Each time an attack is made with this weapon, make 2 hit rolls instead of 1.",
				""
			)
			.replaceAll(
				"Each time an attack is made wit this weapon profile, make 2 hit rolls instead of 1.",
				""
			);

		meleeAttacks = meleeAttacks.map((meleeAttack) => meleeAttack * 2);
	}
	if (
		abilities?.includes(
			"Each time an attack is made with this weapon profile, make 3 hit rolls instead of 1."
		) ||
		abilities?.includes(
			"Each time an attack is made with this weapon, make 3 hit rolls instead of 1."
		)
	) {
		abilities = abilities
			.replaceAll(
				"Each time an attack is made with this weapon profile, make 3 hit rolls instead of 1.",
				""
			)
			.replaceAll(
				"Each time an attack is made with this weapon, make 3 hit rolls instead of 1.",
				""
			);

		meleeAttacks = meleeAttacks.map((meleeAttack) => meleeAttack * 3);
	}
	if (meleeAttacks.every((meleeAttack) => meleeAttack === meleeAttacks[0])) {
		meleeAttacks = meleeAttacks[0];
	}
	if (bs.every((b) => b === bs[0])) {
		bs = bs[0];
	}
	if (ws.every((w) => w === ws[0])) {
		ws = ws[0];
	}

	name = name.replaceAll(" (Shooting)", "").replaceAll(" (Melee)", "");

	return (
		<>
			<tr className={className}>
				<td style={{ borderTop: "none", backgroundColor: "#dfe0e2" }}>
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
						{differentProfiles && selectionName + " - "}
						{differentProfiles
							? name.replaceAll(selectionName, "").replaceAll(", ", "")
							: name}
						{type && (
							<span
								style={{
									fontSize: ".8em",
									fontWeight: 700,
									color: "var(--primary-color)",
									textTransform: "uppercase",
								}}
							>
								[{type}]
							</span>
						)}
					</div>
				</td>
				<td>{range}</td>
				<td>
					{isMelee
						? meleeAttacks.join
							? meleeAttacks.join("|")
							: meleeAttacks
						: attacks}
				</td>
				<td>
					{isMelee
						? ws.join
							? ws.join("|")
							: ws
						: bs.join
						? bs.join("|")
						: bs}
				</td>
				<td>{calculateWeaponStrength(strModel, str)}</td>
				<td>{ap}</td>
				<td>{damage}</td>
			</tr>
			{abilities && abilities !== "-" && (
				<tr className={className + " noBorderTop"}>
					<td style={{ backgroundColor: "#dfe0e2" }}></td>
					<td
						colSpan="7"
						style={{
							textAlign: "left",
							fontSize: "0.9em",
							paddingTop: 0,
							paddingBottom: 1,
							lineHeight: 1.4,
						}}
					>
						{abilities}
					</td>
				</tr>
			)}
		</>
	);
};

const getWeaponClassNames = (weapons, index) => {
	let differentColor = false;
	for (let i = 1; i <= index; i++) {
		let { selectionName } = weapons[i];
		if (selectionName !== weapons[i - 1].selectionName) {
			differentColor = !differentColor;
		}
	}
	const classes = [];
	if (differentColor) classes.push("rowOtherColor");
	if (index === 0) classes.push("noBorderTop");
	if (
		index > 0 &&
		weapons[index].selectionName === weapons[index - 1].selectionName
	)
		classes.push("noBorderTop");
	return classes.join(" ");
};

const calculateWeaponStrength = (strModel, strWeapon) => {
	if (strWeapon.includes("User")) return strModel;
	if (strWeapon.startsWith("x")) {
		return strModel * parseInt(strWeapon.replace("x", ""));
	}
	if (strWeapon.includes("+")) {
		return strModel + parseInt(strWeapon, 10);
	}
	if (!strWeapon) return strModel;
	return parseInt(strWeapon, 10);
};
