// useRetrieveCategory.js

// File purpose:
// This file defines a custom React hook that determines *which category config to use* based on the
// current route segment (slicedUrl) and selected category (categoryName). It then triggers a Redux
// async action (a thunk) to fetch the correct page of results, and returns the matched config object
// as local state (categoryData) so the UI can know which category is currently selected.

// Key idea(s):
// The route segment (slicedUrl) chooses a config array (movies / tv series / popular).
// The selected genre (categoryName) chooses one entry from that config array.
// Dispatching the entry's thunk fetches the results and updates Redux state elsewhere.
// This hook returns the selected entry as `categoryData` (local React state), not the fetched results.

import { useDispatch } from "react-redux"; // Provides dispatch() so we can trigger Redux actions/thunks.
import { useState, useEffect } from "react"; // React state + effect hooks for local state + side effects.
import { fetchMovieDataConfig, fetchPopularDataConfig, fetchSeriesDataConfig } from "../dataConfig"; // Predefined config arrays describing how to fetch each category.

/**
 * Custom hook: useRetrieveCategory
 *
 * What it does:
 * - Chooses the correct configuration array based on `slicedUrl` (route segment).
 * - Finds the config entry matching the selected `categoryName` (genre/category label).
 * - Dispatches that entry's thunk to fetch API data for the current `page`.
 * - Stores the chosen config entry in local state and returns it as `categoryData`.
 *
 * Parameters:
 * @param {string} slicedUrl - Route segment that indicates which section of the app we're in.
 * @param {string} categoryName - The selected category/genre name used to pick a config entry.
 * @param {number} page - Pagination index used to fetch the correct page of results.
 *
 * Returns:
 * @returns {object|undefined} categoryData - The selected config entry (not the fetched results).
 */
export const useRetrieveCategory = (slicedUrl, categoryName, page) => {
	// Get the Redux dispatch function (used to send actions/thunks to the Redux store).
	const dispatch = useDispatch();

	// Local React state for the currently selected config entry.
	// Note: This is NOT Redux state; it only tracks which config entry was selected.
	const [categoryData, setCategoryData] = useState();

	// Side effect: whenever the route segment, categoryName, or page changes,
	// we re-select the config entry and dispatch a fetch thunk for that entry.
	useEffect(() => {
		// Will hold whichever config array matches the current section of the app.
		// Each config array is expected to contain objects like:
		// { genre: string, url: string, thunk: function }
		let selectedConfigArray = null;

		// Choose which config array to use based on the current route segment.
		// This is purely local logic (not Redux).
		switch (slicedUrl) {
			case "browse":
			case "movies":
				// For "browse" or "movies", fetch from the movies config set.
				selectedConfigArray = fetchMovieDataConfig;
				break;
			case "tvseries":
				// For tv series routes, fetch from the series config set.
				selectedConfigArray = fetchSeriesDataConfig;
				break;
			case "popular":
				// For popular routes, fetch from the popular config set.
				selectedConfigArray = fetchPopularDataConfig;
				break;
			default:
				// If slicedUrl doesn't match expected values, selectedConfigArray stays null.
				// (In that case, the code below would fail if executed; this hook assumes valid inputs.)
				break;
		}

		// From the chosen config array, pick the entry whose genre matches the selected categoryName.
		// filter() returns an array; destructuring grabs the first matching entry.
		const [data] = selectedConfigArray.filter(el => el.genre === categoryName);

		// Dispatch the thunk associated with this config entry to fetch API data for this category/page.
		// This thunk likely performs async work (fetch) and then dispatches success/failure actions
		// that update Redux state used by UI components elsewhere.
		dispatch(data.thunk(`${data.url}&page=${page}`));

		// Store the selected config entry locally so the caller knows which category config is active.
		// This is local state (categoryData), not the fetched results.
		setCategoryData(data);

		// Re-run this effect when any dependency changes:
		// - dispatch: stable in practice but included for lint rule completeness
		// - categoryName: user changes selected genre/category
		// - slicedUrl: user navigates to a different section (movies/tvseries/popular)
		// - page: user paginates
	}, [dispatch, categoryName, slicedUrl, page])

	// Return the selected config entry (metadata about the selection),
	// not the API response data itself.
	return categoryData;
}