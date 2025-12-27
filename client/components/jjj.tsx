import React, { useRef, useState, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record';

interface VoiceCaptureProps {
    onSubmit?: (audioBlob: Blob) => void;
}
 const VoiceCapture: React.FC<VoiceCaptureProps> = ({ onSubmit }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const recordRef = useRef<RecordPlugin | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

    useEffect(() => {
        const wavesurfer = WaveSurfer.create({
            container: containerRef.current!,
            waveColor: '#ddd',
            progressColor: '#0078d4',
            height: 100,
        });

        const record = wavesurfer.registerPlugin(RecordPlugin.create());

        wavesurferRef.current = wavesurfer;
        recordRef.current = record;

        return () => {
            wavesurfer.destroy();
        };
    }, []);

    const startRecording = async () => {
        recordRef.current?.startRecording();
        setIsRecording(true);
        setIsPaused(false);
    };

    const pauseRecording = () => {
        recordRef.current?.pauseRecording();
        setIsRecording(false);
        setIsPaused(true);
    };

    const resumeRecording = () => {
        recordRef.current?.resumeRecording();
        setIsRecording(true);
        setIsPaused(false);
    };

    const stopRecording = async () => {
        const recordedBlob = await recordRef.current?.stopRecording();
        if (recordedBlob) {
            setRecordedChunks([...recordedChunks, recordedBlob]);
            setIsRecording(false);
            setIsPaused(false);
            wavesurferRef.current?.loadBlob(recordedBlob);
        }
    };

    const playRecording = () => {
        wavesurferRef.current?.play();
    };

    const submitAudio = async () => {
        if (recordedChunks.length === 0) return;
        
        const audioContext = new AudioContext();
        const audioBuffers = await Promise.all(
            recordedChunks.map(blob => blob.arrayBuffer().then(buf => audioContext.decodeAudioData(buf)))
        );

        const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.length, 0);
        const merged = audioContext.createBuffer(1, totalLength, audioContext.sampleRate);
        const mergedData = merged.getChannelData(0);

        let offset = 0;
        audioBuffers.forEach(buf => {
            mergedData.set(buf.getChannelData(0), offset);
            offset += buf.length;
        });

        const blob = await new Promise<Blob>(resolve => {
            const offlineContext = new OfflineAudioContext(1, totalLength, audioContext.sampleRate);
            const source = offlineContext.createBufferSource();
            source.buffer = merged;
            source.connect(offlineContext.destination);
            source.start(0);
            offlineContext.oncomplete = e => {
                const wav = audioBufferToWav(e.renderedBuffer);
                resolve(new Blob([wav], { type: 'audio/wav' }));
            };
            offlineContext.startRendering();
        });

        onSubmit?.(blob);
    };

    const audioBufferToWav = (audioBuffer: AudioBuffer): ArrayBuffer => {
        const length = audioBuffer.length * audioBuffer.numberOfChannels * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];
        let offset = 0;
        let pos = 44;

        const setUint16 = (num: number) => {
            view.setUint16(offset, num, true);
            offset += 2;
        };
        const setUint32 = (num: number) => {
            view.setUint32(offset, num, true);
            offset += 4;
        };

        setUint32(0x46464952);
        setUint32(length - 8);
        setUint32(0x45564157);
        setUint32(0x20746d66);
        setUint32(16);
        setUint16(1);
        setUint16(audioBuffer.numberOfChannels);
        setUint32(audioBuffer.sampleRate);
        setUint32(audioBuffer.sampleRate * 2 * audioBuffer.numberOfChannels);
        setUint16(audioBuffer.numberOfChannels * 2);
        setUint16(16);
        setUint32(0x61746164);
        setUint32(length - pos);

        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        while (pos < length) {
            for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                view.setInt16(pos, channels[i][offset / audioBuffer.numberOfChannels] * 0x7fff, true);
                pos += 2;
            }
            offset++;
        }

        return buffer;
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div ref={containerRef} className="mb-4" />
            
            <div className="flex gap-2">
                {!isRecording && !isPaused && (
                    <button onClick={startRecording} className="px-4 py-2 bg-red-500 text-white rounded">
                        Record
                    </button>
                )}
                {isRecording && (
                    <button onClick={pauseRecording} className="px-4 py-2 bg-yellow-500 text-white rounded">
                        Pause
                    </button>
                )}
                {isPaused && (
                    <>
                        <button onClick={resumeRecording} className="px-4 py-2 bg-blue-500 text-white rounded">
                            Resume
                        </button>
                        <button onClick={stopRecording} className="px-4 py-2 bg-gray-500 text-white rounded">
                            Stop
                        </button>
                    </>
                )}
                {recordedChunks.length > 0 && (
                    <>
                        <button onClick={playRecording} className="px-4 py-2 bg-green-500 text-white rounded">
                            Play
                        </button>
                        <button onClick={submitAudio} className="px-4 py-2 bg-purple-500 text-white rounded">
                            Submit
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VoiceCapture