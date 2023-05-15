import { Api, Field, Form, FormosaContext } from '@jlbelanger/formosa';
import { Link, useHistory } from 'react-router-dom';
import { mapTrackables, pad, pluralize, prettyDate } from '../Utilities/Helpers';
import React, { useContext, useEffect, useState } from 'react';
import Auth from '../Utilities/Auth';
import { ReactComponent as ChevronIcon } from '../../svg/chevron.svg';
import { colorsLight } from '../Utilities/Colors';
import DiaryAddExtra from '../Components/DiaryAddExtra';
import DiaryAddFood from '../Components/DiaryAddFood';
import DiaryAddMeal from '../Components/DiaryAddMeal';
import DiaryWeight from '../Components/DiaryWeight';
import FoodLink from '../Components/FoodLink';
import MetaTitle from '../Components/MetaTitle';
import { ReactComponent as PencilIcon } from '../../svg/pencil.svg';
import TrackableBody from '../Components/TrackableBody';
import TrackableFoot from '../Components/TrackableFoot';
import TrackableHead from '../Components/TrackableHead';
import { ReactComponent as XIcon } from '../../svg/x.svg';

export default function Diary() {
	const history = useHistory();
	const ymd = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	const today = ymd(new Date());
	const urlSearchParams = new URLSearchParams(history.location.search);
	const currentDate = urlSearchParams.get('date') || today;
	const foodFields = ['name', 'serving_size', 'serving_units', 'is_verified'].concat(Auth.trackables());

	const { addToast } = useContext(FormosaContext);
	const [error, setError] = useState(null);
	const [entries, setEntries] = useState([]);
	const [extras, setExtras] = useState([]);
	const [weight, setWeight] = useState(null);
	const [trackables, setTrackables] = useState([]);
	const [food, setFood] = useState([]);
	const [favouriteFood, setFavouriteFood] = useState([]);
	const [foodError, setFoodError] = useState(false);

	const getEntries = (date) => {
		if (!date) {
			return;
		}

		let url = `date?filter[date][eq]=${date}`;
		url += '&fields[entries]=user_serving_size';
		url += `&fields[extras]=${['note'].concat(Auth.trackables()).join(',')}`;
		url += `&fields[food]=${foodFields.join(',')}`;
		url += '&fields[weights]=date,weight';
		url += '&include=food';

		Api.get(url)
			.catch((response) => {
				setError(response);
				throw response;
			})
			.then((response) => {
				const w = Api.deserialize(response.weights);
				setEntries(Api.deserialize(response.entries));
				setExtras(Api.deserialize(response.extras));
				setWeight(w.length > 0 ? w[0] : { date });
			});
	};

	useEffect(() => {
		if (Auth.hasTrackables()) {
			Api.get(`trackables?fields[trackables]=name,slug,units&filter[slug][in]=${Auth.trackables().join(',')}`)
				.then((response) => {
					setTrackables(mapTrackables(response));
				});
		}

		Api.get(`food?fields[food]=${foodFields.concat(['is_favourite']).join(',')}`)
			.catch((response) => {
				setFoodError(true);
				throw response;
			})
			.then((response) => {
				setFood(response);
				setFavouriteFood(response.filter((r) => (r.is_favourite)));
			});

		getEntries(currentDate);
	}, []);

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
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
				throw response;
			})
			.then(() => {
				addToast('Food removed successfully.', 'success');

				const newEntries = [...entries];
				newEntries.splice(e.target.getAttribute('data-index'), 1);
				setEntries(newEntries);
			});
	};

	const deleteExtra = (e) => {
		Api.delete(`extras/${e.target.getAttribute('data-id')}`)
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
				throw response;
			})
			.then(() => {
				addToast('Extra removed successfully.', 'success');

				const newExtras = [...extras];
				newExtras.splice(e.target.getAttribute('data-index'), 1);
				setExtras(newExtras);
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
				title={currentDate ? prettyDate(currentDate) : 'Diary'}
			>
				<button className="button--icon" disabled={currentDate === today} id="next" onClick={nextDay} type="button">
					Next Day
					<ChevronIcon height={16} width={16} />
				</button>
			</MetaTitle>

			<div id="diary">
				<div id="diary-top">
					{foodError ? (
						<p className="formosa-message formosa-message--error form">Error getting food.</p>
					) : (
						<DiaryAddFood
							date={currentDate}
							entries={entries}
							key={`add-food-${currentDate}`}
							favouriteFood={favouriteFood}
							food={food}
							setEntries={setEntries}
						/>
					)}
					<DiaryAddExtra date={currentDate} extras={extras} key={`add-extra-${currentDate}`} setExtras={setExtras} />
					<DiaryWeight date={currentDate} error={error} setWeight={setWeight} weight={weight} />
				</div>

				<DiaryAddMeal date={currentDate} entries={entries} foodFields={foodFields} setEntries={setEntries} />
			</div>

			{error && (<p className="formosa-message formosa-message--error">Error getting entries.</p>)}
			{error && (<p className="formosa-message formosa-message--error">Error getting extras.</p>)}

			{(entries.length > 0 || extras.length > 0) && (
				<table className="responsive-table" id="diary-table">
					<thead>
						<tr>
							<th className="column--name" scope="col"><span className="table-heading">Name</span></th>
							<th className="column--serving" scope="col"><span className="table-heading">Serving Size</span></th>
							<th aria-label="Actions" className="column--button-large" scope="col"><span className="table-heading" /></th>
							<TrackableHead trackables={trackables} />
						</tr>
					</thead>
					<tbody>
						{entries.map((entry, i) => (
							<tr className="entry" id={`entry-row-${i}`} key={entry.id}>
								<td className="column--name">
									<FoodLink food={entry.food} />
								</td>
								<td className="column--serving">
									<Form
										id={entry.id}
										method="PUT"
										path="entries"
										preventEmptyRequest
										preventEmptyRequestText={false}
										row={entry}
										setRow={() => {}}
										successToastText="Entry saved successfully."
									>
										<Field
											onBlur={() => {
												document.getElementById(`entry-${entry.id}-submit`).click();
											}}
											id={`user_serving_size-${i}`}
											inputMode="decimal"
											name="user_serving_size"
											size={6}
											suffix={pluralize(entry.food.serving_units, entry.user_serving_size)}
											setValue={(newValue) => {
												const e = [...entries];
												e[i].user_serving_size = newValue;
												setEntries(e);
											}}
											value={entry.user_serving_size}
										/>
										<button id={`entry-${entry.id}-submit`} style={{ display: 'none' }} type="submit" />
									</Form>
								</td>
								<td className="column--button-large">
									<div className="flex">
										<button
											className="button--icon button--remove"
											data-id={entry.id}
											data-index={i}
											onClick={deleteEntry}
											type="button"
										>
											Remove
											<XIcon aria-hidden height={16} width={16} />
										</button>
										<Link className="button--icon button--edit" to={`/entries/${entry.id}`}>
											Edit
											<PencilIcon aria-hidden height={16} width={16} />
										</Link>
									</div>
								</td>
								<TrackableBody food={entry.food} servingSize={parseFloat(entry.user_serving_size)} trackables={trackables} />
							</tr>
						))}

						{extras.map((extra, i) => (
							<tr className="extra" id={`extra-row-${i}`} key={extra.id}>
								<td className="column--name">
									<Form
										id={extra.id}
										method="PUT"
										path="extras"
										preventEmptyRequest
										preventEmptyRequestText={false}
										row={extra}
										setRow={() => {}}
										successToastText="Extra saved successfully."
									>
										<Field
											onBlur={() => {
												document.getElementById(`extra-${extra.id}-submit`).click();
											}}
											id={`note-${i}`}
											name="note"
											setValue={(newValue) => {
												const e = [...extras];
												e[i].note = newValue;
												setExtras(e);
											}}
											value={extra.note}
										/>
										<button id={`extra-${extra.id}-submit`} style={{ display: 'none' }} type="submit" />
									</Form>
								</td>
								<td className="column--serving" />
								<td className="column--button-large">
									<button
										className="button--icon button--remove"
										data-id={extra.id}
										data-index={i}
										onClick={deleteExtra}
										type="button"
									>
										Remove
										<XIcon aria-hidden height={16} width={16} />
									</button>
								</td>
								<td className="center column--trackables">
									<div className="trackable-list">
										{trackables.map((trackable, j) => (
											<Form
												className="trackable-item"
												id={extra.id}
												key={trackable.id}
												method="PUT"
												path="extras"
												preventEmptyRequest
												preventEmptyRequestText={false}
												row={extra}
												setRow={() => {}}
												style={{ backgroundColor: colorsLight[j + 1] }}
												successToastText="Extra saved successfully."
											>
												<Field
													onBlur={() => {
														document.getElementById(`extra-${trackable.slug}-${extra.id}-submit`).click();
													}}
													id={`${trackable.slug}-${i}`}
													inputMode="numeric"
													name={trackable.slug}
													setValue={(newValue) => {
														const e = [...extras];
														e[i][trackable.slug] = newValue;
														setExtras(e);
													}}
													size={6}
													value={extra[trackable.slug] === null ? '' : extra[trackable.slug]}
												/>
												<button id={`extra-${trackable.slug}-${extra.id}-submit`} style={{ display: 'none' }} type="submit" />
											</Form>
										))}
									</div>
								</td>
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr>
							<th colSpan={3} />
							<TrackableFoot extras={extras} rows={entries} trackables={trackables} />
						</tr>
					</tfoot>
				</table>
			)}
		</>
	);
}
