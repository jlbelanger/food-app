import { Api, Form, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Error from '../../Error';
import Fields from './Partials/Fields';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import MetaTitle from '../../MetaTitle';
import MyForm from '../../MyForm';

export default function Edit() {
	const { formosaState } = useContext(FormosaContext);
	const { id } = useParams();
	const [row, setRow] = useState(null);
	const [error, setError] = useState(false);
	const history = useHistory();
	useEffect(() => {
		if (row === null) {
			Api.get(`meals/${id}`)
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

	const favourite = (e) => {
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
				formosaState.addToast(`Meal ${isFavourite ? '' : 'un'}favourited successfully.`, 'success');
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				formosaState.addToast(text, 'error', 10000);
			});
	};

	return (
		<>
			<MetaTitle title={`Edit ${row.name}`}>
				<button
					className={`heart ${row.is_favourite ? 'un' : ''}favourite`}
					onClick={favourite}
					type="submit"
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
				relationshipNames={['user']}
				row={row}
				setRow={setRow}
				successToastText="Meal saved successfully."
			>
				<Fields row={row} />
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
