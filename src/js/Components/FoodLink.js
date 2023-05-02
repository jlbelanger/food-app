import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

export default function FoodLink({ food }) {
	return (
		<Link className={`table-link${food.is_verified ? ' verifiable' : ''}`} to={`/food/${food.id}`}>
			{food.is_verified ? (
				<>
					<span className="verified-text">{food.name}</span>
					{'\u00a0'}
					<span className="verified-icon" aria-label="Verified">{'\u2713'}</span>
				</>
			) : food.name}
		</Link>
	);
}

FoodLink.propTypes = {
	food: PropTypes.object.isRequired,
};
