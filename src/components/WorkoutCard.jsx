import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import { exerciseDescriptions } from '../utils';

export default function WorkoutCard(props) {
  const { trainingPlan, workoutIndex, type, dayNum, icon, savedWeights, handleSave, handleComplete } = props;

  const { warmup, workout } = trainingPlan || {};

  const [showExerciseDescription, setShowExerciseDescription] = useState(null);
  const [weights, setWeights] = useState(savedWeights || {});

  function normalizeWeights(inputWeights) {
    const input = inputWeights && typeof inputWeights === 'object' ? inputWeights : {};
    const cleaned = {};
    Object.entries(input).forEach(([exerciseName, value]) => {
      const normalizedValue = value === null || value === undefined ? '' : String(value).trim();
      if (normalizedValue === '') return;
      const num = Number(normalizedValue);
      if (!Number.isFinite(num)) return;
      if (num < 0) return;
      cleaned[exerciseName] = normalizedValue;
    });
    return cleaned;
  }

  const canComplete = useMemo(() => {
    const required = workout || [];
    if (!required.length) return false;
    const cleaned = normalizeWeights(weights);
    return required.every((exercise) => {
      const value = cleaned?.[exercise.name];
      return typeof value === 'string' && value.trim() !== '';
    });
  }, [weights, workout]);

  function handleAddWeight(title, weight) {
    console.log(title, weight);
    const newObj = { ...weights, [title]: weight };
    setWeights(newObj);
  }

  return (
    <div className="workout-container">
      {showExerciseDescription && (
        <Modal showExerciseDescription={showExerciseDescription} handleCloseModal={() => {
          setShowExerciseDescription(null);
        }} />
      )}
      <div className="workout-card card">
        <div className="plan-card-header">
          <p>Day {dayNum}</p>
          {icon}
        </div>
        <div className="plan-card-header">
          <h2><b>{type} Workout</b></h2>
        </div>
      </div>

      <div className="workout-grid">
        <div className="exercise-name">
          <h4>Warmup</h4>
        </div>
        <h6>Sets</h6>
        <h6>Reps</h6>
        <h6 className="weight-input">Max Weight</h6>
        {warmup.map((warmupExercise, warmupIndex) => {
          return (
            <React.Fragment key={warmupIndex}>
              <div className="exercise-name">
                <p>{warmupIndex + 1}. {warmupExercise.name}</p>
                <button onClick={() => setShowExerciseDescription({ name: warmupExercise.name, description: exerciseDescriptions[warmupExercise.name] })} className='help-icon'>
                  <i className="fa-solid fa-circle-question"></i>
                </button>
              </div>
              <p className='exercise-info'>{warmupExercise.sets}</p>
              <p className='exercise-info'>{warmupExercise.reps}</p>
              <input className='weight-input' placeholder='N/A' disabled />
            </React.Fragment>
          )
        })}
      </div>

      <div className="workout-grid">
        <div className="exercise-name">
          <h4>Workout</h4>
        </div>
        <h6>Sets</h6>
        <h6>Reps</h6>
        <h6 className="weight-input">Max Weight*</h6>
        {workout.map((workoutExercise, wIndex) => {
          return (
            <React.Fragment key={wIndex}>
              <div className="exercise-name">
                <p>{wIndex + 1}. {workoutExercise.name}</p>
                <button onClick={() => setShowExerciseDescription({ name: workoutExercise.name, description: exerciseDescriptions[workoutExercise.name] })} className='help-icon'>
                  <i className="fa-solid fa-circle-question"></i>
                </button>
              </div>
              <p className='exercise-info'>{workoutExercise.sets}</p>
              <p className='exercise-info'>{workoutExercise.reps}</p>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={weights?.[workoutExercise.name] ?? ''}
                onChange={(e) => handleAddWeight(workoutExercise.name, e.target.value)}
                className='weight-input'
                placeholder='Enter max weight'
              />
            </React.Fragment>
          )
        })}
      </div>
      <p className="unlock-hint">* To unlock the next day: enter Max Weight for every workout exercise, then press Complete.</p>
      <div className='workout-buttons'>
        <button onClick={() => handleSave(workoutIndex, { weights: normalizeWeights(weights) })}>Save & Exit</button>
        <button onClick={() => handleComplete(workoutIndex, { weights: normalizeWeights(weights) })} disabled={!canComplete}>Complete</button>
      </div>
    </div>
  )
}
