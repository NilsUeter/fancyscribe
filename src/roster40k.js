export class BaseNotes {
	_name = "";
	_customNotes = "";

	name() {
		return this._name;
	}

	notes() {
		return this._customNotes;
	}

	equal(other) {
		if (other == null) return false;
		// Weapons in 40k have unique names
		return this._name === other._name;
	}
}

/** A `selection` attached to a unit or model. */
export class Upgrade extends BaseNotes {
	_cost = new Costs();
	_count = 1;

	selectionName() {
		return this.name();
	}

	toString() {
		let string = this.selectionName();
		if (this._count > 1) string = `${this._count}x ${string}`;
		if (this._cost.hasValues()) string += ` ${this._cost.toString()}`;
		return string;
	}
}

/** A weapon `profile` that is under a `selection`. */
export class Weapon extends Upgrade {
	_selectionName = "";

	_range = "Melee";
	_type = "Melee";
	str = "user";
	_ap = "";
	_damage = "";

	abilities = "";

	/**
	 * Name of this weapon's `selection`. This is different from name() because
	 * name() is used for sorting and deduping weapon profiles.
	 */
	selectionName() {
		return this._selectionName || this.name();
	}
}

export class WoundTracker extends BaseNotes {
	_name = "";
	_table = new Map();
}

export class Explosion extends BaseNotes {
	_name = "";
	_diceRoll = "";
	_distance = "";
	_mortalWounds = "";
}

export class Psyker extends BaseNotes {
	_cast = "";
	_deny = "";
	_powers = "";
	_other = "";
}

export class PsychicPower extends BaseNotes {
	_name = "";
	_manifest = 0;
	_range = "";
	_details = "";
}

export const UnitRole = {
	NONE: "NONE",

	// 40k
	SCD: "SCD",
	HQ: "HQ",
	TR: "TR",
	EL: "EL",
	FA: "FA",
	HS: "HS",
	FL: "FL",
	DT: "DT",
	FT: "FT",
	LW: "LW",
	AGENTS: "AGENTS",
	NF: "NF",
};

export const UnitRoleToString = [
	"None",

	// 40k
	"Supreme Command Detachment",
	"HQ",
	"Troops",
	"Elites",
	"Fast Attack",
	"Heavy Support",
	"Flyer",
	"Dedicated Transport",
	"Fortification",
	"Lord of War",
	"Agent of the Imperium",
	"No Force Org Slot",
];

export class Model extends BaseNotes {
	_count = 0;

	// Characteristics
	move = '0"';
	_ws = "";
	_bs = "";
	str = 4;
	toughness = 4;
	wounds = 1;
	_attacks = "";
	leadership = 7;
	save = "";

	weapons = [];
	_upgrades = [];
	// TODO model upgrades (i.e. tau support systems)
	_psyker = null;
	_psychicPowers = [];
	_explosions = [];

	equal(model) {
		if (model == null) return false;

		if (
			this._name === model._name &&
			this._count === model._count &&
			this.weapons.length === model.weapons.length &&
			this._upgrades.length === model._upgrades.length
		) {
			for (let wi = 0; wi < this.weapons.length; wi++) {
				if (!this.weapons[wi].equal(model.weapons[wi])) {
					return false;
				}
			}
			for (let wi = 0; wi < this._upgrades.length; wi++) {
				if (!this._upgrades[wi].equal(model._upgrades[wi])) {
					return false;
				}
			}

			// TODO: check for the same psychic powers
			if (this._psyker != null || model._psyker != null) return false;

			return true;
		}
		return false;
	}

	nameAndGear() {
		let name = super.name();

		if (this.weapons.length > 0 || this._upgrades.length > 0) {
			const gear = this.getDedupedWeaponsAndUpgrades();
			name += ` (${gear.map((u) => u.toString()).join(", ")})`;
		}
		return name;
	}

	getDedupedWeaponsAndUpgrades() {
		const deduped = [];
		for (const upgrade of [...this.weapons, ...this._upgrades]) {
			if (!deduped.some((e) => upgrade.selectionName() === e.selectionName())) {
				deduped.push(upgrade);
			}
		}
		return deduped;
	}

