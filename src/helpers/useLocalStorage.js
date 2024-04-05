import { useEffect, useState } from "react";

export function useLocalStorage(key, initValue) {
	const [state, setState] = useState(() => {
		const value = localStorage.getItem(key);
		if (value) {
			return value;
		}

		if (initValue) {
			trySettingLocalStorage(key, initValue, setState);
		}
		return initValue;
	});

	useEffect(() => {
		if (!state || state === "undefined") {
			localStorage.removeItem(key);
		} else {
			trySettingLocalStorage(key, state, setState);
		}
	}, [key, state]);

	useEffect(() => {
		const listenStorageChange = () => {
			setState(() => {
				const value = localStorage.getItem(key);
				if (value) {
					return value;
				}

				if (initValue) {
					trySettingLocalStorage(key, initValue, setState);
				}
				return initValue;
			});
		};
		window.addEventListener("storage", listenStorageChange);
		return () => window.removeEventListener("storage", listenStorageChange);
	}, []);

	return [state, setState];
}

const trySettingLocalStorage = (key, value, setState) => {
	try {
		localStorage.setItem(key, value);
		window.dispatchEvent(new Event("storage"));
	} catch (e) {
		console.error(e);
		setState(value);
	}
};
