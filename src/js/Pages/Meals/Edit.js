import { Api, Field, FormosaContext, Input } from '@jlbelanger/formosa';
import { foodLabelFn, mapTrackables, pluralize } from '../../Utilities/Helpers';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import Fields from './Partials/Fields';
import FoodLink from '../../Components/FoodLink';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import MetaTitle from '../../Components/MetaTitle';
import MyForm from '../../Components/MyForm';
import TrackableBody from '../../Components/TrackableBody';
import TrackableFoot from '../../Components/TrackableFoot';
import TrackableHead from '../../Components/TrackableHead';
import { v4 as uuidv4 } from 'uuid';
import { ReactComponent as XIcon } from '../../../svg/x.svg';

export default function Edit() {
	const { addToast } = useContext(FormosaContext);
	const { id } = useParams();
	const [row, setRow] = useState(null);
	const [allFood, setAllFood] = useState([]);
	const [trackables, setTrackables] = useState([]);
	const [errorFood, setErrorFood] = useState(false);
	const [error, setError] = useState(false);
	const [newFood, setNewFood] = useState(null);
	const history = useHistory();
	const foodFields = ['name', 'slug', 'serving_size', 'serving_units', 'is_verified'].concat(Auth.trackables());

	useEffect(() => {
		Api.get(`meals/${id}?include=foods,foods.food&fields[food]=${foodFields.join(',')}&fields[food_meal]=user_serving_size`)
			.then((response) => {
				setRow(response);
			})
			.catch((response) => {
				setError(response.status);
			});

		Api.get(`food?fields[food]=${foodFields.join(',')}`)
			.then((response) => {
				setAllFood(response);
			})
			.catch((response) => {
				setErrorFood(response.status);
			});

		if (Auth.hasTrackables()) {
			Api.get(`trackables?fields[trackables]=name,slug,units&filter[slug][in]=${Auth.trackables().join(',')}`)
				.then((response) => {
					setTrackables(mapTrackables(response));
				});
		}
	}, [id]);

	if (error) {
		return (
			<Error status={error} />
		);
	}

	if (row === null) {
		return (
			<MetaTitle title="Edit meal" />
		);
	}

	const favourite = () => {
		const isFavourite = !row.is_favourite;
		const body = {
			data: {
				id,
				type: 'meals',
				attributes: { is_favourite: isFavourite },
			},
		};

		Api.put(`meals/${id}`, JSON.stringify(body))
			.then(() => {
				setRow({ ...row, is_favourite: isFavourite });
				addToast(`Meal ${isFavourite ? '' : 'un'}favourited successfully.`, 'success');
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
			});
	};

	const deleteRow = () => {
		if (!confirm('Are you sure you want to delete this meal?')) { // eslint-disable-line no-restricted-globals
			return;
		}

		Api.delete(`meals/${id}`)
			.then(() => {
				addToast('Meal deleted successfully.', 'success');
				history.push('/meals');
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
			});
	};

	const mealFoodIds = row.foods.map((f) => (f.food.id));
	const filteredFood = allFood.filter((f) => (!mealFoodIds.includes(f.id)));

	return (
		<>
			<MetaTitle title={`Edit ${row.name}`}>
				<button
					aria-label={row.is_favourite ? 'Unfavourite' : 'Favourite'}
					className={`heart ${row.is_favourite ? 'un' : ''}favourite`}
					onClick={favourite}
					type="button"
				>
					<HeartIcon aria-hidden height={16} width={16} />
				</button>
				<button className="formosa-button button--small" form="edit-form" type="submit">Save</button>
				<button className="formosa-button formosa-button--danger button--small" onClick={deleteRow} type="submit">Delete</button>
			</MetaTitle>

			<MyForm
				htmlId="edit-form"
				id={id}
				method="PUT"
				path="meals"
				preventEmptyRequest
				relationshipNames={['foods', 'foods.food', 'user']}
				row={row}
				setRow={setRow}
				successToastText="Meal saved successfully."
			>
				<Fields row={row} />

				<h2>Foods</h2>

				{errorFood ? (
					<p className="formosa-message formosa-message--error">Error getting food.</p>
				) : (
					<Input
						aria-label="Add food"
						className="formosa-prefix"
						id="new-food"
						labelFn={foodLabelFn}
						max={1}
						options={filteredFood}
						optionLabelFn={foodLabelFn}
						placeholder="Search foods"
						type="autocomplete"
						setValue={(food) => {
							const newValue = {
								id: `temp-${uuidv4()}`,
								type: 'food-meal',
								food_id: food.id,
								meal_id: row.id,
								food,
								user_serving_size: food.serving_size,
							};
							setRow({
								...row,
								foods: [...row.foods, newValue],
							});
							setNewFood(null);
							setTimeout(() => {
								document.getElementById('new-food').focus();
							});
						}}
						value={newFood}
					/>
				)}

				{row.foods.length > 0 ? (
					<table className="responsive-table">
						<thead>
							<tr>
								<th className="column--name" scope="col">Food</th>
								<th className="column--serving" scope="col">Serving Size</th>
								<th aria-label="Actions" className="column--button" />
								<TrackableHead trackables={trackables} />
							</tr>
						</thead>
						<tbody>
							{row.foods.map((foodMeal, i) => (
								<tr className={`row--${foodMeal.food.slug}`} key={foodMeal.id}>
									<td className="column--name">
										<FoodLink food={foodMeal.food} />
									</td>
									<td className="column--serving">
										<Field
											inputMode="decimal"
											name={`foods.${i}.user_serving_size`}
											size={6}
											suffix={pluralize(foodMeal.food.serving_units, foodMeal.user_serving_size || '')}
										/>
									</td>
									<td className="column--button">
										<button
											className="button--icon button--remove"
											data-index={i}
											onClick={(e) => {
												const index = e.target.getAttribute('data-index');
												const newFoods = [...row.foods];
												newFoods.splice(index, 1);
												setRow({
													...row,
													foods: newFoods,
												});
											}}
											type="button"
										>
											Remove
											<XIcon aria-hidden height={16} width={16} />
										</button>
									</td>
									<TrackableBody
										food={foodMeal.food}
										servingSize={parseFloat(foodMeal.user_serving_size)}
										trackables={trackables}
									/>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<th colSpan={3} />
								<TrackableFoot rows={row.foods} trackables={trackables} />
							</tr>
						</tfoot>
					</table>
				) : <p>This meal has no foods.</p>}
			</MyForm>
		</>
	);
}
