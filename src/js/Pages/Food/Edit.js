import { Api, CheckIcon, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import Fields from './Partials/Fields';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import MetaTitle from '../../Components/MetaTitle';
import MyForm from '../../Components/MyForm';

export default function Edit() {
	const { addToast } = useContext(FormosaContext);
	const { id } = useParams();
	const [row, setRow] = useState(null);
	const [error, setError] = useState(false);
	const history = useHistory();

	useEffect(() => {
		Api.get(`food/${id}?include=user`)
			.then((response) => {
				setRow(response);
			})
			.catch((response) => {
				setError(response.status);
			});
	}, [id]);

	if (error) {
		return (
			<Error status={error} />
		);
	}

	if (row === null) {
		return (
			<MetaTitle title="Edit food" />
		);
	}

	const favourite = () => {
		Api.post(`food/${id}/favourite`)
			.then(() => {
				const isFavourite = !row.is_favourite;
				setRow({ ...row, is_favourite: isFavourite });
				addToast(`Food ${isFavourite ? '' : 'un'}favourited successfully.`, 'success');
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
			});
	};

	const deleteRow = () => {
		if (!confirm('Are you sure you want to delete this food?')) { // eslint-disable-line no-restricted-globals
			return;
		}

		Api.delete(`food/${id}`)
			.then(() => {
				addToast('Food deleted successfully.', 'success');
				history.push('/food');
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
			});
	};

	const readOnly = Auth.getValue('is_admin') ? false : !row.user || row.user.id.toString() !== Auth.id().toString();

	return (
		<>
			<MetaTitle title={readOnly ? row.name : `Edit ${row.name}`}>
				{row.is_verified && <CheckIcon alt="Verified" className="verified" height={16} width={16} />}
				<button
					className={`heart ${row.is_favourite ? 'un' : ''}favourite`}
					onClick={favourite}
					type="button"
				>
					<HeartIcon alt={row.is_favourite ? 'Unfavourite' : 'Favourite'} height={16} width={16} />
				</button>
				{!readOnly && <button className="formosa-button" form="edit-form" type="submit">Save</button>}
				{!readOnly && row.deleteable && (
					<button className="formosa-button formosa-button--danger" onClick={deleteRow} type="submit">Delete</button>
				)}
			</MetaTitle>

			<MyForm
				afterSubmit={(response) => {
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
				<Fields readOnly={readOnly} row={row} />
			</MyForm>
		</>
	);
}
