import { Api, Field } from '@jlbelanger/formosa';
import { foodLabelFn, foodLabelLinkFn, pluralize } from '../../Utilities/Helpers';
import { Link, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import MetaTitle from '../../Components/MetaTitle';
import MyForm from '../../Components/MyForm';

export default function Edit() {
	const { id } = useParams();
	const [row, setRow] = useState(null);
	const [error, setError] = useState(false);
	const [favouritesOnly, setFavouritesOnly] = useState(Auth.getValue('favourites_only', false));
	const [favouriteFood, setFavouriteFood] = useState([]);
	const [food, setFood] = useState([]);
	const foodFields = ['name', 'serving_units', 'is_verified'];

	useEffect(() => {
		Api.get(`entries/${id}?include=food&fields[food]=${foodFields.join(',')}`)
			.then((response) => {
				setRow(response);
			})
			.catch((response) => {
				setError(response.status);
			});

		Api.get(`food?fields[food]=${foodFields.concat(['is_favourite']).join(',')}`)
			.then((response) => {
				setFood(response);
				setFavouriteFood(response.filter((r) => (r.is_favourite)));
			})
			.catch(() => {
				setError(true);
			});
	}, [id]);

	if (error) {
		return (
			<Error status={error} />
		);
	}

	if (row === null) {
		return (
			<MetaTitle title="Edit entry" />
		);
	}

	return (
		<>
			<MetaTitle title="Edit entry">
				<button className="formosa-button button--small" form="edit-form" type="submit">Save</button>
			</MetaTitle>

			<MyForm
				className="formosa-responsive"
				htmlId="edit-form"
				id={id}
				method="PUT"
				path="entries"
				preventEmptyRequest
				relationshipNames={['food']}
				row={row}
				setRow={setRow}
				successToastText="Entry saved successfully."
			>
				<Field
					className={row.date ? 'formosa-prefix' : ''}
					label="Date"
					maxLength={10}
					name="date"
					postfix={row.date ? (
						<Link className="formosa-button formosa-postfix" to={`/?date=${row.date}`}>Go</Link>
					) : null}
					required
					size={10}
					type="date"
				/>
				<Field
					label="Food"
					labelFn={foodLabelLinkFn}
					max={1}
					name="food"
					options={favouritesOnly ? favouriteFood : food}
					optionLabelFn={foodLabelFn}
					placeholder="Search food"
					postfix={(
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
					)}
					required
					type="autocomplete"
				/>
				<Field
					inputMode="decimal"
					label="Serving size"
					name="user_serving_size"
					required
					size={6}
					suffix={pluralize(row.food.serving_units, row.user_serving_size)}
				/>
			</MyForm>
		</>
	);
}
