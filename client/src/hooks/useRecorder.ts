import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'requesting' | 'ready' | 'recording' | 'paused' | 'stopped';

interface UseRecorderOptions {
  /** Audio format (default: audio/webm) */
  mimeType?: string;
  /** Called when recording is complete */
  onComplete?: (blob: Blob) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

interface UseRecorderResult {
  /** Current recording state */
  state: RecordingState;
  /** Recording duration in seconds */
  duration: number;
  /** Audio level (0-1) for visualization */
  audioLevel: number;
  /** Whether microphone permission was denied */
  permissionDenied: boolean;
  /** Start recording */
  start: () => Promise<void>;
  /** Stop recording and get blob */
  stop: () => void;
  /** Pause recording */
  pause: () => void;
  /** Resume recording */
  resume: () => void;
  /** Request microphone permission */
  requestPermission: () => Promise<boolean>;
  /** The recorded blob (available after stop) */
  blob: Blob | null;
  /** Reset to idle state */
  reset: () => void;
}

export function useRecorder(options: UseRecorderOptions = {}): UseRecorderResult {
  const { mimeType = 'audio/webm', onComplete, onError } = options;

  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setState('requesting');
    setPermissionDenied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop the test stream
      stream.getTracks().forEach((track) => track.stop());
      setState('ready');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionDenied(true);
      setState('idle');
      onError?.(error instanceof Error ? error : new Error('Permission denied'));
      return false;
    }
  }, [onError]);

  // Update audio level for visualization
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average level
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);

    if (state === 'recording') {
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [state]);

  // Start recording
  const start = useCallback(async () => {
    try {
      // Get fresh stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine supported mimeType
      let actualMimeType = mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback options
        const fallbacks = ['audio/webm', 'audio/ogg', 'audio/mp4', ''];
        actualMimeType = fallbacks.find((type) => type === '' || MediaRecorder.isTypeSupported(type)) || '';
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: actualMimeType || undefined,
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: actualMimeType || 'audio/webm',
        });
        setBlob(recordedBlob);
        setState('stopped');
        cleanup();
        onComplete?.(recordedBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setState('idle');
        cleanup();
        onError?.(new Error('Recording failed'));
      };

      mediaRecorderRef.current = mediaRecorder;

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setState('recording');
      setDuration(0);

      // Start timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setDuration((Date.now() - startTime) / 1000);
      }, 100);

      // Start audio level updates
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to start recording:', error);
      if ((error as Error).name === 'NotAllowedError') {
        setPermissionDenied(true);
      }
      setState('idle');
      onError?.(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }, [mimeType, cleanup, onComplete, onError, updateAudioLevel]);

  // Stop recording
  const stop = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [state]);

  // Pause recording
  const pause = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [state]);

  // Resume recording
  const resume = useCallback(() => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');

      // Resume timer from current duration
      const pausedDuration = duration;
      const resumeTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setDuration(pausedDuration + (Date.now() - resumeTime) / 1000);
      }, 100);

      // Resume audio level updates
      updateAudioLevel();
    }
  }, [state, duration, updateAudioLevel]);

  // Reset to idle state
  const reset = useCallback(() => {
    cleanup();
    setState('idle');
    setDuration(0);
    setBlob(null);
    chunksRef.current = [];
    mediaRecorderRef.current = null;
  }, [cleanup]);

  return {
    state,
    duration,
    audioLevel,
    permissionDenied,
    start,
    stop,
    pause,
    resume,
    requestPermission,
    blob,
    reset,
  };
}

// Format duration as MM:SS
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
