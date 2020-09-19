const autoCompleteConfig = {
	renderedOption(item) {
		const notif = document.body.querySelector('.notification');
		notif.classList.add('is-hidden');
		const imgSrc = item.Poster === 'N/A' ? '' : item.Poster;
		return `<img src="${imgSrc}">
			${item.Title} (${item.Year})
        `;
	},
	onInputValue(item) {
		return item.Title;
	},
	async request(searchItem) {
		const response = await axios.get('https://www.omdbapi.com/', {
			params: {
				apikey: '803b9f83',
				s: searchItem
			}
		});
		if (response.data.Error) {
			return [];
		}
		return response.data.Search;
	}
};

createAutoComplete({
	root: document.body.querySelector('.left-autocomplete'),
	...autoCompleteConfig,
	onItemSelect(item) {
		itemInfo(item, document.body.querySelector('#left-summary'), 'left');
	}
});

createAutoComplete({
	root: document.body.querySelector('.right-autocomplete'),
	...autoCompleteConfig,
	onItemSelect(item) {
		itemInfo(item, document.body.querySelector('#right-summary'), 'right');
	}
});

let leftMovie;
let rightMovie;
const itemInfo = async (item, summaryDetail, side) => {
	const res = await axios.get('https://www.omdbapi.com/', {
		params: {
			apikey: '803b9f83',
			i: item.imdbID
		}
	});
	summaryDetail.innerHTML = itemTemplate(res.data);
	if (side === 'left') {
		leftMovie = res.data;
	} else {
		rightMovie = res.data;
	}
	if (leftMovie && rightMovie) {
		compareInfo();
	}
};
const compareInfo = () => {
	const leftSide = document.querySelectorAll('#left-summary .collection');
	const rightSide = document.querySelectorAll('#right-summary .collection');
	leftSide.forEach((leftStat, index) => {
		const rightStat = rightSide[index];
		const leftSideValue = parseFloat(leftStat.dataset.value);
		const rightSideValue = parseFloat(rightStat.dataset.value);
		if (leftSideValue && rightSideValue && !(rightSideValue === leftSideValue)) {
			if (leftSideValue > rightSideValue) {
				rightStat.classList.remove('.collection');
				rightStat.classList.add('is-loser');
			} else {
				leftStat.classList.remove('.collection');
				leftStat.classList.add('is-loser');
			}
		}
	});
};
let rotten;
const itemTemplate = (itemDetail) => {
	if (itemDetail.Ratings.length < 2) {
		rotten = 'NaN';
	} else {
		rotten = itemDetail.Ratings[1].Value;
	}
	const boxOffice = parseInt(itemDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
	const tomatoes = parseInt(rotten.replace(/%/g, ''));
	const imdb = parseFloat(itemDetail.imdbRating);
	const meta = parseInt(itemDetail.Metascore);
	const awards = itemDetail.Awards.split(' ').reduce((prev, word) => {
		const value = parseInt(word);
		if (isNaN(value)) {
			return prev;
		} else {
			return word;
		}
	}, 0);

	return `
		<article class="media">
		<figure class="media-left">
		<p><img class="poster" src="${itemDetail.Poster}"</p>
		</figure>
		<div class="media-content">
		<div class="content">
		<h2>${itemDetail.Title}</h2>
		<h4>${itemDetail.Genre}</h4>
		</div>
		<p>${itemDetail.Plot}</p>
		</div>
		</article>
		<article class="notif is-neccessary">
		<div data-value="${awards}"class="collection row-1">
		<h2>${itemDetail.Awards}</h2>
		<p>Awards</p>
		</div>
		<div data-value="${boxOffice}"class="collection row-1">
		<h2>${itemDetail.BoxOffice}</h2>
		<p>Box office collection</p>
		</div>
		<div data-value="${meta}"class="collection row-2">
		<h2>${itemDetail.Metascore}</h2>
		<p>The Metascore</p>
		</div>
		<div data-value="${tomatoes}"class="collection row-3">
		<h2>${rotten}</h2>
		<p>Rotten Tomatoes </p>
		</div>
		<div data-value="${imdb}"class="collection row-4">
		<h2>${itemDetail.imdbRating}</h2>
		<p>IMDB Rating</p>
		</div>
		</article>
	`;
};
