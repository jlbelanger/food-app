import { Field, Message, Submit } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import Auth from '../Utilities/Auth';
import MyForm from './MyForm';
import PropTypes from 'prop-types';

export default function UserBmi({ user }) {
	const [row, setRow] = useState(user);
	const [isMeasurementUnitsDisabled, setIsMeasurementUnitsDisabled] = useState(!!row.measurement_units);

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
					size={7}
					suffix={row.measurement_units === 'i' ? 'lbs' : 'kgs'}
				/>
				<Submit id="save-bmi" label="Save" />
			</div>
		</MyForm>
	);
}

UserBmi.propTypes = {
	user: PropTypes.object.isRequired,
};
