export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  videoUrl?: string;
  tokenReward: number; // CALI tokens earned upon verified completion
  tips: string[];
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  duration: string;
  totalTime: number;
  exercises: WorkoutExercise[];
}

export interface SocialVerificationData {
  uploaded: boolean;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  verifierCount?: number;
  approvalCount?: number;
  tokensEarned?: number;
}

export interface CompletedWorkout {
  id: string;
  programId: string;
  programName: string;
  date: string;
  duration: number;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps: number;
  }[];
  totalSets: number;
  totalReps: number;
  socialVerification?: SocialVerificationData;
  videoVerification?: {
    verified: boolean;
    confidence: number;
    tokensEarned: number;
    analysis?: {
      formQuality: string;
      completionRate: string;
      humanDetected: boolean;
      properTechnique: boolean;
    };
  };
}

export interface WorkoutProgress {
  totalWorkouts: number;
  totalTime: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  workouts: CompletedWorkout[];
  savedRoutines: SavedRoutine[];
}

export interface SavedRoutine {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  exercises: WorkoutExercise[];
  createdAt: string;
  lastUsed: string | null;
  timesCompleted: number;
}
