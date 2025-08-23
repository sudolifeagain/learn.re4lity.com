export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (num, size = 2) => num.toString().padStart(size, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const timeToSeconds = (timeString) => {
  if (!timeString) return 0;
  const parts = timeString.split(':');
  if (parts.length !== 3) return 0;

  const secondsAndMs = parts[2].split('.');
  
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(secondsAndMs[0], 10) || 0;
  const milliseconds = secondsAndMs.length > 1 ? parseInt(secondsAndMs[1], 10) || 0 : 0;
  
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};
