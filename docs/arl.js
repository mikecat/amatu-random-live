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

	const songCategoryObjects = [];
	const songObjects = [];
	const idolCategoryObjects = [];
	const idolObjects = [];

	es.versionDisplay.textContent = data.version;
	data.songs.forEach((songCategory, categoryIndex) => {
		// カテゴリ選択のチェックボックスを作る
		const categoryId = `song-category-${categoryIndex}`;
		const categoryLabel = document.createElement("label");
		const categoryCheck = document.createElement("input");
		categoryLabel.appendChild(categoryCheck);
		categoryLabel.appendChild(document.createTextNode(songCategory.name));
		es.songCategory.appendChild(categoryLabel);
		categoryLabel.setAttribute("for", categoryId);
		categoryCheck.setAttribute("id", categoryId);
		categoryCheck.setAttribute("type", "checkbox");
		// カテゴリオブジェクトを作る
		const categorySongs = [];
		const categoryObject = {
			name: songCategory.name,
			tags: songCategory.tags,
			checkBox: categoryCheck,
			details: categorySongs,
		};
		songCategoryObjects.push(categoryObject);
		// 個別選択のチェックボックスを作る
		const categoryTitle = document.createElement("div");
		categoryTitle.classList.add("detailTitle");
		categoryTitle.appendChild(document.createTextNode(songCategory.name));
		es.songChooser.appendChild(categoryTitle);
		const categoryList = document.createElement("div");
		categoryList.classList.add("detailList");
		es.songChooser.appendChild(categoryList);
		songCategory.songs.forEach((song, songIndex) => {
			// チェックボックスを作る
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
			// 個別オブジェクトを作る
			const songObject = {
				name: song.name,
				id: song.id,
				checkBox: songCheck,
				category: categoryObject,
			};
			categorySongs.push(songObject);
			songObjects.push(songObject);
		});
	});
	data.idols.forEach((idolCategory, categoryIndex) => {
		// カテゴリ選択のチェックボックスを作る
		const categoryId = `idol-category-${categoryIndex}`;
		const categoryLabel = document.createElement("label");
		const categoryCheck = document.createElement("input");
		categoryLabel.appendChild(categoryCheck);
		categoryLabel.appendChild(document.createTextNode(idolCategory.shortName));
		es.idolCategory.appendChild(categoryLabel);
		categoryLabel.setAttribute("for", categoryId);
		categoryCheck.setAttribute("id", categoryId);
		categoryCheck.setAttribute("type", "checkbox");
		// カテゴリオブジェクトを作る
		const categoryIdols = [];
		const categoryObject = {
			name: idolCategory.name,
			tags: new Set(idolCategory.tags),
			checkBox: categoryCheck,
			details: categoryIdols,
		};
		idolCategoryObjects.push(categoryObject);
		// 個別選択のチェックボックスを作る
		const categoryTitle = document.createElement("div");
		categoryTitle.classList.add("detailTitle");
		categoryTitle.appendChild(document.createTextNode(idolCategory.name));
		es.idolChooser.appendChild(categoryTitle);
		const categoryList = document.createElement("div");
		categoryList.classList.add("detailList");
		es.idolChooser.appendChild(categoryList);
		idolCategory.idols.forEach((idol, idolIndex) => {
			// チェックボックスを作る
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
			// 個別オブジェクトを作る
			const idolObject = {
				name: idol.name,
				id: idol.id,
				checkBox: idolCheck,
				category: categoryObject,
			};
			categoryIdols.push(idolObject);
			idolObjects.push(idolObject);
		});
	});

	// カテゴリチェックの状態を、個別チェックに反映する
	const categoryToDetail = (categoryObject) => {
		categoryObject.details.forEach((detailObject) => {
			detailObject.checkBox.checked = categoryObject.checkBox.checked;
		});
		categoryObject.checkBox.indeterminate = false;
	};
	// 個別チェックの状態を、カテゴリチェックに反映する
	const detailToCategory = (categoryObject) => {
		const isChecked = (detailObject) => detailObject.checkBox.checked;
		const allChecked = categoryObject.details.every(isChecked);
		if (allChecked) {
			categoryObject.checkBox.checked = true;
			categoryObject.checkBox.indeterminate = false;
		} else {
			const someChecked = categoryObject.details.some(isChecked);
			categoryObject.checkBox.checked = someChecked;
			categoryObject.checkBox.indeterminate = someChecked;
		}
	};

	// localStorage からチェック状態を読み込む
	const LOCAL_STORAGE_KEY = "amatu-random-live-b65e3e02-4adb-428d-9876-8fa83a760863";
	let disableLocalStorage = false;
	try {
		const data = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (data !== null) {
			const dataParsed = JSON.parse(data);
			if (dataParsed) {
				if (typeof dataParsed.candidates === "object" && dataParsed.candidates !== null) {
					const candidatesMap = new Map();
					Object.entries(dataParsed.candidates).forEach(([key, value]) => {
						candidatesMap.set(key, value);
					});
					songObjects.concat(idolObjects).forEach((detailObject) => {
						const checked = candidatesMap.get(detailObject.id);
						if (typeof checked === "boolean") {
							detailObject.checkBox.checked = checked;
						}
					});
				}
				if (typeof dataParsed.options === "object" && dataParsed.options !== null) {
					const options = dataParsed.options;
					if (typeof options.playEffect === "boolean") {
						es.playEffect.checked = options.playEffect;
					}
				}
			}
		}
	} catch (error) {
		console.warn(error);
		disableLocalStorage = true;
	}

	// localStorage にチェック状態を書き込む
	const saveChecksToLocalStorage = () => {
		if (disableLocalStorage) return;
		try {
			const candidates = {};
			songObjects.concat(idolObjects).forEach((detailObject) => {
				candidates[detailObject.id] = detailObject.checkBox.checked;
			});
			localStorage.setItem(
				LOCAL_STORAGE_KEY,
				JSON.stringify({
					candidates,
					options: {
						playEffect: es.playEffect.checked,
					},
				}),
			);
		} catch (error) {
			console.warn(error);
		}
	};

	const buildCandidatesToPick = () => {
		// TODO
		es.pickButton.disabled = false; // TODO: 候補がある場合のみ有効化する
	};

	songCategoryObjects.concat(idolCategoryObjects).forEach((categoryObject) => {
		detailToCategory(categoryObject);
		categoryObject.checkBox.addEventListener("change", () => {
			categoryToDetail(categoryObject);
			buildCandidatesToPick();
			saveChecksToLocalStorage();
		});
	});
	songObjects.concat(idolObjects).forEach((detailObject) => {
		detailObject.checkBox.addEventListener("change", () => {
			detailToCategory(detailObject.category);
			buildCandidatesToPick();
			saveChecksToLocalStorage();
		});
	});
	es.playEffect.addEventListener("change", () => {
		saveChecksToLocalStorage();
	});

	// 読み込みが完了したので、操作を解禁する
	es.songWrapper.disabled = false;
	es.idolWrapper.disabled = false;
	buildCandidatesToPick();
});
