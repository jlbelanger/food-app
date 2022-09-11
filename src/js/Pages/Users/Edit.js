import { Api, Field, Form, FormosaContext, Message, Submit } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import MetaTitle from '../../Components/MetaTitle';
import MyForm from '../../Components/MyForm';

export default function Edit() {
	const { addToast } = useContext(FormosaContext);
	const id = Auth.id();
	const [row, setRow] = useState(null);
	const [error, setError] = useState(false);
	const [types, setTypes] = useState([]);
	const [isMeasurementUnitsDisabled, setIsMeasurementUnitsDisabled] = useState(true);

	useEffect(() => {
		Api.get(`users/${id}?fields[trackables]=name,slug&include=trackables`)
			.then((response) => {
				setRow(response);
				if (!response.measurement_units) {
					setIsMeasurementUnitsDisabled(false);
				}
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
			<MetaTitle title="Edit profile" />
		);
	}

	const sexes = {
		m: 'male',
		f: 'female',
	};
	const activityLevels = {
		20: 'barely active',
		30: 'lightly active',
		40: 'moderately active',
		50: 'very active',
		60: 'extremely active',
	};
	const measurementUnits = {
		i: 'imperial (weight in pounds, height in inches)',
		m: 'metric (weight in kilograms, height in centimetres)',
	};

	const afterSubmit = () => {
		if (row.measurement_units) {
			setIsMeasurementUnitsDisabled(true);
			Auth.setValue('measurement_units', row.measurement_units);
		}
	};

	const calculateBmi = () => {
		if (!row.height || !row.weight || !row.weight.weight || !row.measurement_units) {
			return null;
		}

		let output;

		if (row.measurement_units === 'i') {
			output = (row.weight.weight * 703) / (row.height * row.height);
		} else if (row.measurement_units === 'm') {
			output = row.weight.weight / (row.height * row.height);
		} else {
			return null;
		}

		return output.toFixed(2);
	};

	const calculateMaintenanceCalories = () => {
		if (!row.height || row.age < 18 || !row.activity_level || !row.weight || !row.weight.weight || !row.measurement_units) {
			return null;
		}

		let weight = row.weight.weight;
		let height = row.height;
		if (row.measurement_units === 'm') {
			weight *= 2.20462262;
			height *= 39.3700787;
		}

		let bmr;
		if (row.sex === 'f') {
			bmr = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * row.age);
		} else if (row.sex === 'm') {
			bmr = 66 + (6.3 * weight) + (12.9 * height) - (6.8 * row.age);
		} else {
			return null;
		}

		return Math.round(bmr + bmr * row.activity_level * 0.01);
	};

	const bmi = calculateBmi();
	const maintenanceCalories = calculateMaintenanceCalories();
	let bmiNote = '';
	if (bmi) {
		if (bmi < 18.5) {
			bmiNote = ' (underweight - below 18.5)';
		} else if (bmi < 24.9) {
			bmiNote = ' (normal - 18.5–24.9)';
		} else if (bmi < 29.9) {
			bmiNote = ' (overweight - 25.0–29.9)';
		} else {
			bmiNote = ' (obese - above 30.0)';
		}
	}
	const showBmi = !!row.height && row.age >= 18 && !!row.activity_level && !!row.weight && !!row.weight.weight && !!row.measurement_units;
	let weightDate = '';
	if (row.weight) {
		weightDate = new Date(`${row.weight.date}T12:00:00Z`).toLocaleString('en-CA', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	return (
		<>
			<MetaTitle title="Edit profile" />

			<MyForm
				afterSubmit={afterSubmit}
				id={row.id}
				method="PUT"
				path="users"
				preventEmptyRequest
				row={row}
				setRow={setRow}
				showMessage={false}
				successToastText="BMI settings updated successfully."
			>
				<h2>BMI</h2>

				<Message />

				{showBmi ? (
					/* eslint-disable react/jsx-one-expression-per-line */
					<p id="bmi">Your BMI is <b>{bmi}</b>{bmiNote}.</p>
				) : (
					<p>Fill out the fields below to see your BMI.</p>
				)}
				{maintenanceCalories && (
					<p id="calories">
						You should be eating <b>{`${maintenanceCalories.toLocaleString()} calories`}</b> a day to maintain your current weight.
						<br />
						{`You should not consume any less than ${row.sex === 'f' ? '1,200' : '1,500'} calories per day.`}
						<br />
						To lose one pound a week, you should be eating <b>{`${(maintenanceCalories - 500).toLocaleString()} calories`}</b> a day.
						<br />
						<span className="formosa-field__note">
							There are 3,500 calories in one pound of fat, and 3,500 divided by 7 days of the week is 500, so to lose one pound a week,
							you should eat 500 calories less in a day than the calories you would eat to maintain your weight.
						</span>
					</p>
					/* eslint-enable react/jsx-one-expression-per-line */
				)}

				<div className="formosa-responsive">
					<Field
						disabled={isMeasurementUnitsDisabled}
						label="Measurement units"
						name="measurement_units"
						note="This field cannot be changed once it has been set."
						options={measurementUnits}
						type="select"
					/>
					<Field label="Activity level" name="activity_level" options={activityLevels} type="select" />
					<Field label="Sex" name="sex" options={sexes} type="select" />
					<Field inputMode="numeric" label="Age" name="age" pattern="[0-9]*" size={5} />
					<Field
						inputMode="numeric"
						label="Height"
						name="height"
						pattern="[0-9]*"
						size={5}
						suffix={row.measurement_units === 'i' ? 'inches' : 'centimetres'}
					/>
					<Field
						disabled
						label="Weight"
						name="weight.weight"
						note={row.weight
							? `This is the most recent weight entered in the diary (${weightDate}).`
							: 'Enter your weight in the diary section.'}
						size={5}
						suffix={row.measurement_units === 'i' ? 'lbs' : 'kgs'}
					/>
					<Submit id="save-bmi" label="Save" />
				</div>
			</MyForm>

			<hr />

			<MyForm
				afterSubmit={() => {
					Auth.setTrackables(row.trackables);
				}}
				id={row.id}
				method="PUT"
				path="users"
				preventEmptyRequest
				relationshipNames={['trackables']}
				row={row}
				setRow={setRow}
				showMessage={false}
				successToastText="Tracking settings updated successfully."
			>
				<h2>Tracking</h2>

				<Message />

				<Field
					name="trackables"
					fieldsetClassName="formosa-radio--inline"
					inputAttributes={(option) => ({ id: `trackable-${option.slug}` })}
					type="checkbox-list"
					url="trackables?fields[trackables]=name,slug&sort=slug"
				/>

				<Submit id="save-tracking" label="Save" />
			</MyForm>

			<hr />

			<h2>Account</h2>

			<MyForm
				id={row.id}
				method="PUT"
				path="users"
				preventEmptyRequest
				row={row}
				setRow={setRow}
				showMessage={false}
				successToastText="Username changed successfully."
			>
				<h3>Change username</h3>

				<Message />

				<Field
					autoComplete="username"
					label="Username"
					name="username"
					required
				/>

				<Submit label="Change username" />
			</MyForm>

			<hr />

			<MyForm
				method="PUT"
				path={`users/${row.id}/change-email`}
				preventEmptyRequest
				row={row}
				setRow={setRow}
				showMessage={false}
				successToastText="Email changed successfully."
			>
				<h3>Change email</h3>

				<Message />

				<Field
					autoComplete="email"
					label="Email"
					name="email"
					required
					type="email"
				/>

				<Field
					autoComplete="current-password"
					id="current-password-email"
					label="Current password"
					name="password"
					required
					type="password"
				/>

				<Submit label="Change email" />
			</MyForm>

			<hr />

			<MyForm
				clearOnSubmit
				method="PUT"
				path={`users/${row.id}/change-password`}
				preventEmptyRequest
				row={row}
				setRow={setRow}
				showMessage={false}
				successToastText="Password changed successfully."
			>
				<h3>Change password</h3>

				<Message />

				<Field
					autcomplete="new-password"
					label="New password"
					name="new_password"
					required
					type="password"
				/>

				<Field
					autcomplete="new-password"
					label="Confirm new password"
					name="new_password_confirmation"
					required
					type="password"
				/>

				<Field
					autoComplete="current-password"
					id="current-password-password"
					label="Current password"
					name="password"
					required
					type="password"
				/>

				<Submit label="Change password" />
			</MyForm>

			<hr />

			<h3>Delete data</h3>

			<Form
				onSubmit={(e) => {
					e.preventDefault();

					if (!confirm('Are you sure you want to delete this data?')) { // eslint-disable-line no-restricted-globals
						return;
					}

					Api.post('users/delete-data', JSON.stringify({ types }))
						.then(() => {
							addToast('Data deleted successfully.', 'success');
						})
						.catch((response) => {
							const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
							addToast(text, 'error', 10000);
						});
				}}
			>
				<Field
					fieldsetClassName="formosa-radio--inline"
					options={['entries', 'meals', 'weights']}
					name="types"
					value={types}
					setValue={setTypes}
					type="checkbox-list"
				/>

				<Submit className="formosa-button--danger" label="Delete data" />
			</Form>

			<Form
				afterSubmit={() => {
					Auth.logout();
				}}
				beforeSubmit={() => (
					confirm('Are you sure you want to delete your account?') // eslint-disable-line no-restricted-globals
				)}
				id={row.id}
				method="DELETE"
				path="users"
				showMessage={false}
			>
				<Message />

				<Submit className="formosa-button--danger" label="Delete account" />
			</Form>
		</>
	);
}