	normalize() {
		this.weapons.sort(CompareWeapon);
		this._upgrades.sort(CompareObj);

		this.normalizeUpgrades(this.weapons);
		this.normalizeUpgrades(this._upgrades);
	}

	normalizeUpgrades(upgrades) {
		for (let i = 0; i < upgrades.length - 1; i++) {
			const upgrade = upgrades[i];
			if (upgrade._name === upgrades[i + 1]._name) {
				upgrade._count += upgrades[i + 1]._count;
				upgrade._cost.add(upgrades[i + 1]._cost);
				upgrades.splice(i + 1, 1);
				i--;
			}
		}
		for (let upgrade of upgrades) {
			if (upgrade._count % this._count == 0) {
				upgrade._count /= this._count;
				upgrade._cost._points /= this._count;
			}
		}
	}
}

export class Unit extends BaseNotes {
	_roleRole = UnitRole.NONE;
	factions = new Set();
	keywords = new Set();

	abilities = {};
	rules = new Map();

	_models = [];
	modelStats = [];
	_modelList = [];
	weapons = [];
	_spells = [];
	_psykers = [];
	_explosions = [];

	_cost = new Costs();

	_woundTracker = [];

	nameWithExtraCosts() {
		const extraCosts = []; // Track extra costs like cabal points.
		for (const freeformCostType in this._cost._freeformValues) {
			if (this._cost._freeformValues[freeformCostType] === 0) continue;
			extraCosts.push(
				`${this._cost._freeformValues[freeformCostType]}${freeformCostType}`
			);
		}
		return extraCosts.length
			? `${this.name()} [${extraCosts.join(", ")}]`
			: this.name();
	}

	equal(unit) {
		if (unit == null) return false;

		if (
			unit._name === this._name &&
			unit._role === this._role &&
			unit._models.length === this._models.length &&
			unit.modelStats.length === this.modelStats.length
		) {
			for (let mi = 0; mi < this._models.length; mi++) {
				if (!this._models[mi].equal(unit._models[mi])) {
					return false;
				}
			}

			for (let mi = 0; mi < this.modelStats.length; mi++) {
				if (!this.modelStats[mi].equal(unit.modelStats[mi])) {
					return false;
				}
			}

			// Check how to replace without lodash
			/* if (!_.isEqual(this.abilities, unit.abilities)) {
        return false;
      } else if (!_.isEqual(this.rules, unit.rules)) {
        return false;
      } */

			return true;
		}
		return false;
	}

	normalize() {
		// Sort force units by role and name
		this._models.sort(CompareModel);
		this.modelStats.sort(CompareObj);

		for (let model of this._models) {
			model.normalize();
		}

		for (let i = 0; i < this._models.length - 1; i++) {
			const model = this._models[i];

			if (model.nameAndGear() === this._models[i + 1].nameAndGear()) {
				model._count++;
				this._models.splice(i + 1, 1);
				i--;
			}
		}

		for (let i = 0; i < this.modelStats.length - 1; i++) {
			const model = this.modelStats[i];

			if (model.equal(this.modelStats[i + 1])) {
				this.modelStats.splice(i + 1, 1);
				i--;
			}
		}

		this._modelList = this._models.map(
			(model) =>
				(model._count > 1 ? `${model._count}x ` : "") + model.nameAndGear()
		);
		this.weapons = this._models
			.map((m) => m.weapons)
			.reduce((acc, val) => acc.concat(val), [])
			.sort(CompareWeapon)
			.filter((weap, i, array) => weap.name() !== array[i - 1]?.name());

		this._spells.push(
			...this._models
				.map((m) => m._psychicPowers)
				.reduce((acc, val) => acc.concat(val), [])
		);
		this._psykers.push(...this._models.map((m) => m._psyker).filter((p) => p));
		this._explosions.push(
			...this._models
				.map((m) => m._explosions)
				.reduce((acc, val) => acc.concat(val), [])
		);
	}
}

