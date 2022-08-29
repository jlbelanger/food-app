import { Api, Field, Form, FormosaContext } from '@jlbelanger/formosa';
import { Link, useHistory } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import Auth from '../Utilities/Auth';
import { ReactComponent as ChevronIcon } from '../../svg/chevron.svg';
import { colorsLight } from '../Utilities/Colors';
import MetaTitle from '../MetaTitle';
import { pluralize } from '../Utilities/Helpers';
import { ReactComponent as PlusIcon } from '../../svg/plus.svg';
import TrackableBody from '../TrackableBody';
import TrackableFoot from '../TrackableFoot';
import TrackableHead from '../TrackableHead';
import { ReactComponent as XIcon } from '../../svg/x.svg';

export default function Diary() {
	const history = useHistory();
	const ymd = (date) => date.toLocaleString('en-CA').substring(0, 10);
	const today = ymd(new Date());
	const urlSearchParams = new URLSearchParams(history.location.search);
	const currentDate = urlSearchParams.get('date') || today;

	const { formosaState } = useContext(FormosaContext);
	const [errorExtras, setErrorExtras] = useState(null);
	const [errorEntries, setErrorEntries] = useState(null);
	const [errorFood, setErrorFood] = useState(null);
	const [errorMeals, setErrorMeals] = useState(null);
	const [diary, setDiary] = useState({ entries: [], extras: [] });
	const [food, setFood] = useState([]);
	const [favouriteFood, setFavouriteFood] = useState([]);
	const [meals, setMeals] = useState([]);
	const [newEntryRow, setNewEntryRow] = useState({ date: currentDate });
	const [newExtraRow, setNewExtraRow] = useState({ date: currentDate });
	const [trackables, setTrackables] = useState([]);
	const [favouritesOnly, setFavouritesOnly] = useState(Auth.getValue('favourites_only'));

	const foodFields = ['name', 'serving_size', 'serving_units'].concat(Auth.trackables());

	const getEntries = (date) => {
		if (!date) {
			return;
		}

		Api.get(`entries?filter[date][eq]=${date}&fields[entries]=user_serving_size&fields[food]=${foodFields.join(',')}&include=food`)
			.then((entriesResponse) => {
				setDiary({ ...diary, entries: entriesResponse });

				Api.get(`extras?filter[date][eq]=${date}&fields[extras]=${['note'].concat(Auth.trackables()).join(',')}`)
					.then((extrasResponse) => {
						setDiary({ entries: entriesResponse, extras: extrasResponse });
					})
					.catch(() => {
						setErrorExtras(true);
					});
			})
			.catch(() => {
				setErrorEntries(true);
			});
	};

	useEffect(() => {
		Api.get(`food?fields[food]=${foodFields.concat(['is_favourite']).join(',')}`)
			.then((response) => {
				setFood(response);
				setFavouriteFood(response.filter((row) => (row.is_favourite)));
			})
			.catch(() => {
				setErrorFood(true);
			});

		Api.get('meals?fields[meals]=name&filter[is_favourite][eq]=1&sort=name')
			.then((response) => {
				setMeals(response);
			})
			.catch(() => {
				setErrorMeals(true);
			});

		if (Auth.hasTrackables()) {
			Api.get(`trackables?fields[trackables]=name,slug,units&filter[slug][in]=${Auth.trackables().join(',')}`)
				.then((response) => {
					setTrackables(response);
				});
		}

		getEntries(currentDate);
	}, []);

	const prettyDate = new Date(`${currentDate}T12:00:00Z`).toLocaleString('en-CA', {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});

	const changeDay = (modifier = 1) => {
		let newDate = new Date(`${currentDate}T12:00:00Z`);
		newDate.setDate(newDate.getDate() + (1 * modifier));
		newDate = ymd(newDate);
		urlSearchParams.set('date', newDate);
		history.replace({ search: urlSearchParams.toString() });
		return newDate;
	};

	const previousDay = () => {
		getEntries(changeDay(-1));
	};

	const nextDay = () => {
		getEntries(changeDay(1));
	};

	const deleteEntry = (e) => {
		Api.delete(`entries/${e.target.getAttribute('data-id')}`)
			.then(() => {
				formosaState.addToast('Food removed successfully.', 'success');
				e.target.closest('tr').remove();
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				formosaState.addToast(text, 'error', 10000);
			});
	};

	const updateEntry = (entry) => {
		const body = {
			data: {
				id: entry.id,
				type: entry.type,
				attributes: {
					user_serving_size: entry.user_serving_size,
				},
			},
		};
		Api.put(`entries/${entry.id}`, JSON.stringify(body))
			.then(() => {
				formosaState.addToast('Entry saved successfully.', 'success');
			})
			.catch((reponse) => {
				const text = reponse.message ? reponse.message : reponse.errors.map((err) => (err.title)).join(' ');
				formosaState.addToast(text, 'error', 10000);
			});
	};

	const deleteExtra = (e) => {
		Api.delete(`extras/${e.target.getAttribute('data-id')}`)
			.then(() => {
				formosaState.addToast('Extra removed successfully.', 'success');
				e.target.closest('tr').remove();
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				formosaState.addToast(text, 'error', 10000);
			});
	};

	const addMeal = (e) => {
		Api.post(`meals/${e.target.getAttribute('data-id')}/add`, JSON.stringify({ date: currentDate, fields: foodFields }))
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

	return (
		<>
			<MetaTitle
				before={(
					<button className="button--icon" id="previous" onClick={previousDay} type="button">
						Previous Day
						<ChevronIcon height={16} width={16} />
					</button>
				)}
				title={currentDate ? prettyDate : 'Diary'}
			>
				<button className="button--icon" disabled={currentDate === today} id="next" onClick={nextDay} type="button">
					Next Day
					<ChevronIcon height={16} width={16} />
				</button>
			</MetaTitle>

			<div id="diary">
				<div id="diary-top">
					{!errorFood && (
						<Form
							afterSubmit={(response) => {
								diary.entries.push({ ...response, food: newEntryRow.food });
								setNewEntryRow({ ...newEntryRow, food: null });
							}}
							method="POST"
							path="entries"
							relationshipNames={['food']}
							row={newEntryRow}
							setRow={setNewEntryRow}
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
									inputWrapperClassName="flex"
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
					)}

					<Form
						afterSubmit={(response) => {
							diary.extras.push({ ...response });
							setNewExtraRow({ ...newExtraRow, note: '' });
						}}
						method="POST"
						path="extras"
						row={newExtraRow}
						setRow={setNewExtraRow}
						successToastText="Extra added successfully."
					>
						<fieldset id="add-extras">
							<legend>Add extras</legend>
							<Field
								className="formosa-prefix"
								inputWrapperClassName="flex"
								name="note"
								placeholder="Enter description"
								postfix={(
									<button className="formosa-button formosa-postfix button--icon" type="submit">
										Add
										<PlusIcon height={16} width={16} />
									</button>
								)}
								type="text"
							/>
							<Field name="date" type="hidden" />
						</fieldset>
					</Form>
				</div>

				<Form>
					<fieldset>
						<legend>Add weight</legend>
						<Field
							className="formosa-prefix"
							inputWrapperClassName="flex"
							maxLength={6}
							name="weight"
							postfix={(
								<button className="formosa-button formosa-postfix button--icon" type="submit">
									Add
									<PlusIcon height={16} width={16} />
								</button>
							)}
							size={5}
							suffix={Auth.weightUnits()}
						/>
					</fieldset>
				</Form>

				{meals.length > 0 && (
					<fieldset id="add-meal">
						<legend>Add meal</legend>
						{meals.map((meal) => (
							<button className="formosa-button add-meal__button" data-id={meal.id} key={meal.id} onClick={addMeal} type="button">
								{meal.name}
							</button>
						))}
					</fieldset>
				)}
			</div>

			{errorFood && (<p className="formosa-message formosa-message--error">Error getting food.</p>)}
			{errorMeals && (<p className="formosa-message formosa-message--error">Error getting meals.</p>)}
			{errorEntries && (<p className="formosa-message formosa-message--error">Error getting entries.</p>)}
			{errorExtras && (<p className="formosa-message formosa-message--error">Error getting extras.</p>)}

			{(diary.entries.length > 0 || diary.extras.length > 0) && (
				<table>
					<thead>
						<tr>
							<th scope="col"><span className="table-heading">Name</span></th>
							<th className="column--serving" scope="col"><span className="table-heading">Serving Size</span></th>
							<TrackableHead trackables={trackables} />
							<th className="column--button" scope="col"><span className="table-heading" /></th>
						</tr>
					</thead>
					<tbody>
						{diary.entries.map((entry, i) => (
							<tr key={entry.id}>
								<td>
									<Link className="table-link" to={`/food/${entry.food.id}`}>{entry.food.name}</Link>
								</td>
								<td className="column--serving">
									<Field
										onKeyUp={(e) => {
											if (e.key === 'Enter') {
												updateEntry(entry);
											}
										}}
										onBlur={() => {
											updateEntry(entry); // TODO: Only submit if dirty.
										}}
										name={`entries.${i}.user_serving_size`}
										size={6}
										suffix={pluralize(entry.food.serving_units, entry.user_serving_size)}
										setValue={(newValue) => {
											const e = [...diary.entries];
											e[i].user_serving_size = newValue;
											setDiary({
												...diary,
												entries: e,
											});
										}}
										value={diary.entries[i].user_serving_size}
									/>
								</td>
								<TrackableBody food={entry.food} servingSize={parseFloat(entry.user_serving_size)} trackables={trackables} />
								<td className="column--button">
									<button
										className="button--icon button--remove"
										data-id={entry.id}
										onClick={deleteEntry}
										type="button"
									>
										Remove
										<XIcon height={16} width={16} />
									</button>
								</td>
							</tr>
						))}

						{diary.extras.map((extra, i) => (
							<tr key={extra.id}>
								<td>
									<Form
										id={extra.id}
										method="PUT"
										path="extras"
										preventEmptyRequest
										row={extra}
										setRow={(newNote) => {
											const e = [...diary.extras];
											e[i].note = newNote;
											setDiary({ ...diary, extras: e });
										}}
										successToastText="Extra saved successfully."
									>
										<Field id={`note-${extra.id}`} name="note" />
									</Form>
								</td>
								<td />
								{trackables.map((trackable, j) => (
									<td className="center" key={trackable.id} style={{ backgroundColor: colorsLight[j + 1] }}>
										{/* TODO */}
										{/* <Field name={`extras.${i}.${trackable.slug}`} size={6} /> */}
									</td>
								))}
								<td className="column--button">
									<button
										className="button--icon button--remove"
										data-id={extra.id}
										onClick={deleteExtra}
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
							<TrackableFoot extras={diary.extras} rows={diary.entries} trackables={trackables} />
							<th />
						</tr>
					</tfoot>
				</table>
			)}
		</>
	);
}
