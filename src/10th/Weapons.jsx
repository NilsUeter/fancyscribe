import meleeIcon from "../assets/meleeIcon.png";
import rangedIcon from "../assets/rangedIcon.png";
import { Arrow } from "../assets/icons";

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
						previousWeapon={weapons[index - 1]}
						nextWeapon={weapons[index + 1]}
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

export const hasDifferentProfiles = (selectionName, name) => {
	return selectionName && selectionName.toLowerCase() !== name.toLowerCase();
};

const Weapon = ({ weapon, previousWeapon, nextWeapon, isMelee, className }) => {
	let {
		name,
		selectionName,
		range,
		type,
		str,
		ap,
		damage,
		abilities,
		bs,
		ws,
		attacks,
	} = weapon;

	if (name === "Krak grenades") {
		name = "Krak grenade";
	}

	const differentProfiles =
		hasDifferentProfiles(selectionName, name) &&
		((previousWeapon &&
			hasDifferentProfiles(previousWeapon.selectionName, previousWeapon.name) &&
			selectionName === previousWeapon.selectionName) ||
			(nextWeapon &&
				hasDifferentProfiles(nextWeapon.selectionName, nextWeapon.name) &&
				selectionName === nextWeapon.selectionName));

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
						{type && type !== "-" && (
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
				<td>{attacks}</td>
				<td>
					{isMelee
						? ws.join
							? ws.join("|")
							: ws
						: bs.join
						? bs.join("|")
						: bs}
				</td>
				<td>{str}</td>
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
		if (!selectionName && !weapons[i - 1].selectionName) {
			if (weapons[i].name !== weapons[i - 1].name) {
				differentColor = !differentColor;
			}
		}
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
