import type { WorkoutProgram } from '@/types/fitness';

export const workoutPrograms: WorkoutProgram[] = [
  {
    id: 'beginner-full-body',
    name: 'Beginner Full Body',
    description: 'A complete beginner-friendly workout targeting all major muscle groups.',
    difficulty: 'beginner',
    duration: '20-25 minutes',
    totalTime: 25,
    exercises: [
      { exerciseId: 'jumping-jacks', sets: 1, reps: 30, restSeconds: 30 },
      { exerciseId: 'push-up', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'squat', sets: 3, reps: 15, restSeconds: 60 },
      { exerciseId: 'plank', sets: 3, reps: 30, restSeconds: 60 },
      { exerciseId: 'lunges', sets: 3, reps: 10, restSeconds: 60 },
      { exerciseId: 'mountain-climbers', sets: 3, reps: 20, restSeconds: 60 }
    ]
  },
  {
    id: 'intermediate-upper',
    name: 'Intermediate Upper Body',
    description: 'Build upper body strength with push and pull movements.',
    difficulty: 'intermediate',
    duration: '30-35 minutes',
    totalTime: 35,
    exercises: [
      { exerciseId: 'jumping-jacks', sets: 1, reps: 40, restSeconds: 30 },
      { exerciseId: 'push-up', sets: 4, reps: 15, restSeconds: 60 },
      { exerciseId: 'pull-up', sets: 4, reps: 8, restSeconds: 90 },
      { exerciseId: 'dip', sets: 4, reps: 12, restSeconds: 90 },
      { exerciseId: 'plank', sets: 3, reps: 45, restSeconds: 60 },
      { exerciseId: 'mountain-climbers', sets: 4, reps: 30, restSeconds: 45 }
    ]
  },
  {
    id: 'intermediate-lower',
    name: 'Intermediate Lower Body',
    description: 'Strengthen your legs and glutes with progressive exercises.',
    difficulty: 'intermediate',
    duration: '25-30 minutes',
    totalTime: 30,
    exercises: [
      { exerciseId: 'jumping-jacks', sets: 1, reps: 40, restSeconds: 30 },
      { exerciseId: 'squat', sets: 4, reps: 20, restSeconds: 60 },
      { exerciseId: 'lunges', sets: 4, reps: 15, restSeconds: 60 },
      { exerciseId: 'burpees', sets: 3, reps: 12, restSeconds: 90 },
      { exerciseId: 'plank', sets: 3, reps: 45, restSeconds: 60 }
    ]
  },
  {
    id: 'advanced-strength',
    name: 'Advanced Strength',
    description: 'Challenge yourself with advanced movements and higher volume.',
    difficulty: 'advanced',
    duration: '40-45 minutes',
    totalTime: 45,
    exercises: [
      { exerciseId: 'burpees', sets: 2, reps: 15, restSeconds: 45 },
      { exerciseId: 'handstand-push-up', sets: 4, reps: 10, restSeconds: 120 },
      { exerciseId: 'pull-up', sets: 5, reps: 12, restSeconds: 90 },
      { exerciseId: 'pistol-squat', sets: 4, reps: 8, restSeconds: 90 },
      { exerciseId: 'dip', sets: 4, reps: 15, restSeconds: 90 },
      { exerciseId: 'l-sit', sets: 3, reps: 30, restSeconds: 90 },
      { exerciseId: 'mountain-climbers', sets: 4, reps: 40, restSeconds: 45 }
    ]
  },
  {
    id: 'quick-cardio',
    name: 'Quick Cardio Blast',
    description: 'A fast-paced workout to get your heart pumping.',
    difficulty: 'beginner',
    duration: '15 minutes',
    totalTime: 15,
    exercises: [
      { exerciseId: 'jumping-jacks', sets: 3, reps: 40, restSeconds: 30 },
      { exerciseId: 'burpees', sets: 3, reps: 10, restSeconds: 45 },
      { exerciseId: 'mountain-climbers', sets: 3, reps: 30, restSeconds: 30 },
      { exerciseId: 'squat', sets: 3, reps: 20, restSeconds: 30 }
    ]
  },
  {
    id: 'core-crusher',
    name: 'Core Crusher',
    description: 'Focused core workout to build a strong midsection.',
    difficulty: 'intermediate',
    duration: '20 minutes',
    totalTime: 20,
    exercises: [
      { exerciseId: 'plank', sets: 3, reps: 60, restSeconds: 45 },
      { exerciseId: 'mountain-climbers', sets: 4, reps: 30, restSeconds: 45 },
      { exerciseId: 'l-sit', sets: 3, reps: 20, restSeconds: 60 },
      { exerciseId: 'burpees', sets: 3, reps: 12, restSeconds: 60 }
    ]
  }
];