export class Force extends BaseNotes {
	_catalog = "";
	_faction = "Unknown";
	_factionRules = new Map();
	_configurations = [];
	rules = new Map();
	_units = [];
}

export class Roster40k extends BaseNotes {
	_cost = new Costs();
	_forces = [];
}

export class Costs {
	_powerLevel = 0;
	_commandPoints = 0;
	_points = 0;
	_freeformValues;

	hasValues() {
		return (
			this._powerLevel !== 0 || this._commandPoints !== 0 || this._points !== 0
		);
	}

	toString() {
		const values = [];
		if (this._points !== 0) values.push(`${this._points} pts`);
		if (this._powerLevel !== 0) values.push(`${this._powerLevel} PL`);
		if (this._commandPoints !== 0) values.push(`${this._commandPoints} CP`);
		return `[${values.join(" / ")}]`;
	}

	add(other) {
		this._powerLevel += other._powerLevel;
		this._commandPoints += other._commandPoints;
		this._points += other._points;
		for (const name in other._freeformValues) {
			this.addFreeformValue(name, other._freeformValues[name]);
		}
	}

	addFreeformValue(name, value) {
		if (!this._freeformValues) this._freeformValues = {};
		const oldValue = this._freeformValues[name] || 0;
		this._freeformValues[name] = oldValue + value;
	}
}

export function Create40kRoster(doc) {
	// Determine roster type (game system).
	let info = doc.querySelector("roster");
	if (info) {
		const roster = new Roster40k();

		const name = info.getAttributeNode("name")?.nodeValue;
		if (name) {
			roster._name = name;
		} else {
			roster._name = "40k Army Roster";
		}

		ParseRosterPoints(doc, roster);
		ParseForces(doc, roster);

		return roster;
	}
}

function ParseRosterPoints(doc, roster) {
	let costs = doc.querySelectorAll("roster>costs>cost");
	for (let cost of costs) {
		roster._cost.add(ParseCost(cost));
	}
}

function ParseForces(doc, roster) {
	let forcesRoot = doc.querySelectorAll("roster>forces>force");
	for (let root of forcesRoot) {
		if (root.hasAttribute("name") && root.hasAttribute("catalogueName")) {
			let f = new Force();

			let which = root.getAttributeNode("name")?.nodeValue;
			let value = root.getAttributeNode("catalogueName")?.nodeValue;

			if (which) {
				f._name = which;
			}
			if (value) {
				f._catalog = value;
			}

			// TODO: Determine force faction and faction specific rules.

			// Only include the allegiance rules once.
			if (!DuplicateForce(f, roster)) {
				const rules = root.querySelectorAll("force>rules>rule");
				for (let rule of rules) {
					ExtractRuleDescription(rule, f.rules);
				}
			}

			ParseSelections(root, f);

			roster._forces.push(f);
		}
	}
}

function ParseSelections(root, force) {
	let selections = root.querySelectorAll("force>selections>selection");

	for (let selection of selections) {
		// What kind of selection is this
		let selectionName = selection.getAttributeNode("name")?.nodeValue;
		if (!selectionName) continue;

		if (selectionName.includes("Detachment Command Cost")) {
			// Ignore Detachment Command cost
		} else if (
			selectionName === "Battle Size" ||
			selectionName === "Gametype"
		) {
			ParseConfiguration(selection, force);
		} else if (selection.querySelector('profile[typeName="Unit"]')) {
			const unit = ParseUnit(selection);
			force._units.push(unit);
			for (const entry of unit.rules.entries()) {
				force.rules.set(entry[0], entry[1]);
			}
		} else if (selection.getAttribute("type") === "upgrade") {
			ExtractRuleFromSelection(selection, force.rules);
			ParseConfiguration(selection, force);
			const props = selection.querySelectorAll("selections>selection");
			for (let prop of props) {
				// sub-faction
				const name = prop.getAttribute("name");
				if (name && prop.getAttribute("type") === "upgrade") {
					if (force._faction === "Unknown") {
						// pick the first upgrade we see
						force._faction = name;
					}
					ExtractRuleFromSelection(prop, force._factionRules);
				}
			}
		} else {
			console.log("** UNEXPECTED SELECTION **", selectionName, selection);
		}
	}

	for (const key of force._factionRules.keys()) {
		force.rules.delete(key);
	}

	// Sort force units by role and name
	force._units.sort((a, b) => {
		if (a._role > b._role) return 1;
		else if (a._role == b._role) {
			if (a._name > b._name) return 1;
			else if (a._name == b._name) return 0;
			return -1;
		}
		return -1;
	});
}

