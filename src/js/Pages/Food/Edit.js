import { Alert, Api, FormosaContext } from '@jlbelanger/formosa';
import { errorMessageText, pluralize, prettyDate } from '../../Utilities/Helpers';
import { Link, useHistory, useParams } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import Auth from '../../Utilities/Auth';
import { ReactComponent as CheckIcon } from '../../../svg/check.svg';
import Error from '../../Error';
import Fields from './Partials/Fields';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import MetaTitle from '../../Components/MetaTitle';
import Modal from '../../Components/Modal';
import MyForm from '../../Components/MyForm';
import PaginatedTable from '../../Components/PaginatedTable';
import { ReactComponent as PencilIcon } from '../../../svg/pencil.svg';

export default function Edit() {
	const api = Api.instance();
	const { addToast } = useContext(FormosaContext);
	const { id } = useParams();
	const [row, setRow] = useState(null);
	const [isFavourite, setIsFavourite] = useState(false);
	const [error, setError] = useState(false);
	const [actionError, setActionError] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const history = useHistory();

	useEffect(() => {
		const include = ['user_entries', 'user_meals', 'user'];
		if (Auth.getValue('is_admin')) {
			include.push('user_meals.user');
			include.push('user_entries.user');
		}

		let url = `food/${id}?include=${include.join(',')}&fields[meals]=name&fields[entries]=date,user_serving_size`;
		if (Auth.getValue('is_admin')) {
			url += '&fields[users]=username';
		}

		api(url)
			.catch((response) => {
				setError(response);
			})
			.then((response) => {
				if (!response) {
					return;
				}
				setRow(response);
				setIsFavourite(response.is_favourite);
			});
	}, [id]);

	if (error) {
		return (
			<Error error={error} />
		);
	}

	if (row === null) {
		return (
			<MetaTitle title="Edit food" />
		);
	}

	const favourite = () => {
		setActionError(false);
		Api.post(`food/${id}/favourite`)
			.catch((response) => {
				setActionError(errorMessageText(response));
			})
			.then((response) => {
				if (!response) {
					return;
				}
				const newIsFavourite = !isFavourite;
				setIsFavourite(newIsFavourite);
				addToast(`Food ${newIsFavourite ? '' : 'un'}favourited successfully.`, 'success');
			});
	};

	const deleteRow = () => {
		setShowModal(false);
		Api.delete(`food/${id}`)
			.catch((response) => {
				setActionError(errorMessageText(response));
			})
			.then((response) => {
				if (!response) {
					return;
				}
				addToast('Food deleted successfully.', 'success');
				history.push('/food');
			});
	};

	const readOnly = Auth.getValue('is_admin') ? false : !row.user || row.user.id.toString() !== Auth.id().toString();

	return (
		<>
			<MetaTitle title={readOnly ? row.name : `Edit ${row.name}`}>
				{row.is_verified && <CheckIcon alt="Verified" className="verified" height={16} width={16} />}
				<button
					aria-label={isFavourite ? 'Unfavourite' : 'Favourite'}
					className={`heart ${isFavourite ? 'un' : ''}favourite`}
					onClick={favourite}
					type="button"
				>
					<HeartIcon aria-hidden height={16} width={16} />
				</button>
				{!readOnly && <button className="formosa-button button--small" form="edit-form" type="submit">Save</button>}
				{!readOnly && row.deleteable && (
					<>
						<button
							className="formosa-button formosa-button--danger button--small"
							onClick={(e) => {
								setActionError(false);
								setShowModal(e);
							}}
							type="button"
						>
							Delete
						</button>
						{showModal && (
							<Modal
								event={showModal}
								okButtonClass="formosa-button--danger"
								okButtonText="Delete"
								onClickOk={deleteRow}
								onClickCancel={() => { setShowModal(false); }}
								text="Are you sure you want to delete this food?"
							/>
						)}
					</>
				)}
			</MetaTitle>

			<MyForm
				afterSubmitFailure={(response) => { setActionError(errorMessageText(response)); }}
				afterSubmitSuccess={(response) => {
					const newRow = { ...row };
					let hasChanged = false;
					if (response.front_image !== row.front_image) {
						newRow.front_image = response.front_image;
						hasChanged = true;
					}
					if (response.info_image !== row.info_image) {
						newRow.info_image = response.info_image;
						hasChanged = true;
					}
					if (hasChanged) {
						setRow(newRow);
					}
				}}
				htmlId="edit-form"
				id={id}
				method="PUT"
				path="food"
				preventEmptyRequest
				relationshipNames={['user']}
				row={row}
				setRow={setRow}
				successToastText="Food saved successfully."
			>
				{actionError && (<Alert type="error">{actionError}</Alert>)}
				<Fields readOnly={readOnly} row={row} />
			</MyForm>

			<div className="food-relationships">
				{!!row.user_entries.length && (
					<div className="food-relationships__section">
						<h2>
							Entries
							<small>{` (${row.user_entries.length})`}</small>
						</h2>
						<PaginatedTable
							rows={row.user_entries}
							head={(
								<tr>
									<th>Date</th>
									<th className="column--name">Serving</th>
									{Auth.getValue('is_admin') && <th>User</th>}
									<th className="column--button" />
								</tr>
							)}
							body={(entry) => (
								<tr key={entry.id}>
									<td style={{ whiteSpace: 'nowrap' }}>
										<Link className="table-link" to={`/?date=${entry.date}`}>{prettyDate(entry.date, null)}</Link>
									</td>
									<td>{`${entry.user_serving_size} ${pluralize(row.serving_units, entry.user_serving_size)}`}</td>
									{Auth.getValue('is_admin') && <td>{entry.user.username}</td>}
									<td className="column--button">
										<Link className="button--icon button--edit" to={`/entries/${entry.id}`}>
											Edit
											<PencilIcon aria-hidden height={16} width={16} />
										</Link>
									</td>
								</tr>
							)}
						/>
					</div>
				)}

				{!!row.user_meals.length && (
					<div className="food-relationships__section">
						<h2>
							Meals
							<small>{` (${row.user_meals.length})`}</small>
						</h2>
						<PaginatedTable
							rows={row.user_meals}
							head={(
								<tr>
									<th style={{ width: '100%' }}>Name</th>
									{Auth.getValue('is_admin') && <th>User</th>}
								</tr>
							)}
							body={(meal) => (
								<tr key={meal.id}>
									<td><Link className="table-link" to={`/meals/${meal.id}`}>{meal.name}</Link></td>
									{Auth.getValue('is_admin') && <td>{meal.user.username}</td>}
								</tr>
							)}
						/>
					</div>
				)}
			</div>
		</>
	);
}
