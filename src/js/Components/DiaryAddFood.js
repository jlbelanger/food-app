import { Field, Form } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import Auth from '../Utilities/Auth';
import { foodLabelFn } from '../Utilities/Helpers';
import { ReactComponent as PlusIcon } from '../../svg/plus.svg';
import PropTypes from 'prop-types';

export default function DiaryAddFood({ date, entries, favouriteFood, food, setEntries }) {
	const [row, setRow] = useState({ date });
	const [favouritesOnly, setFavouritesOnly] = useState(Auth.getValue('favourites_only', false));

	return (
		<Form
			afterSubmit={(response) => {
				const newEntries = [...entries];
				newEntries.push({ ...response, food: row.food });
				setEntries(newEntries);
				setRow({ ...row, food: null });
				setTimeout(() => {
					document.getElementById('food').focus();
				}, 100);
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
					labelFn={foodLabelFn}
					max={1}
					name="food"
					options={favouritesOnly ? favouriteFood : food}
					optionLabelFn={foodLabelFn}
					placeholder="Search food"
					postfix={(
						<button className="formosa-button formosa-postfix button--secondary button--icon" id="add-food" type="submit">
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
	entries: PropTypes.array.isRequired,
	favouriteFood: PropTypes.array.isRequired,
	food: PropTypes.array.isRequired,
	setEntries: PropTypes.func.isRequired,
};
