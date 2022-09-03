import { React, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function MetaTitle({ before, children, small, title }) {
	useEffect(() => {
		let metaTitle = title;
		if (process.env.REACT_APP_TITLE) {
			if (metaTitle) {
				metaTitle += ' | ';
			}
			metaTitle += process.env.REACT_APP_TITLE;
		}
		document.querySelector('title').innerText = metaTitle;
	}, [title]);

	return (
		<>
			<div id="heading">
				<div id="heading-inner">
					{before}
					<h1>
						{title}
						{small && <small className="heading-small">{small}</small>}
					</h1>
					{children}
				</div>
			</div>
			<div id="heading-spacer" />
		</>
	);
}

MetaTitle.propTypes = {
	before: PropTypes.node,
	children: PropTypes.node,
	small: PropTypes.string,
	title: PropTypes.string,
};

MetaTitle.defaultProps = {
	before: null,
	children: null,
	small: '',
	title: '',
};