function ParseConfiguration(selection, force) {
	const name = selection.getAttribute("name");
	if (!name) {
		return;
	}
	const category = selection.querySelector("category")?.getAttribute("name");
	const subSelections = selection.querySelectorAll("selections>selection");
	const details = [];
	let costs = GetSelectionCosts(selection);
	for (const sel of subSelections) {
		details.push(sel.getAttribute("name"));
		costs.add(GetSelectionCosts(sel));
	}

	let configuration =
		!category || category === "Configuration" ? name : `${category} - ${name}`;
	if (details.length > 0) configuration += `: ${details.join(", ")}`;
	if (costs.hasValues()) configuration += ` ${costs.toString()}`;

	force._configurations.push(configuration);
}

function DuplicateForce(force, roster) {
	if (!roster || !force) return false;

	for (let f of roster._forces) {
		if (f._catalog === force._catalog) return true;
	}
	return false;
}

function ExtractRuleFromSelection(root, map) {
	const profiles = root.querySelectorAll("profiles>profile");
	for (const profile of profiles) {
		// detachment rules
		const profileName = profile.getAttribute("name");
		if (!profileName) continue;

		const profileType = profile.getAttribute("typeName");
		if (
			profileType === "Abilities" ||
			profileType === "Dynastic Code" ||
			profileType === "Household Tradition"
		) {
			ParseProfileCharacteristics(profile, profileName, profileType, map);
		}
	}

	const rules = root.querySelectorAll("rules>rule");
	for (const rule of rules) {
		ExtractRuleDescription(rule, map);
	}
}

function ExtractRuleDescription(rule, map) {
	const ruleName = rule.getAttribute("name");
	const desc = rule.querySelector("description");
	if (ruleName && desc?.textContent) {
		map.set(ruleName, desc.textContent);
	}
}

function LookupRole(roleText) {
	switch (roleText) {
		case "HQ":
			return UnitRole.HQ;
		case "Troops":
			return UnitRole.TR;
		case "Elites":
			return UnitRole.EL;
		case "Fast Attack":
			return UnitRole.FA;
		case "Heavy Support":
			return UnitRole.HS;
		case "Flyer":
			return UnitRole.FL;
		case "Dedicated Transport":
			return UnitRole.DT;
		case "Fortification":
			return UnitRole.FT;
		case "Lord of War":
			return UnitRole.LW;
		case "Agent of the Imperium":
			return UnitRole.AGENTS;
		case "No Force Org Slot":
			return UnitRole.NF;
		case "Primarch | Daemon Primarch | Supreme Commander":
			return UnitRole.SCD;
	}
	return UnitRole.NONE;
}

function ExpandBaseNotes(root, obj) {
	obj._name = root.getAttributeNode("name")?.nodeValue;

	let element = root;
	if (
		root.tagName === "profile" &&
		root.parentElement &&
		root.parentElement.parentElement
	) {
		element = root.parentElement.parentElement;
	}

	let child = element.firstElementChild;
	if (child && child.tagName === "customNotes") {
		obj._customNotes = child.textContent;
	}
	return obj._name;
}

function ExtractNumberFromParent(root) {
	// Get parent node (a selection) to determine model count.
	if (root.parentElement && root.parentElement.parentElement) {
		const parentSelection = root.parentElement.parentElement;
		const countValue = parentSelection.getAttributeNode("number")?.nodeValue;
		if (countValue) {
			return +countValue;
		}
	}

	return 0;
}

