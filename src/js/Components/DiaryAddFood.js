import { Api, Field, Form } from '@jlbelanger/formosa';
import React, { useEffect, useState } from 'react';
import Auth from '../Utilities/Auth';
import { ReactComponent as PlusIcon } from '../../svg/plus.svg';
import PropTypes from 'prop-types';

export default function DiaryAddFood({ date, diary, foodFields, setDiary }) {
	const [row, setRow] = useState({ date });
	const [error, setError] = useState(false);
	const [favouritesOnly, setFavouritesOnly] = useState(Auth.getValue('favourites_only'));
	const [favouriteFood, setFavouriteFood] = useState([]);
	const [food, setFood] = useState([]);

	useEffect(() => {
		Api.get(`food?fields[food]=${foodFields.concat(['is_favourite']).join(',')}`)
			.then((response) => {
				setFood(response);
				setFavouriteFood(response.filter((r) => (r.is_favourite)));
			})
			.catch(() => {
				setError(true);
			});
	}, []);

	if (error) {
		return (
			<p className="formosa-message formosa-message--error form">Error getting food.</p>
		);
	}

	return (
		<Form
			afterSubmit={(response) => {
				const newEntries = [...diary.entries];
				newEntries.push({ ...response, food: row.food });
				setDiary({ ...diary, entries: newEntries });
				setRow({ ...row, food: null });
			}}
			className="form"
			htmlId="food-form"
			method="POST"
			path="entries"
			preventEmptyRequest
			relationshipNames={['food']}
			row={row}
			setRow={setRow}
			successToastText="Food added successfully."
		>
			<fieldset>
				<legend>Add food</legend>
				<Field
					afterAdd={() => {
						setTimeout(() => {
							document.getElementById('add-food').click();
						});
					}}
					className="formosa-prefix"
					inputInnerWrapperClassName="flex"
					max={1}
					name="food"
					options={favouritesOnly ? favouriteFood : food}
					placeholder="Search food"
					postfix={(
						<button className="formosa-button formosa-postfix button--icon" id="add-food" type="submit">
							Add
							<PlusIcon height={16} width={16} />
						</button>
					)}
					type="autocomplete"
				/>
				<Field
					id="search-favourites"
					label="Search favourite foods only"
					labelPosition="after"
					setValue={(newValue) => {
						Auth.setValue('favourites_only', newValue);
						setFavouritesOnly(newValue);
					}}
					type="checkbox"
					value={favouritesOnly}
				/>
			</fieldset>
		</Form>
	);
}

DiaryAddFood.propTypes = {
	date: PropTypes.string.isRequired,
	diary: PropTypes.object.isRequired,
	foodFields: PropTypes.array.isRequired,
	setDiary: PropTypes.func.isRequired,
};
