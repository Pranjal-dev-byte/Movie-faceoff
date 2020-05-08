const createAutoComplete = ({ root, renderedOption, onInputValue, onItemSelect, request }) => {
	root.innerHTML = `
	<div class="outline">
    <label for="input"><b>Search: </b></label> 
	<input type="text" id="input">
    <div class="dropdown">
    <div class="dropdown-menu">
    <div class="dropdown-content result">
    </div>
    </div>    
    </div>
    </div>
    `;

	const input = root.querySelector('input');
	const dropdown = root.querySelector('.dropdown');
	const resultWrapper = root.querySelector('.dropdown-content');
	const onInput = async (e) => {
		const items = await request(e.target.value);
		if (!items.length) {
			dropdown.classList.remove('is-active');
			return;
		}
		resultWrapper.innerHTML = '';
		dropdown.classList.add('is-active');
		for (let item of items) {
			const options = document.createElement('a');
			options.classList.add('dropdown-item');
			options.innerHTML = renderedOption(item);
			resultWrapper.append(options);
			options.addEventListener('click', () => {
				dropdown.classList.remove('is-active');
				input.value = onInputValue(item);
				onItemSelect(item);
			});
		}
	};

	input.addEventListener('input', debounce(onInput, 500));

	document.addEventListener('click', (e) => {
		if (!root.contains(e.target)) {
			dropdown.classList.remove('is-active');
		}
	});
};