function GetImmediateSelections(root) {
	// querySelectorAll(':scope > tagname') doesn't work with jsdom, so we hack
	// around it: https://github.com/jsdom/jsdom/issues/2998
	const selections = [];
	for (const child of root.children) {
		if (child.tagName === "selections") {
			for (const subChild of child.children) {
				if (subChild.tagName === "selection") {
					selections.push(subChild);
				}
			}
		}
	}
	return selections;
}

function HasImmediateProfileWithTypeName(root, typeName) {
	// querySelectorAll(':scope > tagname') doesn't work with jsdom, so we hack
	// around it: https://github.com/jsdom/jsdom/issues/2998
	for (const child of root.children) {
		if (child.tagName === "profiles") {
			for (const subChild of child.children) {
				if (
					subChild.tagName === "profile" &&
					subChild.getAttribute("typeName") === typeName
				) {
					return true;
				}
			}
		}
	}
	return false;
}

function GetSelectionCosts(selection) {
	// querySelectorAll(':scope > tagname') doesn't work with jsdom, so we hack
	// around it: https://github.com/jsdom/jsdom/issues/2998

	const costs = new Costs();
	for (const child of selection.children) {
		if (child.tagName === "costs") {
			for (const subChild of child.children) {
				costs.add(ParseCost(subChild));
			}
		}
	}
	return costs;
}

function ParseCost(cost) {
	const costs = new Costs();
	const which = cost.getAttribute("name");
	const value = cost.getAttribute("value");
	if (which && value) {
		if (which === " PL") {
			costs._powerLevel += +value;
		} else if (which === "pts") {
			costs._points += +value;
		} else if (which === "CP") {
			costs._commandPoints += +value;
		} else {
			costs.addFreeformValue(which, +value);
		}
	}
	return costs;
}

