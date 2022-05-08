import { Api, CheckIcon, Form } from '@jlbelanger/formosa';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import Fields from './Partials/Fields';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import MetaTitle from '../../MetaTitle';
import MyForm from '../../MyForm';

export default function Edit() {
	const { id } = useParams();
	const [row, setRow] = useState(null);
	const [error, setError] = useState(false);
	const history = useHistory();
	useEffect(() => {
		if (row === null) {
			Api.get(`food/${id}?include=user`)
				.then((response) => {
					setRow(response);
				})
				.catch((response) => {
					setError(response.status);
				});
		}
		return () => {};
	}, []);

	if (error) {
		return (
			<Error status={error} />
		);
	}

	if (row === null) {
		return null;
	}

	const readOnly = Auth.isAdmin() ? false : !row.user || row.user.id.toString() !== Auth.id().toString();

	return (
		<>
			<MetaTitle title={readOnly ? row.name : `Edit ${row.name}`}>
				{row.is_verified && <CheckIcon alt="Verified" className="verified" height={16} width={16} />}
				<button
					className={`heart ${row.is_favourite ? 'un' : ''}favourite`}
					form="favourite-form"
					type="submit"
				>
					<HeartIcon alt={row.is_favourite ? 'Unfavourite' : 'Favourite'} height={16} width={16} />
				</button>
				{!readOnly && <button className="formosa-button" form="edit-form" type="submit">Save</button>}
				{!readOnly && <button className="formosa-button formosa-button--danger" form="delete-form" type="submit">Delete</button>}
			</MetaTitle>

			<MyForm
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

			{!readOnly && (
				<Form
					afterSubmit={() => {
						history.push('/food');
					}}
					beforeSubmit={() => (
						confirm('Are you sure you want to delete this food?') // eslint-disable-line no-restricted-globals
					)}
					htmlId="delete-form"
					id={id}
					method="DELETE"
					path="food"
					showMessage={false}
					successToastText="Food deleted successfully."
				/>
			)}

			<Form
				afterSubmit={() => {
					setRow({ ...row, is_favourite: !row.is_favourite });
				}}
				htmlId="favourite-form"
				method="POST"
				path={`food/${id}/favourite`}
				showMessage={false}
				successToastText={`Food ${row.is_favourite ? 'un' : ''}favourited successfully.`}
			/>
		</>
	);
}
