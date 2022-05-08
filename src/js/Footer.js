import Auth from './Utilities/Auth';
import { NavLink } from 'react-router-dom';
import React from 'react';

export default function Footer() {
	return (
		<footer id="footer">
			<nav className="contain" id="nav">
				{Auth.isLoggedIn() ? (
					<>
						<NavLink activeClassName="nav__link--active" className="nav__link" exact to="/">Diary</NavLink>
						<NavLink activeClassName="nav__link--active" className="nav__link" to="/food">Food</NavLink>
						<NavLink activeClassName="nav__link--active" className="nav__link" to="/meals">Meals</NavLink>
					</>
				) : (
					<>
						<NavLink activeClassName="nav__link--active" className="nav__link" exact to="/">Login</NavLink>
						<NavLink activeClassName="nav__link--active" className="nav__link" to="/register">Register</NavLink>
					</>
				)}
			</nav>
		</footer>
	);
}
