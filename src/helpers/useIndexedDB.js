import { useState, useEffect } from "react";

const DB_NAME = "fancyscribe";
const STORE_NAME = "images";

const openDB = () => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);

		request.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};

		request.onsuccess = () => {
			resolve(request.result);
		};

		request.onerror = () => {
			reject(request.error);
		};
	});
};

const getItem = (db, key) => {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([STORE_NAME], "readonly");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.get(key);

		request.onsuccess = () => {
			resolve(request.result);
		};

		request.onerror = () => {
			reject(request.error);
		};
	});
};

const setItem = (db, key, value) => {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.put(value, key);

		request.onsuccess = () => {
			resolve();
		};

		request.onerror = () => {
			reject(request.error);
		};
	});
};

export const useIndexedDB = (key) => {
	const [value, setValue] = useState(null);

	useEffect(() => {
		let db;
		let isMounted = true;

		const fetchData = () => {
			openDB()
				.then((database) => {
					db = database;
					return getItem(db, key);
				})
				.then((storedValue) => {
					if (isMounted) {
						setValue(storedValue);
					}
				})
				.catch((error) => {
					console.error("Failed to open DB or get item", error);
				});
		};

		fetchData();

		const handleStorageChange = (event) => {
			if (event?.detail?.key === key) {
				fetchData();
			}
		};

		window.addEventListener("storage", handleStorageChange);

		return () => {
			isMounted = false;
			window.removeEventListener("storage", handleStorageChange);
			if (db) {
				db.close();
			}
		};
	}, [key]);

	const setStoredValue = (newValue) => {
		openDB()
			.then((db) => setItem(db, key, newValue))
			.then(() => {
				setValue(newValue);
				window.dispatchEvent(new CustomEvent("storage", { detail: { key } }));
			})
			.catch((error) => {
				console.error("Failed to set item", error);
			});
	};

	return [value, setStoredValue];
};
