import type { Exercise } from '@/types/fitness';

export const exercises: Exercise[] = [
  {
    id: 'push-up',
    name: 'Push-Up',
    description: 'A fundamental upper body exercise that builds chest, shoulders, and triceps strength.',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    difficulty: 'beginner',
    equipment: [],
    tokenReward: 8,
    instructions: [
      'Start in a plank position with hands shoulder-width apart',
      'Keep your body in a straight line from head to heels',
      'Lower your chest to the ground by bending your elbows',
      'Push back up to the starting position',
      'Repeat for desired reps'
    ],
    tips: [
      'Keep your core engaged throughout',
      'Don\'t let your hips sag',
      'Breathe out as you push up'
    ]
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    description: 'A challenging upper body exercise that targets the back and biceps.',
    muscleGroups: ['Back', 'Biceps', 'Forearms'],
    difficulty: 'advanced',
    equipment: ['Pull-up Bar'],
    tokenReward: 35,
    instructions: [
      'Hang from a pull-up bar with hands shoulder-width apart',
      'Pull yourself up until your chin is above the bar',
      'Lower yourself back down with control',
      'Repeat for desired reps'
    ],
    tips: [
      'Start with assisted pull-ups if needed',
      'Avoid swinging or kipping',
      'Full range of motion is key'
    ]
  },
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    description: 'A fundamental lower body exercise that builds leg and glute strength.',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    difficulty: 'beginner',
    equipment: [],
    tokenReward: 6,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body by bending your knees and hips',
      'Keep your chest up and back straight',
      'Go down until thighs are parallel to the ground',
      'Push through your heels to return to standing'
    ],
    tips: [
      'Keep your knees in line with your toes',
      'Don\'t let your knees go past your toes',
      'Keep your weight on your heels'
    ]
  },
  {
    id: 'dip',
    name: 'Dips',
    description: 'An effective exercise for building triceps, chest, and shoulder strength.',
    muscleGroups: ['Triceps', 'Chest', 'Shoulders'],
    difficulty: 'intermediate',
    equipment: ['Parallel Bars'],
    tokenReward: 18,
    instructions: [
      'Grip parallel bars and support your body weight',
      'Lower your body by bending your elbows',
      'Go down until your shoulders are below your elbows',
      'Push back up to the starting position',
      'Repeat for desired reps'
    ],
    tips: [
      'Lean forward slightly for more chest activation',
      'Stay upright for more triceps focus',
      'Don\'t lock out your elbows at the top'
    ]
  },
  {
    id: 'plank',
    name: 'Plank',
    description: 'A core strengthening exercise that also engages shoulders and glutes.',
    muscleGroups: ['Core', 'Shoulders', 'Glutes'],
    difficulty: 'beginner',
    equipment: [],
    tokenReward: 5,
    instructions: [
      'Start in a forearm plank position',
      'Keep your body in a straight line',
      'Hold this position for the desired time',
      'Focus on keeping your core tight'
    ],
    tips: [
      'Don\'t let your hips sag or pike up',
      'Breathe steadily throughout',
      'Squeeze your glutes and core'
    ]
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'A unilateral leg exercise that improves balance and leg strength.',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    difficulty: 'beginner',
    equipment: [],
    tokenReward: 7,
    instructions: [
      'Stand with feet hip-width apart',
      'Step forward with one leg',
      'Lower your body until both knees are at 90 degrees',
      'Push back to the starting position',
      'Repeat on the other leg'
    ],
    tips: [
      'Keep your torso upright',
      'Don\'t let your front knee go past your toes',
      'Engage your core for balance'
    ]
  },
  {
    id: 'handstand-push-up',
    name: 'Handstand Push-Up',
    description: 'An advanced vertical pressing movement that builds exceptional shoulder strength.',
    muscleGroups: ['Shoulders', 'Triceps', 'Core'],
    difficulty: 'advanced',
    equipment: ['Wall'],
    tokenReward: 50,
    instructions: [
      'Kick up into a handstand position against a wall',
      'Lower your head towards the ground',
      'Press back up to full arm extension',
      'Repeat for desired reps'
    ],
    tips: [
      'Master wall-supported handstands first',
      'Use pike push-ups as a progression',
      'Keep your core tight throughout'
    ]
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    description: 'A dynamic exercise that combines cardio with core strengthening.',
    muscleGroups: ['Core', 'Shoulders', 'Hip Flexors'],
    difficulty: 'beginner',
    equipment: [],
    tokenReward: 7,
    instructions: [
      'Start in a plank position',
      'Bring one knee towards your chest',
      'Quickly switch legs',
      'Continue alternating at a steady pace'
    ],
    tips: [
      'Keep your hips low',
      'Maintain a strong plank position',
      'Control your breathing'
    ]
  },
  {
    id: 'pistol-squat',
    name: 'Pistol Squat',
    description: 'An advanced single-leg squat that requires strength, balance, and mobility.',
    muscleGroups: ['Quadriceps', 'Glutes', 'Core'],
    difficulty: 'advanced',
    equipment: [],
    tokenReward: 40,
    instructions: [
      'Stand on one leg with the other leg extended forward',
      'Lower your body by bending the supporting leg',
      'Go as low as you can while keeping the other leg extended',
      'Push back up to the starting position',
      'Repeat on the other leg'
    ],
    tips: [
      'Use assistance until you build strength',
      'Focus on ankle mobility',
      'Keep your chest up and core engaged'
    ]
  },
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'A full-body exercise that combines strength and cardio.',
    muscleGroups: ['Full Body', 'Core', 'Legs'],
    difficulty: 'intermediate',
    equipment: [],
    tokenReward: 20,
    instructions: [
      'Start standing, then drop into a squat',
      'Place hands on the ground and kick feet back into plank',
      'Perform a push-up',
      'Jump feet back to squat position',
      'Jump up with arms overhead'
    ],
    tips: [
      'Move at your own pace',
      'Modify by stepping instead of jumping',
      'Focus on form over speed'
    ]
  },
  {
    id: 'l-sit',
    name: 'L-Sit',
    description: 'An isometric core and hip flexor exercise performed on parallel bars or the ground.',
    muscleGroups: ['Core', 'Hip Flexors', 'Triceps'],
    difficulty: 'advanced',
    equipment: ['Parallel Bars'],
    tokenReward: 45,
    instructions: [
      'Sit on the ground with legs extended forward',
      'Place hands beside your hips',
      'Press down and lift your body off the ground',
      'Keep legs straight and parallel to the ground',
      'Hold for the desired time'
    ],
    tips: [
      'Start with bent knee variations',
      'Focus on pushing shoulders down',
      'Build up hold time gradually'
    ]
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    description: 'A simple cardio exercise that warms up the entire body.',
    muscleGroups: ['Full Body', 'Cardiovascular'],
    difficulty: 'beginner',
    equipment: [],
    tokenReward: 5,
    instructions: [
      'Stand with feet together and arms at sides',
      'Jump while spreading legs and raising arms overhead',
      'Jump back to starting position',
      'Repeat at a steady pace'
    ],
    tips: [
      'Land softly on your feet',
      'Keep a steady rhythm',
      'Great for warm-ups'
    ]
  }
];
