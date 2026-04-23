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

	const candidatesToPick = [];

	// ランダム選択の候補リストを構築する
	const buildCandidatesToPick = () => {
		candidatesToPick.splice(0);
		songCategoryObjects.forEach((songCategory) => {
			// この曲カテゴリで選べるアイドルのリストを構築する
			const candidateIdols = [];
			idolCategoryObjects.forEach((idolCategory) => {
				// 曲カテゴリのタグとアイドルカテゴリのタグに共通部分がある場合のみ、使用可能
				if (songCategory.tags.some((tag) => idolCategory.tags.has(tag))) {
					// カテゴリ内のアイドルについて、有効化状態をチェックする
					idolCategory.details.forEach((idol) => {
						if (idol.checkBox.checked) candidateIdols.push(idol.name);
					});
				}
			});
			// 選べるアイドルが3人以上の場合のみ、この曲カテゴリの曲を候補にする
			if (candidateIdols.length >= 3) {
				songCategory.details.forEach((song) => {
					if (song.checkBox.checked) {
						candidatesToPick.push({
							songName: song.name,
							idols: candidateIdols,
						});
					}
				});
			}
		});
		// 選べる曲がある場合のみ、抽選ボタンを有効化する
		es.pickButton.disabled = candidatesToPick.length === 0;
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

	const randUint32 = () => {
		if (crypto && crypto.getRandomValues) {
			const ua = new Uint32Array(1);
			crypto.getRandomValues(ua);
			return ua[0];
		} else {
			return (Math.random() * 0x100000000) >>> 0;
		}
	};

	// [0, maxValue) のランダムな整数を返す (0 < maxValue <= 0x100000000)
	const randInt = (maxValue) => {
		const numDrop = 0x100000000 - 0x100000000 % maxValue;
		for (;;) {
			const value = randUint32();
			if (value < numDrop) return value % maxValue;
		}
	};

	// [0, maxValue) の適当な整数を返す
	const randIntSimple = (maxValue) => {
		return Math.floor(Math.random() * maxValue);
	};

	let pickResult = null;
	let animationStartTime = null;
	let animationPrevCount = 0;

	const pickResultAnimation = () => {
		const currentTime = performance.now() - animationStartTime;
		const currentCount = Math.floor(currentTime / 100);
		if (currentCount !== animationPrevCount) {
			const randomSong = currentCount < 10
				? candidatesToPick[randIntSimple(candidatesToPick.length)]
				: pickResult.song;
			let idolCandidates = randomSong.idols;
			const centerIdol = currentCount < 20
				? idolCandidates[randIntSimple(idolCandidates.length)]
				: pickResult.idols.center;
			idolCandidates = idolCandidates.filter((e) => e !== centerIdol);
			const leftIdol = currentCount < 23
				? idolCandidates[randIntSimple(idolCandidates.length)]
				: pickResult.idols.left;
			idolCandidates = idolCandidates.filter((e) => e !== leftIdol);
			const rightIdol = currentCount < 26
				? idolCandidates[randIntSimple(idolCandidates.length)]
				: pickResult.idols.right;
			es.resultSong.textContent = randomSong.songName;
			es.resultLeft.textContent = leftIdol;
			es.resultCenter.textContent = centerIdol;
			es.resultRight.textContent = rightIdol;
		}
		if (currentCount < 26) {
			requestAnimationFrame(pickResultAnimation);
		} else {
			animationStartTime = null;
			es.songWrapper.disabled = false;
			es.idolWrapper.disabled = false;
			es.pickButton.disabled = false;
			es.playEffect.disabled = false;
			es.postButton.disabled = false;
		}
	};

	es.pickButton.addEventListener("click", () => {
		if (candidatesToPick.length === 0 || animationStartTime !== null) return;
		const song = candidatesToPick[randInt(candidatesToPick.length)];
		const idolCandidates = song.idols.concat();
		const idolPicked = [];
		for (let i = 0; i < 3; i++) {
			const pickedIndex = randInt(idolCandidates.length);
			idolPicked.push(idolCandidates[pickedIndex]);
			idolCandidates.splice(pickedIndex, 1);
		}
		pickResult = {
			song: song,
			idols: {
				left: idolPicked[0],
				center: idolPicked[1],
				right: idolPicked[2],
			},
		};
		if (es.playEffect.checked) {
			es.songWrapper.disabled = true;
			es.idolWrapper.disabled = true;
			es.pickButton.disabled = true;
			es.playEffect.disabled = true;
			es.postButton.disabled = true;
			animationStartTime = performance.now();
			animationPrevCount = -1;
			requestAnimationFrame(pickResultAnimation);
		} else {
			es.resultSong.textContent = pickResult.song.songName;
			es.resultLeft.textContent = pickResult.idols.left;
			es.resultCenter.textContent = pickResult.idols.center;
			es.resultRight.textContent = pickResult.idols.right;
			es.postButton.disabled = false;
		}
	});

	es.postButton.addEventListener("click", () => {
		if (pickResult === null) return;
		const appUrl = location.origin + location.pathname;
		const postText =
			"楽曲：" + pickResult.song.songName + "\n\n" +
			"レフト：" + pickResult.idols.left + "\n" +
			"センター：" + pickResult.idols.center + "\n" +
			"ライト：" + pickResult.idols.right + "\n\n" +
			"#あまつランダムライブ\n" +
			appUrl + "\n";
		const intentUrl = new URL("https://x.com/intent/tweet");
		intentUrl.searchParams.append("text", postText.replace(/@/g, "@\u200b"));
		window.open(intentUrl.href, "_blank","noopener");
	});

	// 読み込みが完了したので、操作を解禁する
	es.songWrapper.disabled = false;
	es.idolWrapper.disabled = false;
	es.playEffect.disabled = false;
	buildCandidatesToPick();
});
