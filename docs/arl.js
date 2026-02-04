"use strict";

window.addEventListener("DOMContentLoaded", async () => {
	const es = Object.freeze((() => {
		const elems = {};
		document.querySelectorAll("[id]").forEach((elem) => {
			elems[elem.id] = elem;
		});
		return elems;
	})());

	const data = await (async () => {
		try {
			const dataResponse = await fetch("data.json");
			if (!dataResponse.ok) throw new Error("unexpected status: " + dataResponse.status);
			return await dataResponse.json();
		} catch (error) {
			console.error(error);
			alert("データの読み込みに失敗しました。");
			return null;
		}
	})();
	if (!data) return;

	es.versionDisplay.textContent = data.version;
	data.songs.forEach((songCategory, categoryIndex) => {
		const categoryId = `song-category-${categoryIndex}`;
		const categoryLabel = document.createElement("label");
		const categoryCheck = document.createElement("input");
		categoryLabel.appendChild(categoryCheck);
		categoryLabel.appendChild(document.createTextNode(songCategory.name));
		es.songCategory.appendChild(categoryLabel);
		categoryLabel.setAttribute("for", categoryId);
		categoryCheck.setAttribute("id", categoryId);
		categoryCheck.setAttribute("type", "checkbox");
		categoryCheck.checked = true;
		const categoryTitle = document.createElement("div");
		categoryTitle.classList.add("detailTitle");
		categoryTitle.appendChild(document.createTextNode(songCategory.name));
		es.songChooser.appendChild(categoryTitle);
		const categoryList = document.createElement("div");
		categoryList.classList.add("detailList");
		es.songChooser.appendChild(categoryList);
		songCategory.songs.forEach((song, songIndex) => {
			if (songIndex > 0) categoryList.appendChild(document.createElement("br"));
			const songId = `song-${categoryIndex}-${songIndex}`;
			const songLabel = document.createElement("label");
			const songCheck = document.createElement("input");
			songLabel.appendChild(songCheck);
			songLabel.appendChild(document.createTextNode(song.name));
			categoryList.appendChild(songLabel);
			songLabel.setAttribute("for", songId);
			songCheck.setAttribute("id", songId);
			songCheck.setAttribute("type", "checkbox");
			songCheck.checked = true;
		});
	});
	data.idols.forEach((idolCategory, categoryIndex) => {
		const categoryId = `idol-category-${categoryIndex}`;
		const categoryLabel = document.createElement("label");
		const categoryCheck = document.createElement("input");
		categoryLabel.appendChild(categoryCheck);
		categoryLabel.appendChild(document.createTextNode(idolCategory.shortName));
		es.idolCategory.appendChild(categoryLabel);
		categoryLabel.setAttribute("for", categoryId);
		categoryCheck.setAttribute("id", categoryId);
		categoryCheck.setAttribute("type", "checkbox");
		categoryCheck.checked = true;
		const categoryTitle = document.createElement("div");
		categoryTitle.classList.add("detailTitle");
		categoryTitle.appendChild(document.createTextNode(idolCategory.name));
		es.idolChooser.appendChild(categoryTitle);
		const categoryList = document.createElement("div");
		categoryList.classList.add("detailList");
		es.idolChooser.appendChild(categoryList);
		idolCategory.idols.forEach((idol, idolIndex) => {
			if (idolIndex > 0) categoryList.appendChild(document.createElement("br"));
			const idolId = `idol-${categoryIndex}-${idolIndex}`;
			const idolLabel = document.createElement("label");
			const idolCheck = document.createElement("input");
			idolLabel.appendChild(idolCheck);
			idolLabel.appendChild(document.createTextNode(idol.name));
			categoryList.appendChild(idolLabel);
			idolLabel.setAttribute("for", idolId);
			idolCheck.setAttribute("id", idolId);
			idolCheck.setAttribute("type", "checkbox");
			idolCheck.checked = true;
		});
	});
});
