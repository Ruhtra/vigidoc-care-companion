import { useCallback, useRef } from "react";

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      
      // Resume context if it's suspended (browser autoplay policy)
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const now = audioContext.currentTime;

      // Create a pleasant two-tone notification sound
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, now);

        // Envelope for each note
        const noteStart = now + index * 0.1;
        const noteDuration = 0.3;
        
        gainNode.gain.setValueAtTime(0, noteStart);
        gainNode.gain.linearRampToValueAtTime(0.3, noteStart + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, noteStart + noteDuration);

        oscillator.start(noteStart);
        oscillator.stop(noteStart + noteDuration);
      });

      // Add a second chord after a brief pause
      setTimeout(() => {
        const secondFrequencies = [659.25, 783.99, 987.77]; // E5, G5, B5
        const nowSecond = audioContext.currentTime;

        secondFrequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(freq, nowSecond);

          const noteStart = nowSecond + index * 0.08;
          const noteDuration = 0.4;
          
          gainNode.gain.setValueAtTime(0, noteStart);
          gainNode.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, noteStart + noteDuration);

          oscillator.start(noteStart);
          oscillator.stop(noteStart + noteDuration);
        });
      }, 350);

      console.log("[Sound] Som de notificação reproduzido");
      return true;
    } catch (error) {
      console.error("[Sound] Erro ao reproduzir som:", error);
      return false;
    }
  }, [getAudioContext]);

  const playSuccessSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const now = audioContext.currentTime;

      // Simple success beep
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, now); // A5

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      oscillator.start(now);
      oscillator.stop(now + 0.15);

      return true;
    } catch (error) {
      console.error("[Sound] Erro ao reproduzir som de sucesso:", error);
      return false;
    }
  }, [getAudioContext]);

  return {
    playNotificationSound,
    playSuccessSound,
  };
};
