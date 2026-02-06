import { useState, useMemo } from 'react'
import { workoutProgram as training_plan } from '../utils/index.js'
import WorkoutCard from './WorkoutCard.jsx'

export default function Grid() {
    const [savedWorkouts, setSavedWorkouts] = useState(() => {
        if (typeof window === 'undefined') return {}
        if (!window.localStorage) return {}
        try {
            const raw = window.localStorage.getItem('liftlog')
            return raw ? JSON.parse(raw) : {}
        } catch {
            return {}
        }
    })
    const [selectedWorkout, setSelectedWorkout] = useState(null)

    const completedWorkouts = useMemo(() => {
        return Object.keys(savedWorkouts || {}).filter((val) => {
            const entry = savedWorkouts?.[val]
            return !!entry?.isComplete
        })
    }, [savedWorkouts])

    function normalizeWeights(weights) {
        const input = weights && typeof weights === 'object' ? weights : {}
        const cleaned = {}
        Object.entries(input).forEach(([exerciseName, value]) => {
            const normalizedValue = value === null || value === undefined ? '' : String(value).trim()
            if (normalizedValue === '') return
            const num = Number(normalizedValue)
            if (!Number.isFinite(num)) return
            if (num < 0) return
            cleaned[exerciseName] = normalizedValue
        })
        return cleaned
    }

    function areAllWorkoutWeightsFilled(workoutIndex, weights) {
        const trainingPlan = training_plan?.[workoutIndex]
        const required = trainingPlan?.workout || []
        if (!required.length) return false
        const cleaned = normalizeWeights(weights)
        return required.every((exercise) => {
            const value = cleaned?.[exercise.name]
            return typeof value === 'string' && value.trim() !== ''
        })
    }

    function handleSave(index, data) {
        // save to local storage and modify the saved workouts state
        const cleanedWeights = normalizeWeights(data?.weights)
        const wasComplete = !!savedWorkouts?.[index]?.isComplete

        // Completion is not "sticky": if a previously-completed day becomes incomplete, it should re-lock later days.
        const nextIsComplete = data?.isComplete === true
            ? true
            : (wasComplete ? areAllWorkoutWeightsFilled(index, cleanedWeights) : false)

        const newObj = {
            ...savedWorkouts,
            [index]: {
                ...data,
                weights: cleanedWeights,
                isComplete: nextIsComplete
            }
        }
        setSavedWorkouts(newObj)
        window.localStorage.setItem('liftlog', JSON.stringify(newObj))
        setSelectedWorkout(null)
    }

    function handleComplete(index, data) {
        // complete a workout (so basically we modify the completed status)
        const cleanedWeights = normalizeWeights(data?.weights)
        if (!areAllWorkoutWeightsFilled(index, cleanedWeights)) {
            return
        }
        handleSave(index, { weights: cleanedWeights, isComplete: true })
    }

    return (
        <div className="training-plan-grid">
            {Object.keys(training_plan).map((workout, workoutIndex) => {
                const isLocked = workoutIndex === 0 ?
                    false :
                    !completedWorkouts.includes(`${workoutIndex - 1}`)
                console.log(workoutIndex, isLocked)

                const type = workoutIndex % 3 === 0 ?
                    'Push' :
                    workoutIndex % 3 === 1 ?
                        'Pull' :
                        'Legs'

                const trainingPlan = training_plan[workoutIndex]
                const dayNum = ((workoutIndex / 8) <= 1) ? '0' + (workoutIndex + 1) : workoutIndex + 1
                const icon = workoutIndex % 3 === 0 ? (
                    <i className='fa-solid fa-dumbbell'></i>
                ) : (
                    workoutIndex % 3 === 1 ? (
                        <i className='fa-solid fa-weight-hanging'></i>
                    ) : (
                        <i className='fa-solid fa-bolt'></i>
                    )
                )

                if (workoutIndex === selectedWorkout) {
                    return (
                        <WorkoutCard savedWeights={savedWorkouts?.[workoutIndex]?.weights} handleSave={handleSave} handleComplete={handleComplete} key={workoutIndex} trainingPlan={trainingPlan} type={type} workoutIndex={workoutIndex} icon={icon} dayNum={dayNum} />
                    )
                }

                return (
                    <button onClick={() => {
                        if (isLocked) { return }
                        setSelectedWorkout(workoutIndex)
                    }} className={'card plan-card  ' + (isLocked ? 'inactive' : '')} key={workoutIndex}>
                        <div className='plan-card-header'>
                            <p>Day {dayNum}</p>
                            {isLocked ? (
                                <i className='fa-solid fa-lock'></i>
                            ) : (icon)}
                        </div>

                        <div className='plan-card-header'>
                            <h4><b>{type}</b></h4>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}