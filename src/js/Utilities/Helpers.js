import Auth from './Auth';
import { ReactComponent as CheckIcon } from '../../svg/check.svg';
import React from 'react';

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

export const mapTrackables = (response) => (
	Auth.trackables().map((slug) => (response.find((t) => (slug === t.slug))))
);

export const foodLabelFn = (food) => (
	<>
		{food.name}
		{food.is_verified && <CheckIcon alt="Verified" className="verified" height={16} width={16} />}
	</>
);
