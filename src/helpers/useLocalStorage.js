import { useEffect, useState } from "react";

export function useLocalStorage(key, initValue) {
	const [state, setState] = useState(() => {
		const value = localStorage.getItem(key);
		if (value) {
			return value;
		}

		if (initValue) {
			localStorage.setItem(key, initValue);
			window.dispatchEvent(new Event("storage"));
		}
		return initValue;
	});

	useEffect(() => {
		console.log(state);
		if (!state || state === "undefined") {
			localStorage.removeItem(key);
		} else {
			localStorage.setItem(key, state);
		}
		window.dispatchEvent(new Event("storage"));
	}, [key, state]);

	useEffect(() => {
		const listenStorageChange = () => {
			setState(() => {
				const value = localStorage.getItem(key);
				if (value) {
					return value;
				}

				if (initValue) {
					localStorage.setItem(key, initValue);
					window.dispatchEvent(new Event("storage"));
				}
				return initValue;
			});
		};
		window.addEventListener("storage", listenStorageChange);
		return () => window.removeEventListener("storage", listenStorageChange);
	}, []);

	return [state, setState];
}
