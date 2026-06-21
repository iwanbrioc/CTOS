import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Sun, 
  Moon, 
  Heart, 
  Target, 
  Zap, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  CheckCircle,
  Clock
} from "lucide-react";
import type { JournalEntry, InsertJournalEntry } from "@shared/schema";

interface DailyJournalProps {
  userId: string;
}

export function DailyJournal({ userId }: DailyJournalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Today's journal entry state
  const [todayEntry, setTodayEntry] = useState<Partial<InsertJournalEntry>>({});
  const [isRecording, setIsRecording] = useState<{ morning: boolean; evening: boolean }>({
    morning: false,
    evening: false
  });
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPlaying, setIsPlaying] = useState<{ morning: boolean; evening: boolean }>({
    morning: false,
    evening: false
  });
  const [audioElements, setAudioElements] = useState<{ morning: HTMLAudioElement | null; evening: HTMLAudioElement | null }>({
    morning: null,
    evening: null
  });
  const [isTranscribing, setIsTranscribing] = useState<{ morning: boolean; evening: boolean }>({
    morning: false,
    evening: false
  });
  const [recordedBlobs, setRecordedBlobs] = useState<{ morning: Blob | null; evening: Blob | null }>({
    morning: null,
    evening: null
  });
  const [audioLevel, setAudioLevel] = useState<{ morning: number; evening: number }>({
    morning: 0,
    evening: 0
  });
  const [currentRecordingType, setCurrentRecordingType] = useState<'morning' | 'evening' | null>(null);
  const [waveformData, setWaveformData] = useState<{ morning: number[]; evening: number[] }>({
    morning: Array(50).fill(0),
    evening: Array(50).fill(0)
  });
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');

  // Get today's date for filtering
  const today = new Date().toDateString();
  
  const { data: journalEntries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/users", userId, "journal"],
  });

  // Find today's entry
  const todaysEntry = journalEntries.find(entry => 
    new Date(entry.date || '').toDateString() === today
  );

  // Initialize form with today's entry if it exists
  useEffect(() => {
    if (todaysEntry) {
      setTodayEntry({
        gratitude1: todaysEntry.gratitude1 || '',
        gratitude2: todaysEntry.gratitude2 || '',
        gratitude3: todaysEntry.gratitude3 || '',
        highValuePriority1: todaysEntry.highValuePriority1 || '',
        highValuePriority2: todaysEntry.highValuePriority2 || '',
        highValuePriority3: todaysEntry.highValuePriority3 || '',
        highFlowPriority1: todaysEntry.highFlowPriority1 || '',
        highFlowPriority2: todaysEntry.highFlowPriority2 || '',
        highFlowPriority3: todaysEntry.highFlowPriority3 || '',
        scriptingText: todaysEntry.scriptingText || '',
        reflectionText: todaysEntry.reflectionText || '',
        morningCompleted: todaysEntry.morningCompleted || false,
        eveningCompleted: todaysEntry.eveningCompleted || false,
      });
    }
  }, [todaysEntry]);

  const saveMutation = useMutation({
    mutationFn: async (entryData: Partial<InsertJournalEntry>) => {
      if (todaysEntry?.id) {
        // Update existing entry
        await apiRequest("PUT", `/api/users/${userId}/journal/${todaysEntry.id}`, entryData);
      } else {
        // Create new entry
        await apiRequest("POST", `/api/users/${userId}/journal`, entryData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "journal"] });
      toast({
        title: "Journal Saved",
        description: "Your entry has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save journal entry.",
        variant: "destructive",
      });
    },
  });

  const updateField = (field: keyof InsertJournalEntry, value: string | boolean) => {
    setTodayEntry(prev => ({ ...prev, [field]: value }));
  };

  const saveMorningRoutine = async () => {
    await saveMutation.mutateAsync({
      ...todayEntry,
      morningCompleted: true,
    });
  };

  const saveEveningRoutine = async () => {
    await saveMutation.mutateAsync({
      ...todayEntry,
      eveningCompleted: true,
    });
  };

  const startVoiceRecording = async (type: 'morning' | 'evening') => {
    toast({
      title: "Voice Recording Unavailable",
      description: "Voice recording is temporarily disabled. Please use text entry instead.",
      variant: "default",
    });
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const transcribeAudio = async (blob: Blob, type: 'morning' | 'evening') => {
    setIsTranscribing(prev => ({ ...prev, [type]: true }));
    
    try {
      const formData = new FormData();
      formData.append('audio', blob, `${type}-note.wav`);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { transcription } = await response.json();
      
      // Update the appropriate text field with transcription
      if (type === 'morning') {
        updateField('scriptingText', transcription);
      } else {
        updateField('reflectionText', transcription);
      }

      toast({
        title: "Transcription Complete",
        description: `Your ${type} voice note has been transcribed.`,
      });
    } catch (error) {
      toast({
        title: "Transcription Failed",
        description: "Unable to transcribe audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(prev => ({ ...prev, [type]: false }));
    }
  };

  const playVoiceNote = (type: 'morning' | 'evening') => {
    const voiceNote = type === 'morning' ? todayEntry.scriptingVoiceNote : todayEntry.reflectionVoiceNote;
    if (!voiceNote) return;

    if (audioElements[type]) {
      audioElements[type]?.pause();
      audioElements[type]?.remove();
    }

    const audio = new Audio(voiceNote);
    audio.onplay = () => setIsPlaying({ ...isPlaying, [type]: true });
    audio.onpause = () => setIsPlaying({ ...isPlaying, [type]: false });
    audio.onended = () => setIsPlaying({ ...isPlaying, [type]: false });
    
    setAudioElements({ ...audioElements, [type]: audio });
    audio.play();
  };

  const stopVoiceNote = (type: 'morning' | 'evening') => {
    if (audioElements[type]) {
      audioElements[type]?.pause();
      audioElements[type]!.currentTime = 0;
      setIsPlaying({ ...isPlaying, [type]: false });
    }
  };

  if (isLoading) {
    return (
      <div className="-mx-6 px-6 pt-6 pb-8 space-y-4 bg-gradient-to-b from-amber-50 to-white min-h-screen">
        <div className="h-6 w-40 bg-amber-200/60 rounded-full animate-pulse mx-auto" />
        <div className="h-14 bg-white/70 rounded-2xl animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-white/70 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  const morningDone = !!todayEntry.morningCompleted;
  const eveningDone = !!todayEntry.eveningCompleted;

  return (
    <div className={`-mx-6 px-6 pt-5 pb-8 min-h-screen transition-colors duration-700 ${
      activeTab === 'morning'
        ? 'bg-gradient-to-b from-amber-50 via-orange-50/60 to-white'
        : 'bg-gradient-to-b from-indigo-50 via-blue-50/50 to-white'
    }`}>

      {/* Date */}
      <div className="text-center mb-5">
        <p className={`text-xs font-semibold tracking-widest uppercase mb-0.5 transition-colors duration-500 ${
          activeTab === 'morning' ? 'text-amber-500' : 'text-indigo-400'
        }`}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
        </p>
        <h2 className="text-xl font-bold text-gray-900">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm mb-6 gap-1">
        <button
          onClick={() => setActiveTab('morning')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'morning'
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md'
              : 'text-gray-400'
          }`}
        >
          <Sun className="h-4 w-4" />
          Morning
          {morningDone && <CheckCircle className="h-3.5 w-3.5 opacity-90" />}
        </button>
        <button
          onClick={() => setActiveTab('evening')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeTab === 'evening'
              ? 'bg-gradient-to-r from-indigo-400 to-blue-600 text-white shadow-md'
              : 'text-gray-400'
          }`}
        >
          <Moon className="h-4 w-4" />
          Evening
          {eveningDone && <CheckCircle className="h-3.5 w-3.5 opacity-90" />}
        </button>
      </div>

      {/* ── Morning ──────────────────────────────────── */}
      {activeTab === 'morning' && (
        <div className="space-y-4">

          {/* Gratitude */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-rose-400 to-pink-500 px-5 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">3 Things I'm Grateful For</h3>
                <p className="text-white/75 text-xs mt-0.5">Start your day with appreciation</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[1, 2, 3].map(num => (
                <div key={num} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 text-xs font-bold flex items-center justify-center shrink-0">
                    {num}
                  </span>
                  <Input
                    placeholder="I'm grateful for..."
                    value={todayEntry[`gratitude${num}` as keyof InsertJournalEntry] as string || ''}
                    onChange={e => updateField(`gratitude${num}` as keyof InsertJournalEntry, e.target.value)}
                    className="border-rose-100 bg-rose-50/40 focus-visible:ring-rose-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* High Value */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-blue-400 to-indigo-600 px-5 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">3 High Value Priorities</h3>
                <p className="text-white/75 text-xs mt-0.5">What matters most today</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[1, 2, 3].map(num => (
                <div key={num} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-500 text-xs font-bold flex items-center justify-center shrink-0">
                    {num}
                  </span>
                  <Input
                    placeholder="Important task..."
                    value={todayEntry[`highValuePriority${num}` as keyof InsertJournalEntry] as string || ''}
                    onChange={e => updateField(`highValuePriority${num}` as keyof InsertJournalEntry, e.target.value)}
                    className="border-blue-100 bg-blue-50/40 focus-visible:ring-blue-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* High Flow */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-5 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">3 High Flow Priorities</h3>
                <p className="text-white/75 text-xs mt-0.5">Activities that energise you</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[1, 2, 3].map(num => (
                <div key={num} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {num}
                  </span>
                  <Input
                    placeholder="Energising activity..."
                    value={todayEntry[`highFlowPriority${num}` as keyof InsertJournalEntry] as string || ''}
                    onChange={e => updateField(`highFlowPriority${num}` as keyof InsertJournalEntry, e.target.value)}
                    className="border-amber-100 bg-amber-50/40 focus-visible:ring-amber-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Script */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-purple-400 to-violet-600 px-5 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center shrink-0">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">Script Your Day</h3>
                <p className="text-white/75 text-xs mt-0.5">Write how you want your day to unfold</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <Textarea
                placeholder="Today I will..."
                value={todayEntry.scriptingText as string || ''}
                onChange={e => updateField('scriptingText', e.target.value)}
                rows={4}
                className="border-purple-100 bg-purple-50/20 focus-visible:ring-purple-300"
              />
            </div>
          </div>

          <button
            onClick={saveMorningRoutine}
            disabled={saveMutation.isPending}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold text-base shadow-lg shadow-orange-200/60 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {morningDone ? '✓  Morning Routine Updated' : 'Complete Morning Routine →'}
          </button>
        </div>
      )}

      {/* ── Evening ──────────────────────────────────── */}
      {activeTab === 'evening' && (
        <div className="space-y-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-400 to-blue-600 px-5 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center shrink-0">
                <Moon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">Daily Reflection</h3>
                <p className="text-white/75 text-xs mt-0.5">Close the day with awareness and compassion</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <Textarea
                placeholder="How did your day unfold? What did you learn? What are you grateful for? What would you do differently?"
                value={todayEntry.reflectionText as string || ''}
                onChange={e => updateField('reflectionText', e.target.value)}
                rows={7}
                className="border-indigo-100 bg-indigo-50/20 focus-visible:ring-indigo-300"
              />
            </div>
          </div>

          <button
            onClick={saveEveningRoutine}
            disabled={saveMutation.isPending}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-400 to-blue-600 text-white font-semibold text-base shadow-lg shadow-indigo-200/60 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {eveningDone ? '✓  Evening Reflection Updated' : 'Complete Evening Reflection →'}
          </button>
        </div>
      )}

      {/* Completion tiles */}
      <div className="mt-6 flex gap-3">
        <div className={`flex-1 rounded-2xl p-4 text-center transition-all duration-500 ${
          morningDone
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200/50'
            : 'bg-white/60 border border-white'
        }`}>
          <Sun className={`h-5 w-5 mx-auto mb-1.5 ${morningDone ? 'text-white' : 'text-gray-300'}`} />
          <p className={`text-xs font-semibold ${morningDone ? 'text-white' : 'text-gray-400'}`}>Morning</p>
          <p className={`text-xs mt-0.5 ${morningDone ? 'text-white/75' : 'text-gray-300'}`}>
            {morningDone ? 'Complete ✓' : 'Pending'}
          </p>
        </div>
        <div className={`flex-1 rounded-2xl p-4 text-center transition-all duration-500 ${
          eveningDone
            ? 'bg-gradient-to-br from-indigo-400 to-blue-600 shadow-lg shadow-indigo-200/50'
            : 'bg-white/60 border border-white'
        }`}>
          <Moon className={`h-5 w-5 mx-auto mb-1.5 ${eveningDone ? 'text-white' : 'text-gray-300'}`} />
          <p className={`text-xs font-semibold ${eveningDone ? 'text-white' : 'text-gray-400'}`}>Evening</p>
          <p className={`text-xs mt-0.5 ${eveningDone ? 'text-white/75' : 'text-gray-300'}`}>
            {eveningDone ? 'Complete ✓' : 'Pending'}
          </p>
        </div>
      </div>
    </div>
  );
}