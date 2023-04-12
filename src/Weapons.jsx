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
						className={getWeaponClassNames(weapons, index)}
						index={index}
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

const Weapon = ({ weapon, modelStats, isMelee, className, index }) => {
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

const getWeaponClassNames = (weapons, index) => {
	let differentColor = false;
	for (let i = 1; i <= index; i++) {
		let { _selectionName } = weapons[i];
		if (_selectionName !== weapons[i - 1]._selectionName) {
			differentColor = !differentColor;
		}
	}
	const classes = [];
	if (differentColor) classes.push("rowOtherColor");
	if (index === 0) classes.push("noBorderTop");
	if (
		index > 0 &&
		weapons[index]._selectionName === weapons[index - 1]._selectionName
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
