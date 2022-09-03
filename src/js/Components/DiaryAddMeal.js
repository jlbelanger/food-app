import { Api, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function DiaryMeals({ date, diary, foodFields, setDiary }) {
	const { formosaState } = useContext(FormosaContext);
	const [meals, setMeals] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		Api.get('meals?fields[meals]=name&filter[is_favourite][eq]=1&sort=name')
			.then((response) => {
				setMeals(response);
			})
			.catch(() => {
				setError(true);
			});
	}, []);

	const addMeal = (e) => {
		Api.post(`meals/${e.target.getAttribute('data-id')}/add`, JSON.stringify({ date, fields: foodFields }))
			.then((response) => {
				formosaState.addToast('Meal added successfully.', 'success');
				setDiary({
					...diary,
					entries: [...diary.entries].concat(response),
				});
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				formosaState.addToast(text, 'error', 10000);
			});
	};

	if (error) {
		return (
			<p className="formosa-message formosa-message--error">Error getting weight.</p>
		);
	}

	if (meals.length <= 0) {
		return null;
	}

	return (
		<fieldset id="add-meal">
			<legend>Add meal</legend>
			{meals.map((meal) => (
				<button className="formosa-button add-meal__button" data-id={meal.id} key={meal.id} onClick={addMeal} type="button">
					{meal.name}
				</button>
			))}
		</fieldset>
	);
}

DiaryMeals.propTypes = {
	date: PropTypes.string.isRequired,
	diary: PropTypes.object.isRequired,
	foodFields: PropTypes.array.isRequired,
	setDiary: PropTypes.func.isRequired,
};
