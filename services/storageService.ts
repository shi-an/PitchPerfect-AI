import { PitchSession } from '../types';

const DB_KEY_PREFIX = 'pitchperfect_db_';

// Simulate MongoDB save
export const savePitchSession = async (session: PitchSession): Promise<void> => {
  // In a real app, this would be: await axios.post('/api/pitches', session);
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = `${DB_KEY_PREFIX}${session.userId}`;
      const existingData = localStorage.getItem(key);
      const history: PitchSession[] = existingData ? JSON.parse(existingData) : [];
      
      // Check if session already exists (update it), otherwise add new
      const index = history.findIndex(h => h.id === session.id);
      if (index >= 0) {
        history[index] = session;
      } else {
        history.unshift(session); // Add to top
      }
      
      localStorage.setItem(key, JSON.stringify(history));
      resolve();
    }, 300); // Simulate network latency
  });
};

// Simulate MongoDB find query
export const getUserHistory = async (userId: string): Promise<PitchSession[]> => {
  // In a real app, this would be: await axios.get(`/api/pitches?userId=${userId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
        const key = `${DB_KEY_PREFIX}${userId}`;
        const data = localStorage.getItem(key);
        resolve(data ? JSON.parse(data) : []);
    }, 300);
  });
};
