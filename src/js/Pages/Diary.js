import { Api, Field, Form, FormosaContext } from '@jlbelanger/formosa';
import { mapTrackables, pluralize, prettyDate } from '../Utilities/Helpers';
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
import TrackableBody from '../Components/TrackableBody';
import TrackableFoot from '../Components/TrackableFoot';
import TrackableHead from '../Components/TrackableHead';
import { useHistory } from 'react-router-dom';
import { ReactComponent as XIcon } from '../../svg/x.svg';

export default function Diary() {
	const history = useHistory();
	const ymd = (date) => date.toLocaleString('en-CA').substring(0, 10);
	const today = ymd(new Date());
	const urlSearchParams = new URLSearchParams(history.location.search);
	const currentDate = urlSearchParams.get('date') || today;
	const foodFields = ['name', 'serving_size', 'serving_units', 'is_verified'].concat(Auth.trackables());

	const { addToast } = useContext(FormosaContext);
	const [errorExtras, setErrorExtras] = useState(false);
	const [errorEntries, setErrorEntries] = useState(false);
	const [diary, setDiary] = useState({ entries: [], extras: [] });
	const [trackables, setTrackables] = useState([]);

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
		if (Auth.hasTrackables()) {
			Api.get(`trackables?fields[trackables]=name,slug,units&filter[slug][in]=${Auth.trackables().join(',')}`)
				.then((response) => {
					setTrackables(mapTrackables(response));
				});
		}

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
			.then(() => {
				addToast('Food removed successfully.', 'success');

				const newEntries = [...diary.entries];
				newEntries.splice(e.target.getAttribute('data-index'), 1);
				setDiary({ ...diary, entries: newEntries });
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
			});
	};

	const deleteExtra = (e) => {
		Api.delete(`extras/${e.target.getAttribute('data-id')}`)
			.then(() => {
				addToast('Extra removed successfully.', 'success');

				const newExtras = [...diary.extras];
				newExtras.splice(e.target.getAttribute('data-index'), 1);
				setDiary({ ...diary, extras: newExtras });
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
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
					<DiaryAddFood date={currentDate} diary={diary} foodFields={foodFields} setDiary={setDiary} />
					<DiaryAddExtra date={currentDate} diary={diary} setDiary={setDiary} />
					<DiaryWeight date={currentDate} />
				</div>

				<DiaryAddMeal date={currentDate} diary={diary} foodFields={foodFields} setDiary={setDiary} />
			</div>

			{errorEntries && (<p className="formosa-message formosa-message--error">Error getting entries.</p>)}
			{errorExtras && (<p className="formosa-message formosa-message--error">Error getting extras.</p>)}

			{(diary.entries.length > 0 || diary.extras.length > 0) && (
				<table className="responsive-table" id="diary-table">
					<thead>
						<tr>
							<th className="column--name" scope="col"><span className="table-heading">Name</span></th>
							<th className="column--serving" scope="col"><span className="table-heading">Serving Size</span></th>
							<th aria-label="Actions" className="column--button" scope="col"><span className="table-heading" /></th>
							<TrackableHead trackables={trackables} />
						</tr>
					</thead>
					<tbody>
						{diary.entries.map((entry, i) => (
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
										setRow={(newUserServingSize) => {
											const e = [...diary.entries];
											e[i].user_serving_size = newUserServingSize;
											setDiary({ ...diary, entries: e });
										}}
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
												const e = [...diary.entries];
												e[i].user_serving_size = newValue;
												setDiary({
													...diary,
													entries: e,
												});
											}}
											value={diary.entries[i].user_serving_size}
										/>
										<button id={`entry-${entry.id}-submit`} style={{ display: 'none' }} type="submit" />
									</Form>
								</td>
								<td className="column--button">
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
								</td>
								<TrackableBody food={entry.food} servingSize={parseFloat(entry.user_serving_size)} trackables={trackables} />
							</tr>
						))}

						{diary.extras.map((extra, i) => (
							<tr className="extra" id={`extra-row-${i}`} key={extra.id}>
								<td className="column--name">
									<Form
										id={extra.id}
										method="PUT"
										path="extras"
										preventEmptyRequest
										preventEmptyRequestText={false}
										row={extra}
										setRow={(newNote) => {
											const e = [...diary.extras];
											e[i].note = newNote;
											setDiary({ ...diary, extras: e });
										}}
										successToastText="Extra saved successfully."
									>
										<Field
											onBlur={() => {
												document.getElementById(`extra-${extra.id}-submit`).click();
											}}
											id={`note-${i}`}
											name="note"
											setValue={(newValue) => {
												const e = [...diary.extras];
												e[i].note = newValue;
												setDiary({
													...diary,
													extras: e,
												});
											}}
											value={diary.extras[i].note}
										/>
										<button id={`extra-${extra.id}-submit`} style={{ display: 'none' }} type="submit" />
									</Form>
								</td>
								<td className="column--serving" />
								<td className="column--button">
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
												setRow={(newNote) => {
													const e = [...diary.extras];
													e[i].note = newNote;
													setDiary({ ...diary, extras: e });
												}}
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
														const e = [...diary.extras];
														e[i][trackable.slug] = newValue;
														setDiary({
															...diary,
															extras: e,
														});
													}}
													size={6}
													value={diary.extras[i][trackable.slug] === null ? '' : diary.extras[i][trackable.slug]}
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
							<TrackableFoot extras={diary.extras} rows={diary.entries} trackables={trackables} />
						</tr>
					</tfoot>
				</table>
			)}
		</>
	);
}