function ParseUnit(root) {
	let unit = new Unit();
	const unitName = ExpandBaseNotes(root, unit);

	let categories = root.querySelectorAll("categories>category");
	for (let cat of categories) {
		const catName = cat.getAttributeNode("name")?.nodeValue;
		if (catName) {
			const factPattern = "Faction: ";
			const factIndex = catName.lastIndexOf(factPattern);
			if (factIndex >= 0) {
				const factKeyword = catName.slice(factIndex + factPattern.length);
				unit.factions.add(factKeyword);
			} else {
				const roleText = catName.trim();
				let unitRole = LookupRole(roleText);
				if (unitRole != UnitRole.NONE) {
					unit._role = unitRole;
				} else {
					// Keyword
					unit.keywords.add(catName);
				}
			}
		}
	}

	const seenProfiles = [];

	// First, find model stats. These have typeName=Unit.
	const modelStatsProfiles = Array.from(
		root.querySelectorAll('profile[typeName="Unit"],profile[typeName="Model"]')
	);
	ParseModelStatsProfiles(modelStatsProfiles, unit, unitName);
	seenProfiles.push(...modelStatsProfiles);

	// Next, look for selections with models. These usually have type="model",
	// but may have type="upgrade" containing a profile of type="Unit".
	const modelSelections = [];
	if (root.getAttribute("type") === "model") {
		modelSelections.push(root); // Single-model unit.
	} else {
		const immediateSelections = GetImmediateSelections(root);
		for (const selection of immediateSelections) {
			if (
				selection.getAttribute("type") === "model" ||
				HasImmediateProfileWithTypeName(selection, "Unit")
			) {
				modelSelections.push(selection);
			}
		}
		// Some units are under a root selection with type="upgrade".
		if (modelSelections.length === 0) {
			modelSelections.push(
				...Array.from(root.querySelectorAll('selection[type="model"]'))
			);
		}
		// Some single-model units have type="unit" or type="upgrade".
		if (
			modelSelections.length === 0 &&
			HasImmediateProfileWithTypeName(root, "Unit")
		) {
			modelSelections.push(root);
		}
	}

	// Now, parse the model -- profiles for stats, and selections for upgrades.
	for (const modelSelection of modelSelections) {
		const profiles = Array.from(
			modelSelection.querySelectorAll("profiles>profile")
		);
		const unseenProfiles = profiles.filter((e) => !seenProfiles.includes(e));
		seenProfiles.push(...unseenProfiles);

		const model = new Model();
		model._name = modelSelection.getAttribute("name") || "Unknown Model";
		model._count = Number(modelSelection.getAttribute("number") || 1);
		unit._models.push(model);

		// Find stats for all profiles (weapons, powers, abilities, etc).
		ParseModelProfiles(profiles, model, unit);

		// Find all upgrades on the model. This may include weapons that were
		// parsed from profiles (above), so dedupe those in nameAndGear().
		for (const upgradeSelection of modelSelection.querySelectorAll(
			'selections>selection[type="upgrade"]'
		)) {
			// Ignore selections without abilities but with sub-selection upgrades,
			// since those sub-selections will be picked up individually.
			if (
				upgradeSelection.querySelector(
					'selections>selection[type="upgrade"]'
				) &&
				!HasImmediateProfileWithTypeName(upgradeSelection, "Abilities")
			)
				continue;

			let upgradeName = upgradeSelection.getAttribute("name");
			if (upgradeName) {
				const upgrade = new Upgrade();
				upgrade._name = upgradeName;
				upgrade._cost = GetSelectionCosts(upgradeSelection);
				upgrade._count = Number(upgradeSelection.getAttribute("number"));
				model._upgrades.push(upgrade);
			}
		}
	}

	// Finally, look for profiles that are not under models. They may apply to
	//    a) model loadouts, if it's selection with a Weapon (eg Immortals)
	//    b) unit loadout, if it's a selection with an Ability (eg Bomb Squigs)
	//    c) abilities for the unit, if it's not under a child selection
	let profiles = Array.from(root.querySelectorAll("profiles>profile"));
	let unseenProfiles = profiles.filter((e) => !seenProfiles.includes(e));
	seenProfiles.push(...unseenProfiles);
	if (unseenProfiles.length > 0) {
		const unitUpgradesModel = new Model();
		unitUpgradesModel._name = "Unit Upgrades";
		ParseModelProfiles(unseenProfiles, unitUpgradesModel, unit);
		if (unitUpgradesModel.weapons.length > 0 && unit._models.length > 0) {
			// Apply weapons at the unit level to all models in the unit.
			for (const model of unit._models) {
				model.weapons.push(...unitUpgradesModel.weapons);
			}
			unitUpgradesModel.weapons.length = 0; // Clear the array.
		}
		if (unitUpgradesModel._psychicPowers.length > 0) {
			// Add spells to the unit's spell list. However, we'll still need
			// to add spell upgrade selections to the upgrade list, below.
			unit._spells.push(...unitUpgradesModel._psychicPowers);
			unitUpgradesModel._psychicPowers.length = 0;
		}
		if (unitUpgradesModel._psyker) {
			unit._psykers.push(unitUpgradesModel._psyker);
			unitUpgradesModel._psyker = null;
		}
		if (unitUpgradesModel._explosions.length > 0) {
			unit._explosions.push(...unitUpgradesModel._explosions);
			unitUpgradesModel._explosions.length = 0;
		}

		// Look for any unit-level upgrade selections that we didn't catch
		// previously, and stuff them in the "Unit Upgrades" model.
		for (const selection of GetImmediateSelections(root)) {
			if (selection.getAttribute("type") !== "upgrade") continue;
			// Ignore model selections (which were already processed).
			if (modelSelections.includes(selection)) continue;
			// Ignore unit-level weapon selections; these were handled above.
			if (selection.querySelector('profiles>profile[typeName="Weapon"]'))
				continue;

			let name = selection.getAttribute("name");
			if (!name) continue;

			const upgrade = new Upgrade();
			upgrade._name = name;
			upgrade._cost = GetSelectionCosts(selection);
			upgrade._count = Number(selection.getAttribute("number"));
			unitUpgradesModel._upgrades.push(upgrade);
		}

		if (
			unitUpgradesModel.weapons.length > 0 ||
			unitUpgradesModel._upgrades.length > 0
		) {
			unit._models.push(unitUpgradesModel);
		}
	}

	// Only match costs->costs associated with the unit and not its children (model and weapon) costs.
	let costs = root.querySelectorAll("costs>cost");
	for (let cost of costs) {
		unit._cost.add(ParseCost(cost));
	}

	let rules = root.querySelectorAll("rules > rule");
	for (let rule of rules) {
		ExtractRuleDescription(rule, unit.rules);
	}

	unit.normalize();
	return unit;
}

