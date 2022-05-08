import { React, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function MetaTitle({ children, small, title }) {
	useEffect(() => {
		let metaTitle = title;
		if (process.env.REACT_APP_TITLE) {
			if (metaTitle) {
				metaTitle += ' | ';
			}
			metaTitle += process.env.REACT_APP_TITLE;
		}
		document.querySelector('title').innerText = metaTitle;
		return () => {};
	}, [title]);

	return (
		<>
			<div id="heading">
				<h1>
					<span className="heading-text">
						{title}
						{small && <small className="heading-small">{small}</small>}
					</span>
					{children}
				</h1>
			</div>
			<div id="heading-spacer" />
		</>
	);
}

MetaTitle.propTypes = {
	children: PropTypes.node,
	small: PropTypes.string,
	title: PropTypes.string,
};

MetaTitle.defaultProps = {
	children: null,
	small: '',
	title: '',
};
