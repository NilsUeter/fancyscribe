import JSZip from "jszip";
import { Create40kRoster } from "./roster40k";
import { Create40kRoster10th } from "./roster40k-10th";
import { useEffect, useState, useRef } from "react";

import Demo0 from "./assets/Demo0.png";
import Demo1 from "./assets/Demo1.png";
import { Roster } from "./9th/Roster";
import { Roster as Roster10th } from "./10th/Roster";

function App() {
	const [error, setError] = useState();
	const [roster, setRoster] = useState();
	const [edition, setEdition] = useState(9); // [9, 10]
	const [onePerPage, setOnePerPage] = useState(false);
	const [primaryColor, setPrimaryColor] = useState("#536766");
	const uploadRef = useRef();
	async function handleFileSelect(event) {
		const files = event?.target?.files;

		if (files) {
			const reader = new FileReader();
			reader.onerror = () => {
				reader.abort();
				setError("Failed to read roster file.");
			};
			reader.onloadend = async () => {
				const content = reader.result;
				const xmldata = await unzip(content);
				parseXML(xmldata);
			};
			reader.readAsBinaryString(files[0]);
		} else {
			let example;
			switch (event) {
				case "ultras":
					example = await fetch("Ultramarines Example.rosz");
					break;
				case "chaos daemons":
					example = await fetch("Chaos Demons Mix.rosz");
				default:
					break;
			}
			// load example

			const arrayBuffer = await example.arrayBuffer();
			// Create a new Blob object from the zip file contents
			const zipBlob = new Blob([arrayBuffer], { type: "application/zip" });
			const xmldata = await unzip(zipBlob);
			parseXML(xmldata);
		}
	}

	const unzip = async (file) => {
		if (file?.charAt && file.charAt(0) !== "P") {
			return file;
		} else {
			const jszip = new JSZip();
			const zip = await jszip.loadAsync(file);
			return zip.file(/[^/]+\.ros/)[0].async("string"); // Get roster files that are in the root
		}
	};

	function parseXML(xmldata) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(xmldata, "text/xml");
		if (!doc) return;

		// Determine roster type (game system).
		const info = doc.querySelector("roster");
		if (!info) return;

		const gameType = info.getAttribute("gameSystemName");
		if (!gameType) return;

		const rosterName = info.getAttribute("name");
		if (rosterName) {
			document.title = `FancyScribe ${rosterName}`;
		}
		console.log(doc);
		if (gameType == "Warhammer 40,000 9th Edition") {
			const roster = Create40kRoster(doc);
			console.log(roster);
			if (roster && roster.forces.length > 0) {
				setRoster(roster);
				setEdition(9);
				setError("");
			}
		} else if (gameType == "Warhammer 40,000 10th Edition") {
			const roster = Create40kRoster10th(doc);
			console.log(roster);
			if (roster && roster.forces.length > 0) {
				setRoster(roster);
				setEdition(10);
				setError("");
			}
		} else {
			setError("No support for game type '" + gameType + "'.");
		}
	}

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
	useEffect(() => {
		if (roster) {
			setPrimaryColor(getPrimaryColor(roster.forces[0].catalog));
		}
	}, [roster]);

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<div
			className="App"
			style={{
				"--primary-color": primaryColor,
				"--primary-color-transparent": primaryColor + "60",
			}}
		>
			<div className="header print-display-none">
				<a href="/fancyscribe" style={{ color: "#fff", fontWeight: 800 }}>
					FancyScribe
				</a>
				<div className="subheader">
					A fancy way to view your Warhammer 40k BattleScribe rosters
				</div>
			</div>

			<div className="body">
				<div
					className="print-display-none"
					style={{ display: "flex", width: "100%", gap: 8 }}
				>
					<input
						type="file"
						ref={uploadRef}
						accept=".ros,.rosz"
						name="rosterUpload"
						id="rosterUpload"
						onChange={handleFileSelect}
						style={{ display: "none" }}
					/>
					<label
						htmlFor="rosterUpload"
						className={"rosterUpload " + (roster ? "rosterUploaded" : "")}
						id="rosterUploadContainer"
						onDrop={(e) => {
							e.preventDefault();
							e.stopPropagation();
							if (e.dataTransfer.files && e.dataTransfer.files[0]) {
								e.target.files = e.dataTransfer.files;
								handleFileSelect(e);
							}
						}}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
					>
						<div id="preloadContainer">
							<span>Upload roster file (.ros, .rosz)</span>
						</div>
					</label>

					<button
						style={{ display: roster ? "" : "none" }}
						onClick={() => window.print()}
					>
						Print roster
					</button>
				</div>
				<div
					className="print-display-none"
					style={{ display: roster ? "flex" : "none", width: "100%", gap: 16 }}
				>
					<label style={{ display: "flex", alignItems: "center", gap: 4 }}>
						<input
							type="checkbox"
							onChange={(e) => setOnePerPage(e.target.checked)}
						/>
						<span>One Datacard per Page when Printing</span>
					</label>
					<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
						<label style={{ display: "flex", alignItems: "center", gap: 4 }}>
							<input
								type="color"
								style={{ height: 24, width: 32, padding: "0 2px" }}
								value={primaryColor}
								onChange={(e) => {
									setPrimaryColor(e.target.value);
								}}
							></input>
							<span> Custom Color</span>
						</label>

						{roster &&
							primaryColor !== getPrimaryColor(roster.forces[0].catalog) && (
								<button
									onClick={() =>
										setPrimaryColor(getPrimaryColor(roster.forces[0].catalog))
									}
									style={{
										padding: "2px 4px",
										borderRadius: 4,
										borderWidth: 1,
									}}
								>
									Reset color
								</button>
							)}
					</div>
				</div>
				<div className="print-display-none" style={{ color: "red" }}>
					{error}
				</div>
				{edition === 9 && <Roster roster={roster} onePerPage={onePerPage} />}
				{edition === 10 && (
					<Roster10th roster={roster} onePerPage={onePerPage} />
				)}
				<div style={{ display: "flex", gap: 8 }}>
					<button
						className="print-display-none"
						style={{ display: roster ? "none" : "", fontSize: "1.2rem" }}
						onClick={() => handleFileSelect("ultras")}
					>
						Load Ultramarines example
					</button>
					<button
						className="print-display-none"
						style={{ display: roster ? "none" : "", fontSize: "1.2rem" }}
						onClick={() => handleFileSelect("chaos daemons")}
					>
						Load Chaos Daemons example
					</button>
				</div>
				<div
					className="print-display-none"
					style={{ display: roster ? "none" : "" }}
				>
					<div style={{ padding: "8px 0", fontSize: "1.7rem" }}>About</div>
					<div style={{ fontSize: "1.2rem" }}>
						FancyScribe is a website that renders{" "}
						<a href="https://www.battlescribe.net/" target="_blank">
							BattleScribe
						</a>{" "}
						roster files in an opinionated format inspired by the new 10th
						edition datacards. Additional inspiration and large parts of the
						parsing logic come from the{" "}
						<a href="https://rweyrauch.github.io/PrettyScribe" target="_blank">
							PrettyScribe
						</a>{" "}
						website.
					</div>
					<div style={{ fontSize: "1.2rem" }}>
						FancyScribe is an open-source project and can be found on Github (
						<a href="https://github.com/NilsUeter/fancyscribe" target="_blank">
							FancyScribe
						</a>
						).
					</div>
					<div style={{ fontSize: "1.2rem" }}>
						If you have any feedback or find any bugs, write{" "}
						<a href="https://www.reddit.com/r/WarhammerCompetitive/comments/13ajo3b/fancyscribe_convert_9th_edition_battlescribe">
							here
						</a>{" "}
						or send me a message.
					</div>
					<div style={{ padding: "8px 0", fontSize: "1.7rem" }}>
						Output Examples
					</div>
					<img src={Demo0} style={{ width: "100%" }} />
					<img src={Demo1} style={{ width: "100%" }} />
				</div>
			</div>
		</div>
	);
}

