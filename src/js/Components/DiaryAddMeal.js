import { Api, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function DiaryMeals({ date, entries, foodFields, setEntries }) {
	const { addToast } = useContext(FormosaContext);
	const [meals, setMeals] = useState([]);
	const [error, setError] = useState(false);

	useEffect(() => {
		Api.get('meals?fields[meals]=name&filter[is_favourite][eq]=1&sort=name')
			.catch((response) => {
				setError(response);
				throw response;
			})
			.then((response) => {
				setMeals(response);
			});
	}, []);

	const addMeal = (e) => {
		Api.post(`meals/${e.target.getAttribute('data-id')}/add`, JSON.stringify({ date, fields: foodFields }))
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
				throw response;
			})
			.then((response) => {
				addToast('Meal added successfully.', 'success');
				setEntries([...entries].concat(response));
			});
	};

	if (error) {
		return (
			<p className="formosa-message formosa-message--error">Error getting meals.</p>
		);
	}

	if (meals.length <= 0) {
		return null;
	}

	return (
		<fieldset id="add-meal">
			<legend>Add meal</legend>
			{meals.map((meal) => (
				<button className="formosa-button add-meal__button button--secondary" data-id={meal.id} key={meal.id} onClick={addMeal} type="button">
					{meal.name}
				</button>
			))}
		</fieldset>
	);
}

DiaryMeals.propTypes = {
	date: PropTypes.string.isRequired,
	entries: PropTypes.array.isRequired,
	foodFields: PropTypes.array.isRequired,
	setEntries: PropTypes.func.isRequired,
};
