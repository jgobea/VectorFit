import { QuickPoseView } from '@quickpose/react-native';
import { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiveReviewBottomPanel } from '@/components/features/live-review/LiveReviewBottomPanel';
import { LiveReviewTopBar } from '@/components/features/live-review/LiveReviewTopBar';
import { RestTimer } from '@/components/features/live-review/RestTimer';
import { SessionSummaryModal } from '@/components/features/live-review/SessionSummaryModal';
import { usePoseSession, type LiveReviewSummary, type SessionConfig } from '@/hooks/usePoseSession';
import { QUICKPOSE_BASE_FEATURES, QUICKPOSE_OVERLAY_STYLE, QUICKPOSE_SDK_KEY } from '@/lib/quickpose';

type WorkoutStage = 'session' | 'resting' | 'summary';

interface LiveReviewWorkoutProps {
  config: SessionConfig;
  onExit: () => void;
}

// Owns usePoseSession for the whole workout so per-set tallies survive set
// transitions.
//
// QuickPoseView's native teardown (onViewDetachedFromWindow AND
// onDropViewInstance both call quickPose.stop(), which blocks the UI thread
// on a native Graph.nativeWaitUntilGraphDone wait — this is a QuickPose SDK
// bug, not something fixable from JS) freezes the app for 5+ seconds
// (Android ANR territory) every time it unmounts. There is no way to avoid
// this entirely — some unmount has to happen eventually — but it only needs
// to happen ONCE per Live Review visit, not once per set. So: QuickPoseView
// is mounted here unconditionally for the component's whole lifetime;
// 'resting' and 'summary' are both rendered as overlays on top of it
// (RestTimer opaque, SessionSummaryModal a native Modal) rather than
// replacing the tree. The one unavoidable freeze happens when `onExit` (the
// user's own "Save Session" tap, once already told they're done) unmounts
// this whole component.
export function LiveReviewWorkout({ config, onExit }: LiveReviewWorkoutProps) {
  const session = usePoseSession(config);
  const [stage, setStage] = useState<WorkoutStage>('session');
  const [summary, setSummary] = useState<LiveReviewSummary | null>(null);

  const features = [config.exercise.quickpose_feature!, ...QUICKPOSE_BASE_FEATURES];

  const handleFinishSet = () => {
    if (session.isLastSet) {
      session.finishWorkout().then((result) => {
        setSummary(result);
        setStage('summary');
      });
    } else {
      session.finishSet();
      session.setIsPaused(true);
      setStage('resting');
    }
  };

  const handleStartNextSet = () => {
    session.setIsPaused(false);
    setStage('session');
  };

  const handleStop = () => {
    session.finishWorkout().then((result) => {
      setSummary(result);
      setStage('summary');
    });
  };

  const handleDiscard = () => {
    session.discardSession().then(onExit);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />
      <QuickPoseView
        sdkKey={QUICKPOSE_SDK_KEY ?? ''}
        features={features}
        useFrontCamera
        style={{ flex: 1 }}
        featureStyles={{ 'overlay.wholeBody': QUICKPOSE_OVERLAY_STYLE }}
        onUpdate={session.onUpdate}
      />
      {stage === 'resting' && (
        <View className="absolute bottom-0 left-0 right-0 top-0">
          <RestTimer
            restSeconds={config.restSeconds}
            nextSetNumber={session.currentSet}
            coachFeedback={session.coachFeedback}
            isFetchingCoachFeedback={session.isFetchingCoachFeedback}
            onStartNextSet={handleStartNextSet}
          />
        </View>
      )}
      {stage === 'session' && (
        <>
          <SafeAreaView edges={['top']} className="absolute left-0 right-0 top-0">
            <LiveReviewTopBar exerciseName={config.exercise.name} onClose={handleStop} />
          </SafeAreaView>
          <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0">
            <LiveReviewBottomPanel
              formScore={session.formScore}
              feedbackText={session.feedbackText}
              reps={session.reps}
              targetReps={session.targetReps}
              currentSet={session.currentSet}
              totalSets={session.totalSets}
              isPaused={session.isPaused}
              isSetComplete={session.isSetComplete}
              isLastSet={session.isLastSet}
              onTogglePause={() => session.setIsPaused((p) => !p)}
              onStop={handleStop}
              onFinishSet={handleFinishSet}
            />
          </SafeAreaView>
        </>
      )}
      <SessionSummaryModal
        visible={stage === 'summary'}
        exerciseName={config.exercise.name}
        totalSets={config.totalSets}
        summary={summary}
        coachFeedback={session.coachFeedback}
        isFetchingCoachFeedback={session.isFetchingCoachFeedback}
        onDone={onExit}
        onDiscard={handleDiscard}
      />
    </View>
  );
}
