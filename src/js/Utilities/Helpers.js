import Auth from './Auth';
import { ReactComponent as CheckIcon } from '../../svg/check.svg';
import { Link } from 'react-router-dom';
import React from 'react';

export const afterSubmitFailure = (error) => {
	if (error.status === 401) {
		Auth.logout(error.status);
	}
};

export const errorMessageText = (response, logout = true) => {
	if (logout && response.status === 401) {
		return Auth.logout(response.status);
	}
	return `Error: ${response.errors.map((e) => (e.title)).join(' ')}`;
};

export const pad = (n, width = 2, z = '0') => {
	z = z || '0';
	n = n.toString();
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

export const pluralize = (servingUnits, servingSize) => {
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
		cherry: 'cherries',
		leaf: 'leaves',
		pastry: 'pastries',
		patty: 'patties',
	};
	if (Object.prototype.hasOwnProperty.call(specialPluralize, servingUnits)) {
		return specialPluralize[servingUnits];
	}

	return `${servingUnits}s`;
};

export const prettyDate = (date, weekday = 'short') => {
	const options = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	};
	if (weekday) {
		options.weekday = weekday;
	}
	return new Date(`${date}T12:00:00Z`).toLocaleString('en-CA', options);
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

export const foodLabelLinkFn = (food) => (
	<Link to={`/food/${food.id}`}>
		{food.name}
		{food.is_verified && <CheckIcon alt="Verified" className="verified" height={16} width={16} />}
	</Link>
);