function ParseModelStatsProfiles(profiles, unit, unitName) {
	for (const profile of profiles) {
		const profileName = profile.getAttribute("name");
		const profileType = profile.getAttribute("typeName");
		if (!profileName || !profileType) return;

		const model = new Model();
		model._name = profileName;
		unit.modelStats.push(model);

		ExpandBaseNotes(profile, model);

		const chars = profile.querySelectorAll("characteristics>characteristic");
		for (const char of chars) {
			const charName = char.getAttribute("name");
			if (!charName) continue;

			if (char.textContent) {
				switch (charName) {
					case "M":
						model.move = char.textContent;
						break;
					case "WS":
						model._ws = char.textContent;
						break;
					case "BS":
						model._bs = char.textContent;
						break;
					case "S":
						model.str = +char.textContent;
						break;
					case "T":
						model.toughness = +char.textContent;
						break;
					case "W":
						model.wounds = +char.textContent;
						break;
					case "A":
						model._attacks = char.textContent;
						break;
					case "Ld":
						model.leadership = +char.textContent;
						break;
					case "Save":
						model.save = char.textContent;
						break;
				}
			}
		}
	}
}

function ParseModelProfiles(profiles, model, unit) {
	for (const profile of profiles) {
		const profileName = profile.getAttribute("name");
		const typeName = profile.getAttribute("typeName");
		if (!profileName || !typeName) continue;

		if (
			typeName === "Unit" ||
			typeName === "Model" ||
			profile.getAttribute("type") === "model"
		) {
			// Do nothing; these were already handled.
		} else if (typeName === "Weapon") {
			const weapon = ParseWeaponProfile(profile);
			model.weapons.push(weapon);
		} else if (
			typeName.includes("Wound Track") ||
			typeName.includes("Stat Damage") ||
			typeName.includes(" Wounds")
		) {
			const tracker = ParseWoundTrackerProfile(profile);
			unit._woundTracker.push(tracker);
		} else if (typeName == "Psychic Power") {
			const power = ParsePsychicPowerProfile(profile);
			model._psychicPowers.push(power);
		} else if (typeName.includes("Explosion")) {
			const explosion = ParseExplosionProfile(profile);
			model._explosions.push(explosion);
		} else if (typeName == "Psyker") {
			model._psyker = ParsePsykerProfile(profile);
		} else {
			// Everything else, like Prayers and Warlord Traits.
			if (!unit.abilities[typeName]) unit.abilities[typeName] = new Map();
			ParseProfileCharacteristics(
				profile,
				profileName,
				typeName,
				unit.abilities[typeName]
			);
		}
	}
}

function ParseProfileCharacteristics(profile, profileName, typeName, map) {
	const chars = profile.querySelectorAll("characteristics>characteristic");
	for (const char of chars) {
		if (!char.textContent) continue;

		const charName = char.getAttribute("name");
		if (charName && chars.length > 1) {
			// Profiles with multiple characteristics need to distinguish them by name.
			map.set([profileName, charName.toString()].join(" - "), char.textContent);
		} else {
			// Profiles with a single characteristic can ignore the char name.
			map.set(profileName, char.textContent);
		}
	}
}

