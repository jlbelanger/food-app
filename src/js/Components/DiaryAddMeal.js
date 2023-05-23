import { Alert, Api, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import { errorMessageText } from '../Utilities/Helpers';
import PropTypes from 'prop-types';

export default function DiaryAddMeal({ date, entries, foodFields, setActionError, setEntries }) {
	const { addToast } = useContext(FormosaContext);
	const [meals, setMeals] = useState([]);
	const [mealsError, setMealsError] = useState(false);

	useEffect(() => {
		Api.get('meals?fields[meals]=name&filter[is_favourite][eq]=1&sort=name')
			.catch((response) => {
				setMealsError(errorMessageText(response));
			})
			.then((response) => {
				if (!response) {
					return;
				}
				setMeals(response);
			});
	}, []);

	if (mealsError) {
		return (
			<Alert type="error">Error getting meals.</Alert>
		);
	}

	if (meals.length <= 0) {
		return null;
	}

	const addMeal = (e) => {
		setActionError(false);
		Api.post(`meals/${e.target.getAttribute('data-id')}/add`, JSON.stringify({ date, fields: foodFields }))
			.catch((response) => {
				setActionError(errorMessageText(response));
			})
			.then((response) => {
				if (!response) {
					return;
				}
				addToast('Meal added successfully.', 'success');
				setEntries([...entries].concat(response));
			});
	};

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

DiaryAddMeal.propTypes = {
	date: PropTypes.string.isRequired,
	entries: PropTypes.array.isRequired,
	foodFields: PropTypes.array.isRequired,
	setActionError: PropTypes.func.isRequired,
	setEntries: PropTypes.func.isRequired,
};
