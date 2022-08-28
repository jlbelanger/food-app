import Cookies from 'js-cookie';

export default class Auth {
	static login(user, token, remember) {
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_user`, JSON.stringify(user), Auth.attributes(remember));
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_token`, token, Auth.attributes(remember));
	}

	static refresh() {
		let user = Auth.user();
		user = user ? JSON.parse(user) : null;
		if (user && user.remember) {
			Auth.login(user, Auth.token(), user.remember);
		}
	}

	static attributes(remember) {
		const attributes = {
			sameSite: 'lax',
		};
		if (remember) {
			attributes.expires = 365;
		}
		if (window.location.protocol === 'https:') {
			attributes.secure = true;
		}
		return attributes;
	}

	static logout() {
		Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_user`);
		Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_token`);
		window.location.href = window.location.origin + process.env.PUBLIC_URL;
	}

	static id() {
		return Auth.getValue('id');
	}

	static weightUnits() {
		const measurementUnits = Auth.getValue('measurement_units');
		if (measurementUnits === 'i') {
			return 'lbs';
		}
		if (measurementUnits === 'm') {
			return 'kgs';
		}
		return '';
	}

	static hasTrackables() {
		return Auth.trackables().length > 0;
	}

	static setTrackables(trackables) {
		let user = Auth.user();
		user = user ? JSON.parse(user) : {};
		user.trackables = trackables.map((trackable) => (trackable.slug));
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_user`, JSON.stringify(user), Auth.attributes(user.remember));
	}

	static trackables() {
		return Auth.getValue('trackables', []);
	}

	static user() {
		return Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_user`);
	}

	static token() {
		return Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_token`);
	}

	static isLoggedIn() {
		return !!Auth.user() && !!Auth.token();
	}

	static getValue(key, defaultValue = null) {
		const user = Auth.user();
		return user ? JSON.parse(user)[key] : defaultValue;
	}

	static setValue(key, value) {
		let user = Auth.user();
		user = user ? JSON.parse(user) : {};
		user[key] = value;
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_user`, JSON.stringify(user), Auth.attributes(user.remember));
	}
}
