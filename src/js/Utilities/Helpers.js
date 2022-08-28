export const pluralize = (servingUnits, servingSize) => { // eslint-disable-line import/prefer-default-export
	if (!servingUnits) {
		return '';
	}

	if (servingSize.toString() === '1' || servingSize === '') {
		return servingUnits;
	}

	const doNotPluralize = [
		'',
		'g',
		'ml',
		'oz',
		'tbsp',
		'tsp',
	];
	if (doNotPluralize.includes(servingUnits)) {
		return servingUnits;
	}

	const esPluralize = [
		'box',
		'dash',
		'dish',
		'inch',
		'potato',
		'pouch',
		'sandwich',
		'tomato',
	];
	if (esPluralize.includes(servingUnits)) {
		return `${servingUnits}es`;
	}

	const specialPluralize = {
		leaf: 'leaves',
		pastry: 'pastries',
		patty: 'patties',
	};
	if (Object.prototype.hasOwnProperty.call(specialPluralize, servingUnits)) {
		return specialPluralize[servingUnits];
	}

	return `${servingUnits}s`;
};
