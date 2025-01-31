import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCw } from 'lucide-react';

interface AudioMessageProps {
  url: string;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Reset states when URL changes
      setIsLoading(true);
      setError(null);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);

      const handleCanPlay = () => {
        console.log('Audio can play');
        setIsLoading(false);
        setError(null);
      };

      const handleLoadedMetadata = () => {
        console.log('Audio metadata loaded, duration:', audio.duration);
        setDuration(audio.duration);
        setIsLoading(false);
      };

      const handleError = (e: ErrorEvent) => {
        console.error('Audio loading error:', e);
        setError('Failed to load audio');
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      // Verify URL is valid
      if (!url) {
        setError('Invalid audio URL');
        setIsLoading(false);
        return;
      }

      console.log('Loading audio from URL:', url);
      
      // Add event listeners
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('error', handleError as EventListener);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      // Set audio source and load
      audio.src = url;
      audio.load();

      // Cleanup
      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('error', handleError as EventListener);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.src = ''; // Clear source on cleanup
      };
    }
  }, [url]);

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          setIsLoading(true);
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (err) {
        console.error('Audio playback error:', err);
        setError('Failed to play audio');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const retry = () => {
    if (audioRef.current) {
      setError(null);
      setIsLoading(true);
      audioRef.current.load();
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-700/30 rounded-lg">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setError('Failed to load audio');
          setIsLoading(false);
        }}
      />
      
      {error ? (
        <div className="flex items-center gap-2 text-red-400">
          <span>{error}</span>
          <button
            onClick={retry}
            className="p-2 hover:bg-gray-600/30 rounded-full transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isLoading || !duration}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 0)}</span>
              </div>
            </div>

            <button
              onClick={toggleMute}
              disabled={isLoading}
              className="p-2 hover:bg-gray-600/30 rounded-full transition-colors disabled:opacity-50"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 