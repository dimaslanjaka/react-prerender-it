import { useEffect, useState } from "react";

export function getStorage<T>(key: string, defaultValue: T) {
	// getting stored value
	const saved = localStorage.getItem(key);
	if (typeof saved === "string") {
		const initial = JSON.parse(saved) as T;
		return initial || defaultValue;
	}
	return defaultValue;
}

/**
 *
 * @param key
 * @param defaultValue
 * @returns
 * @example
 * const [name, setName] = useLocalStorage("name", "");
 * const [checked, setChecked] = useLocalStorage("checked", false);
 */
export function useStorage<T>(key: string, defaultValue: T) {
	const [value, setValue] = useState(() => {
		return getStorage(key, defaultValue);
	});

	useEffect(() => {
		// storing input name
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue];
}
export const useLocalStorage = useStorage;
