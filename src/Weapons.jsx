import meleeIcon from "./assets/meleeIcon.png";
import rangedIcon from "./assets/rangedIcon.png";
import { Arrow } from "./assets/icons";

export const Weapons = ({ title, weapons, modelStats }) => {
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

const Weapon = ({ weapon, modelStats, isMelee, className }) => {
	let { name, selectionName, range, type, str, ap, damage, abilities } = weapon;
	var lastWhiteSpace = type.lastIndexOf(" ");
	const attacks = type.substring(lastWhiteSpace + 1);
	type = type.substring(0, lastWhiteSpace);

	const bs = modelStats[0].bs;
	let ws = modelStats[0].ws;
	const strModel = modelStats[0].str;
	let meleeAttacks = modelStats[0].attacks;

	if (name === "Krak grenades") {
		name = "Krak grenade";
	}
	const differentProfiles =
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

	if (abilities?.includes("Blast")) {
		abilities = abilities.replaceAll("Blast.", "").replaceAll("Blast", "");
		type += ", Blast";
	}
	if (abilities?.includes("Plague Weapon")) {
		abilities = abilities
			.replaceAll("Plague Weapon.", "")
			.replaceAll("Plague Weapon", "");
		if (type) {
			type += ", Plague Weapon";
		} else {
			type = "Plague Weapon";
		}
	}
	if (
		abilities?.includes(
			"Each time an attack made with this weapon targets an enemy within half range, that attack has a Damage characteristic of D6+2."
		) ||
		abilities?.includes(
			"Each time an attack made with this weapon targets a unit within half range, that attack has a Damage characteristic of D6+2."
		)
	) {
		abilities = abilities
			.replaceAll(
				"Each time an attack made with this weapon targets an enemy within half range, that attack has a Damage characteristic of D6+2.",
				""
			)
			.replaceAll(
				"Each time an attack made with this weapon targets a unit within half range, that attack has a Damage characteristic of D6+2.",
				""
			);
		if (type) {
			type += ", Melta 2";
		} else {
			type = "Melta 2";
		}
	}

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
		ws = `${parseInt(ws, 10) + 1}+`;
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
			);

		meleeAttacks = meleeAttacks * 2;
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

		meleeAttacks = meleeAttacks * 3;
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
						{name}
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
				<td>{isMelee ? meleeAttacks : attacks}</td>
				<td>{isMelee ? ws : bs}</td>
				<td>{isMelee ? calculateWeaponStrength(strModel, str) : str}</td>
				<td>{ap}</td>
				<td>{damage}</td>
			</tr>
			{abilities && abilities !== "-" && (
				<tr className={className + " " + "noBorderTop"}>
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
	if (strWeapon.startsWith("User")) return strModel;
	if (strWeapon.startsWith("x"))
		return strModel * parseInt(strWeapon.replace("x", ""));
	return strModel + parseInt(strWeapon, 10);
};
