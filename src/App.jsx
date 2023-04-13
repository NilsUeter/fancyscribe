import JSZip from "jszip";
import { Create40kRoster } from "./roster40k";
import { useState } from "react";
import { Roster } from "./Roster";
import Demo0 from "./assets/Demo0.png";
import Demo1 from "./assets/Demo1.png";

function App() {
	const [error, setError] = useState();
	const [roster, setRoster] = useState();
	function handleFileSelect(event) {
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
		}
	}

	const unzip = async (file) => {
		if (file.charAt(0) !== "P") {
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
			document.title = `PrettyScribe ${rosterName}`;
		}

		if (gameType == "Warhammer 40,000 9th Edition") {
			console.log(doc);
			const roster = Create40kRoster(doc);
			console.log(roster);
			if (roster && roster.forces.length > 0) {
				setRoster(roster);
				/* const renderer = new Renderer40k(roster);
        renderer.render(rosterTitle, rosterList, forceUnits); */
			}
		} else {
			setError("No support for game type '" + gameType + "'.");
		}
	}

	return (
		<div className="App">
			<div className="header print-display-none">
				FancyScribe
				<div className="subheader">
					A fancy way to view your Warhammer 40k BattleScribe rosters.
				</div>
			</div>

			<div className="body">
				<input
					type="file"
					name="rosterUpload"
					id="rosterUpload"
					onChange={handleFileSelect}
					style={{ display: "none" }}
				/>
				<label
					for="rosterUpload"
					className={
						"print-display-none rosterUpload" +
						" " +
						(roster ? "rosterUploaded" : "")
					}
					id="rosterUploadContainer"
				>
					<div id="preloadContainer">
						<span>Upload roster file (.ros, .rosz)</span>
					</div>
				</label>
				<div style={{ color: "red" }}>{error}</div>

				<Roster roster={roster} />
				<div
					className="print-display-none"
					style={{ display: roster ? "none" : "" }}
				>
					<div style={{ padding: "8px 0", fontSize: "1.7rem" }}>About</div>
					<div style={{ fontSize: "1.2rem" }}>
						PrettyScribe is a website that renders{" "}
						<a href="https://www.battlescribe.net/" target="_blank">
							BattleScribe
						</a>{" "}
						roster files in an opinionated format inspired by the new 10th
						edition datacards. Inspiration and large parts of the parsing logic
						come from the{" "}
						<a href="https://rweyrauch.github.io/PrettyScribe" target="_blank">
							PrettyScribe
						</a>{" "}
						application.
					</div>
					<div style={{ padding: "8px 0", fontSize: "1.7rem" }}>
						Output Examples
					</div>
					<img src={Demo0} />
					<img src={Demo1} />
				</div>
			</div>
		</div>
	);
}

export default App;
