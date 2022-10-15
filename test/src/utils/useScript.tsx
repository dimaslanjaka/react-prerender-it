import { useEffect, useState } from "react";

/**
 * Custom Hook
 * @param callback
 * @param args
 * @returns
 * @link https://stackoverflow.com/a/60327893/6404439
 */
export const useInit = (callback: CallableFunction, ...args: any[]) => {
	const [mounted, setMounted] = useState(false);

	const resetInit = () => setMounted(false);

	useEffect(() => {
		if (!mounted) {
			setMounted(true);
			callback(...args);
		}
	}, [mounted, callback, args]);

	return [resetInit];
};

const usedScript: string[] = [];

interface useScriptProps {
	url: string;
	origin?: string;
	integrity?: string;
	async?: boolean;
	/**
	 * ignore duplication checker
	 */
	force?: boolean;
	callback?: ((this: GlobalEventHandlers, ev: Event) => any) | null;
}

/**
 * call external CDN script
 * * Dont call this function inside useEffect, because this function have useEffect
 * @param url
 * @example
 * function Element() {
 *   useScript('https://domain.cdn/path/file.js')
 *   return <>Hi</>
 * }
 */
export const useScript = ({
	url,
	integrity = "anonymous",
	async = true,
	origin = "anonymous",
	force = false,
}: useScriptProps) => {
	// component will unmount
	useEffect(() => {
		if (usedScript.includes(url) && !force) return;
		//console.log("calling", url);
		const script = document.createElement("script");
		usedScript.push(url);
		script.src = url;

		if (async) script.async = async;
		if (integrity) script.integrity = integrity;
		if (origin) script.crossOrigin = origin;

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, [url, integrity, async, origin, force]);
};
