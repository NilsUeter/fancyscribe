import JSZip from "jszip";
import { Create40kRoster } from "./roster40k";
import { useState } from "react";
import { Roster } from "./Roster";

function App() {
	const [roster, setRoster] = useState();
	function handleFileSelect(event) {
		const files = event?.target?.files;

		if (files) {
			const reader = new FileReader();
			reader.onerror = () => {
				reader.abort();
				console.log("Failed to read roster file.");
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
			if (roster && roster._forces.length > 0) {
				setRoster(roster);
				/* const renderer = new Renderer40k(roster);
        renderer.render(rosterTitle, rosterList, forceUnits); */
			}
		} else {
			console.log("No support for game type '" + gameType + "'.");
		}
	}

	return (
		<div className="App">
			<label>
				<input type="file" accept=".ros, .rosz" onChange={handleFileSelect} />
				Select roster file (.ros, .rosz)
			</label>
			<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
				<Roster roster={roster} />
			</div>
		</div>
	);
}

export default App;