function ParseWeaponProfile(profile) {
	const weapon = new Weapon();
	ExpandBaseNotes(profile, weapon);
	weapon._count = ExtractNumberFromParent(profile);

	let chars = profile.querySelectorAll("characteristics>characteristic");
	for (let char of chars) {
		let charName = char.getAttribute("name");
		if (charName) {
			if (char.textContent) {
				switch (charName) {
					case "Range":
						weapon._range = char.textContent;
						break;
					case "Type":
						weapon._type = char.textContent;
						break;
					case "S":
						weapon.str = char.textContent;
						break;
					case "AP":
						weapon._ap = char.textContent;
						break;
					case "D":
						weapon._damage = char.textContent;
						break;
					case "Abilities":
						weapon.abilities = char.textContent;
						break;
				}
			}
		}
	}
	// Keep track of the weapon's parent selection for its name, unless the
	// weapon is directly under the unit's profile.
	const selection = profile.parentElement?.parentElement;
	const selectionName = selection?.getAttribute("name");
	if (selection?.getAttribute("type") === "upgrade" && selectionName) {
		weapon._selectionName = selectionName;
		weapon._cost = GetSelectionCosts(selection);
	}
	return weapon;
}

function ParseWoundTrackerProfile(profile) {
	let tracker = new WoundTracker();
	ExpandBaseNotes(profile, tracker);
	let chars = profile.querySelectorAll("characteristics>characteristic");
	for (let char of chars) {
		const charName = char.getAttribute("name");
		if (charName) {
			if (char.textContent) {
				tracker._table.set(charName, char.textContent);
			} else {
				tracker._table.set(charName, "-");
			}
		}
	}
	return tracker;
}

function ParsePsychicPowerProfile(profile) {
	const power = new PsychicPower();
	ExpandBaseNotes(profile, power);

	const chars = profile.querySelectorAll("characteristics>characteristic");
	for (let char of chars) {
		const charName = char.getAttribute("name");
		if (charName && char.textContent) {
			switch (charName) {
				case "Range":
					power._range = char.textContent;
					break;
				case "Warp Charge":
					power._manifest = +char.textContent;
					break;
				case "Details":
					power._details = char.textContent;
					break;
			}
		}
	}
	return power;
}

function ParseExplosionProfile(profile) {
	const explosion = new Explosion();
	ExpandBaseNotes(profile, explosion);

	const chars = profile.querySelectorAll("characteristics>characteristic");
	for (const char of chars) {
		const charName = char.getAttribute("name");
		if (charName && char.textContent) {
			switch (charName) {
				case "Dice Roll":
					explosion._diceRoll = char.textContent;
					break;
				case "Distance":
					explosion._distance = char.textContent;
					break;
				case "Mortal Wounds":
					explosion._mortalWounds = char.textContent;
					break;
			}
		}
	}
	return explosion;
}

function ParsePsykerProfile(profile) {
	const psyker = new Psyker();
	ExpandBaseNotes(profile, psyker);

	const chars = profile.querySelectorAll("characteristics>characteristic");
	for (const char of chars) {
		const charName = char.getAttribute("name");
		if (charName && char.textContent) {
			switch (charName) {
				case "Cast":
					psyker._cast = char.textContent;
					break;
				case "Deny":
					psyker._deny = char.textContent;
					break;
				case "Powers Known":
					psyker._powers = char.textContent;
					break;
				case "Other":
					psyker._other = char.textContent;
					break;
			}
		}
	}
	return psyker;
}

function CompareObj(a, b) {
	return Compare(a._name, b._name);
}

function CompareModel(a, b) {
	if (a._name === b._name) {
		return Compare(a.nameAndGear(), b.nameAndGear());
	} else if (a._name === "Unit Upgrades") {
		// "Unit Upgrades", a special model name, is always sorted last.
		return 1;
	} else if (b._name === "Unit Upgrades") {
		// "Unit Upgrades", a special model name, is always sorted last.
		return -1;
	} else {
		return Compare(a._name, b._name);
	}
}

export function CompareWeapon(a, b) {
	const aType = a._type.startsWith("Grenade")
		? 2
		: a._type.startsWith("Melee")
		? 1
		: 0;
	const bType = b._type.startsWith("Grenade")
		? 2
		: b._type.startsWith("Melee")
		? 1
		: 0;
	return aType - bType || a.name().localeCompare(b.name());
}

export function Compare(a, b) {
	if (a > b) return 1;
	else if (a == b) return 0;
	return -1;
}
