import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatusBar } from "@/components/status-bar";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MilestoneTracker } from "@/components/milestone-tracker";
import { NotificationSettings } from "@/components/notification-settings";
import { NotificationTest } from "@/components/notification-test";
import { SimpleProgressTracker } from "@/components/simple-progress-tracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Calendar, Award, Bell, Settings, Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUserName, setUserName, clearUserPrefs } from "@/lib/user-prefs";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType, UserProgress, UserHackCompletion } from "@shared/schema";

const DEMO_USER_ID = "1";

export default function Profile() {
  const { data: user } = useQuery<UserType>({
    queryKey: [`/api/users/${DEMO_USER_ID}`],
  });

  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: [`/api/users/${DEMO_USER_ID}/progress`],
  });

  const { data: hackCompletions = [] } = useQuery<UserHackCompletion[]>({
    queryKey: [`/api/users/${DEMO_USER_ID}/hack-completions`],
  });

  const completedSessions = userProgress.filter(p => p.completed).length;
  const totalMinutesPracticed = userProgress.reduce((total, p) => {
    // Estimate based on completion - in real app would track actual time
    return total + (p.completed ? 15 : 0); // Average session length
  }, 0);

  const joinedDaysAgo = user?.joinedAt 
    ? Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [courseFormat, setCourseFormat] = useState<string>(user?.courseFormat || "8-week");

  const handleReset = () => {
    clearUserPrefs();
    // Hard reload so App.tsx re-reads isOnboarded() from fresh localStorage
    window.location.reload();
  };

  const updateCourseFormatMutation = useMutation({
    mutationFn: async (format: string) => {
      await apiRequest("PUT", `/api/users/${DEMO_USER_ID}/course-format`, { courseFormat: format });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}`] });
      toast({
        title: "Course Format Updated",
        description: "Your course format has been changed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update course format.",
        variant: "destructive",
      });
    },
  });

  const handleCourseFormatChange = (value: string) => {
    setCourseFormat(value);
    updateCourseFormatMutation.mutate(value);
  };

  return (
    <>
      <StatusBar />
      
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-primary">Profile</h1>
            <p className="text-sm text-muted-foreground">Your mindfulness journey</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 pb-24">
        
        {/* Profile Hero */}
        <div className="mb-6 rounded-3xl shadow-xl overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600">
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 shadow-inner shrink-0">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-white leading-tight truncate">
                  {getUserName() || "Explorer"}
                </h2>
                <p className="text-white/70 text-sm mt-0.5">Coming to Our Senses</p>
                <span className="inline-block mt-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {joinedDaysAgo} days on the journey
                </span>
              </div>
            </div>
            {/* Week progress bar */}
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <div className="flex justify-between text-white/70 text-xs mb-2">
                <span className="font-semibold">Week {user?.currentWeek || 1} of 8</span>
                <span>{Math.round(((user?.currentWeek || 1) / 8) * 100)}% complete</span>
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5,6,7,8].map(w => (
                  <div
                    key={w}
                    className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                      w <= (user?.currentWeek || 1) ? 'bg-white shadow-sm' : 'bg-white/25'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Travelling Lighter Community */}
        <a
          href="https://comingtooursenses.org/travelling-lighter"
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-6"
        >
          <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-br from-stone-50 to-gray-100">
                <img
                  src="/attached_assets/travellinglighter.jpg"
                  alt="Travelling Lighter"
                  className="w-20 h-20 object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-0.5">
                    Community of Practice
                  </p>
                  <h3 className="text-base font-semibold text-gray-800 leading-tight">
                    A Travelling Lighter
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">
                    Join a growing community exploring mindfulness in everyday life.
                  </p>
                  <span className="inline-block mt-2 text-xs font-semibold text-blue-600">
                    Subscribe →
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>

        {/* Tabbed Content */}
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Journey
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <SimpleProgressTracker userId={DEMO_USER_ID} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-6">
            {/* Stats metric tiles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-5 text-center shadow-xl shadow-emerald-100">
                <div className="text-4xl font-bold text-white">{completedSessions}</div>
                <div className="text-white/80 text-xs font-semibold mt-1 uppercase tracking-wide">Sessions</div>
              </div>
              <div className="bg-gradient-to-br from-violet-400 to-purple-500 rounded-3xl p-5 text-center shadow-xl shadow-violet-100">
                <div className="text-4xl font-bold text-white">{totalMinutesPracticed}</div>
                <div className="text-white/80 text-xs font-semibold mt-1 uppercase tracking-wide">Minutes</div>
              </div>
              <div className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-3xl p-5 text-center shadow-xl shadow-rose-100">
                <div className="text-4xl font-bold text-white">{hackCompletions.length}</div>
                <div className="text-white/80 text-xs font-semibold mt-1 uppercase tracking-wide">Handy Hacks</div>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-5 text-center shadow-xl shadow-amber-100">
                <div className="text-4xl font-bold text-white">
                  {joinedDaysAgo}
                </div>
                <div className="text-white/80 text-xs font-semibold mt-1 uppercase tracking-wide">Days In</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6 mt-6">
            {/* Milestone Tracker */}
            <MilestoneTracker userId={DEMO_USER_ID} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Course Format Settings */}
            <Card className="overflow-hidden border-0">
              <CardHeader className="bg-gradient-to-br from-amber-400 to-orange-500">
                <CardTitle className="flex items-center gap-2 text-white">
                  <CalendarIcon className="h-5 w-5 text-white/90" />
                  Course Format
                </CardTitle>
                <CardDescription className="text-white/80">
                  Three delivery models — each offers a complete experience in its own way
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={courseFormat} onValueChange={handleCourseFormatChange}>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="8-week" id="8-week" />
                    <div className="flex-1">
                      <Label htmlFor="8-week" className="font-semibold cursor-pointer">
                        8-Week Course
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        One session per week — space to integrate and practice between sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="4-week" id="4-week" />
                    <div className="flex-1">
                      <Label htmlFor="4-week" className="font-semibold cursor-pointer">
                        4-Week Course
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Two sessions per week — a concentrated journey over a shorter period
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="3-day" id="3-day" />
                    <div className="flex-1">
                      <Label htmlFor="3-day" className="font-semibold cursor-pointer">
                        3-Day Intensive
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        All sessions across three full days — immersive and transformative
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                {user?.courseFormat && (
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    Current format: <span className="font-semibold">{user.courseFormat}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <NotificationSettings userId={DEMO_USER_ID} />

            {/* Notification Test Center */}
            <NotificationTest />

            {/* Reset onboarding */}
            <Card className="border-red-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-red-600">
                  <RotateCcw className="h-4 w-4" />
                  Reset &amp; Restart
                </CardTitle>
                <CardDescription className="text-xs">
                  Clears your name and replays the intro slideshow. Your practice progress is kept.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 w-full"
                  onClick={handleReset}
                >
                  Reset intro &amp; re-enter name
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </>
  );
}
