import { Alert, Api, FormosaContext, Input } from '@jlbelanger/formosa';
import { filterByKeys, sortByKey } from '../../Utilities/Table';
import React, { useContext, useEffect, useState } from 'react';
import { ReactComponent as ArrowIcon } from '../../../svg/arrow.svg';
import Error from '../../Error';
import { errorMessageText } from '../../Utilities/Helpers';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import { Link } from 'react-router-dom';
import MetaTitle from '../../Components/MetaTitle';

export default function List() {
	const { addToast } = useContext(FormosaContext);
	const [sortKey, setSortKey] = useState('name');
	const [sortDir, setSortDir] = useState('asc');
	const [searchValue, setSearchValue] = useState('');
	const [rows, setRows] = useState(null);
	const [filteredRows, setFilteredRows] = useState([]);
	const [error, setError] = useState(false);
	const [actionError, setActionError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		Api.get('meals?fields[meals]=is_favourite,name&sort=name', false)
			.catch((response) => {
				setError(response);
				setIsLoading(false);
			})
			.then((response) => {
				if (!response) {
					return;
				}
				setRows(response);
				setFilteredRows(response);
				setIsLoading(false);
			});
	}, []);

	if (error) {
		return (
			<Error error={error} />
		);
	}

	const totalFiltered = filteredRows.length;
	const total = rows ? rows.length : 0;

	const favourite = (e) => {
		setActionError(false);
		const id = e.target.getAttribute('data-id');
		const newRows = [...rows];
		const i = newRows.findIndex((row) => (row.id === id));
		const isFavourite = !newRows[i].is_favourite;
		if (i < 0) {
			setActionError(`Error: Unable to ${isFavourite ? '' : 'un'}favourite meal.`);
			return;
		}

		const body = {
			data: {
				id,
				type: 'meals',
				attributes: { is_favourite: isFavourite },
			},
		};

		Api.put(`meals/${id}`, JSON.stringify(body))
			.catch((response) => {
				setActionError(errorMessageText(response));
			})
			.then((response) => {
				if (!response) {
					return;
				}
				newRows[i].is_favourite = isFavourite;
				setRows(newRows);
				addToast(`Meal ${isFavourite ? '' : 'un'}favourited successfully.`, 'success');
			});
	};

	const search = (value) => {
		setSearchValue(value);

		const newRows = filterByKeys(rows, { name: value });
		setFilteredRows(newRows);
	};

	const sort = (e) => {
		const newKey = e.target.getAttribute('data-key');
		let newDir;

		if (sortKey === newKey) {
			newDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			newDir = 'asc';
		}

		setSortDir(newDir);
		setSortKey(newKey);
		setRows(sortByKey(rows, newKey, newDir));
		setFilteredRows(sortByKey(filteredRows, newKey, newDir));
	};

	const tableButton = (key, label) => (
		<button
			className="table-button"
			data-key={key}
			disabled={isLoading}
			onClick={sort}
			type="button"
		>
			{label}
			<ArrowIcon className={`caret${sortDir === 'asc' ? '' : ' flip'}${sortKey === key ? '' : ' hide'}`} height={12} width={12} />
		</button>
	);

	let numResults = `${total.toLocaleString()} result${total !== 1 ? 's' : ''}`;
	if (total !== totalFiltered) {
		numResults = `${totalFiltered.toLocaleString()} of ${numResults}`;
	}

	return (
		<>
			<MetaTitle
				title="Meals"
				small={`(${numResults})`}
			>
				<Link className="formosa-button button--small" to="/meals/new">Add</Link>
			</MetaTitle>

			{actionError && (<Alert type="error">{actionError}</Alert>)}

			{(isLoading || total > 0) && (
				<div id="search-container">
					<label className="formosa-label" htmlFor="search">Search</label>
					<Input disabled={isLoading} id="search" setValue={search} type="search" value={searchValue} />
				</div>
			)}

			{(!isLoading && totalFiltered <= 0) ? (
				<p>No results found.</p>
			) : (
				<table>
					<thead>
						<tr>
							<th aria-label="Actions" className="column--button" scope="col">{tableButton('is_favourite', '')}</th>
							<th className="column--name" scope="col">{tableButton('name', 'Name')}</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={2}>
									<div className="formosa-spinner" role="status" style={{ justifyContent: 'center', margin: '16px auto' }}>
										Loading...
									</div>
								</td>
							</tr>
						)
							: filteredRows.map((row) => (
								<tr key={row.id}>
									<td className="column--button">
										<button
											aria-label={row.is_favourite ? 'Unfavourite' : 'Favourite'}
											className={`heart ${row.is_favourite ? 'un' : ''}favourite`}
											data-id={row.id}
											onClick={favourite}
											type="button"
										>
											<HeartIcon aria-hidden height={16} width={16} />
										</button>
									</td>
									<td className="column--name"><Link className="table-link" to={`/meals/${row.id}`}>{row.name}</Link></td>
								</tr>
							))}
					</tbody>
				</table>
			)}
		</>
	);
}
