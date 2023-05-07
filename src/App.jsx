import JSZip from "jszip";
import { Create40kRoster } from "./roster40k";
import { useEffect, useState, useRef } from "react";
import { Roster } from "./Roster";
import Demo0 from "./assets/Demo0.png";
import Demo1 from "./assets/Demo1.png";

function App() {
	const [error, setError] = useState();
	const [roster, setRoster] = useState();
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
			// load example
			const example = await fetch("Ultramarines Example.rosz");
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

		if (gameType == "Warhammer 40,000 9th Edition") {
			console.log(doc);
			const roster = Create40kRoster(doc);
			console.log(roster);
			if (roster && roster.forces.length > 0) {
				setRoster(roster);
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

	return (
		<div className="App">
			<div className="header print-display-none">
				FancyScribe
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
				<div className="print-display-none" style={{ color: "red" }}>
					{error}
				</div>
				<Roster roster={roster} />
				<button
					className="print-display-none"
					style={{ display: roster ? "none" : "" }}
					onClick={handleFileSelect}
				>
					Load Ultramarines example
				</button>
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

export default App;