const getPrimaryColor = (catalog) => {
	switch (catalog) {
		case "Imperium - Adeptus Astartes":
			return "#536766";
		case "Imperium - Adeptus Astartes - Blood Angels":
			return "#761119";
		case "Imperium - Adeptus Astartes - Space Wolves":
			return "#3e646f";
		case "Imperium - Adeptus Astartes - Imperial Fists":
			return "#b87d00";
		case "Imperium - Adeptus Astartes - Raven Guard":
			return "#2b2b2b";
		case "Imperium - Adeptus Astartes - Salamanders":
			return "#1b623f";
		case "Imperium - Adeptus Astartes - White Scars":
			return "#783028";
		case "Imperium - Adeptus Astartes - Dark Angels":
			return "#014419";
		case "Imperium - Adeptus Astartes - Black Templars":
			return "#002f42";
		case "Imperium - Adeptus Astartes - Deathwatch":
			return "#44494d";
		case "Imperium - Adeptus Custodes":
			return "#765c41";
		case "Imperium - Adeptus Mechanicus":
			return "#a03332";
		case "Imperium - Adepta Sororitas":
			return "#5e0a00";
		case "Imperium - Astra Militarum":
			return "#375441";
		case "Imperium - Grey Knights":
			return "#4a6672";
		case "Imperium - Imperial Knights":
			return "#03495e";
		case "Chaos - Daemons":
			return "#383c46";
		case "Chaos - Chaos Space Marines":
			return "#1d3138";
		case "Chaos - World Eaters":
			return "#883531";
		case "Chaos - Death Guard":
			return "#576011";
		case "Chaos - Chaos Knights":
			return "#513627";
		case "Necrons":
			return "#005c2f";
		case "Orks":
			return "#4b6621";
		case "Tyranids":
		case "Tyranids - Genestealer Cults":
			return "#44264C";
		case "Aeldari - Craftworlds":
			return "#1f787f";
		case "Aeldari - Harlequins":
			return "#6f322f";
		case "Leagues of Votann":
			return "#7d4c08";
		case "T'au Empire":
			return "#206173";
		default:
			console.log(catalog);
			return "#536766";
	}
};

export default App;
