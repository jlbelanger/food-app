import { Api, Field, Form, FormosaContext, Input } from '@jlbelanger/formosa';
import { Link, useHistory, useParams } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import Fields from './Partials/Fields';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import MetaTitle from '../../Components/MetaTitle';
import MyForm from '../../Components/MyForm';
import { pluralize } from '../../Utilities/Helpers';
import TrackableBody from '../../Components/TrackableBody';
import TrackableFoot from '../../Components/TrackableFoot';
import TrackableHead from '../../Components/TrackableHead';
import { v4 as uuidv4 } from 'uuid';
import { ReactComponent as XIcon } from '../../../svg/x.svg';

export default function Edit() {
	const { addToast } = useContext(FormosaContext);
	const { id } = useParams();
	const [row, setRow] = useState(null);
	const [trackables, setTrackables] = useState([]);
	const [error, setError] = useState(false);
	const [newFood, setNewFood] = useState(null);
	const history = useHistory();
	const foodFields = ['name', 'slug', 'serving_size', 'serving_units'].concat(Auth.trackables());

	useEffect(() => {
		Api.get(`meals/${id}?include=foods,foods.food&fields[food]=${foodFields.join(',')}&fields[food_meal]=user_serving_size`)
			.then((response) => {
				setRow(response);
			})
			.catch((response) => {
				setError(response.status);
			});
		if (Auth.hasTrackables()) {
			Api.get(`trackables?fields[trackables]=name,slug,units&filter[slug][in]=${Auth.trackables().join(',')}`)
				.then((response) => {
					setTrackables(response);
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

	return (
		<>
			<MetaTitle title={`Edit ${row.name}`}>
				<button
					className={`heart ${row.is_favourite ? 'un' : ''}favourite`}
					onClick={favourite}
					type="button"
				>
					<HeartIcon alt={row.is_favourite ? 'Unfavourite' : 'Favourite'} height={16} width={16} />
				</button>
				<button className="formosa-button" form="edit-form" type="submit">Save</button>
				<button className="formosa-button formosa-button--danger" form="delete-form" type="submit">Delete</button>
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

				<Input
					aria-label="Add food"
					className="formosa-prefix"
					id="new-food"
					max={1}
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
					url={`food?fields[food]=${foodFields.join(',')}`}
					value={newFood}
				/>

				{row.foods.length > 0 ? (
					<table>
						<thead>
							<tr>
								<th scope="col">Food</th>
								<th scope="col">Serving Size</th>
								<TrackableHead trackables={trackables} />
								<th />
							</tr>
						</thead>
						<tbody>
							{row.foods.map((foodMeal, i) => (
								<tr className={`row--${foodMeal.food.slug}`} key={foodMeal.id}>
									<td>
										<Link className="table-link" to={`/food/${foodMeal.food.id}`}>{foodMeal.food.name}</Link>
									</td>
									<td>
										<Field
											name={`foods.${i}.user_serving_size`}
											size={6}
											suffix={pluralize(foodMeal.food.serving_units, foodMeal.user_serving_size || '')}
										/>
									</td>
									<TrackableBody
										food={foodMeal.food}
										servingSize={parseFloat(foodMeal.user_serving_size)}
										trackables={trackables}
									/>
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
											<XIcon height={16} width={16} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr>
								<th />
								<th />
								<TrackableFoot rows={row.foods} trackables={trackables} />
								<th />
							</tr>
						</tfoot>
					</table>
				) : <p>This meal has no foods.</p>}
			</MyForm>

			<Form
				afterSubmit={() => {
					history.push('/meals');
				}}
				beforeSubmit={() => (
					confirm('Are you sure you want to delete this meal?') // eslint-disable-line no-restricted-globals
				)}
				htmlId="delete-form"
				id={id}
				method="DELETE"
				path="meals"
				showMessage={false}
				successToastText="Meal deleted successfully."
			/>
		</>
	);
}
