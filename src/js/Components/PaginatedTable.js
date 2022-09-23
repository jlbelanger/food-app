import { React, useState } from 'react';
import PropTypes from 'prop-types';

export default function PaginatedTable({ body, head, perPage, rows }) {
	const [currentPage, setCurrentPage] = useState(1);
	const numRows = rows.length;
	const numPages = Math.ceil(numRows / perPage);

	const start = (currentPage - 1) * perPage;
	const slice = rows.slice(start, start + perPage);

	const prevPage = () => {
		setCurrentPage(currentPage - 1);
	};

	const nextPage = () => {
		setCurrentPage(currentPage + 1);
	};

	return (
		<>
			<table className="paginated-table">
				<thead>
					{head}
				</thead>
				<tbody>
					{slice.map((row) => body(row))}
				</tbody>
			</table>
			{numPages > 1 && (
				<div className="pagination">
					<button
						className="formosa-button button--secondary button--small"
						disabled={currentPage <= 1}
						onClick={prevPage}
						type="button"
					>
						Previous
					</button>
					<span className="pagination__num">{`Page ${currentPage.toLocaleString()} of ${numPages.toLocaleString()}`}</span>
					<button
						className="formosa-button button--secondary button--small"
						disabled={currentPage >= numPages}
						onClick={nextPage}
						type="button"
					>
						Next
					</button>
				</div>
			)}
		</>
	);
}

PaginatedTable.propTypes = {
	body: PropTypes.func.isRequired,
	head: PropTypes.node.isRequired,
	perPage: PropTypes.number,
	rows: PropTypes.array,
};

PaginatedTable.defaultProps = {
	perPage: 5,
	rows: [],
};
