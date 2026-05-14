import { computed } from "vue";

export function useSplitAnimation(currentProgress, isMobile) {
	const splitProgress = computed(() => {
		return Math.max(0, Math.min(1, (currentProgress.value - 0.92) / 0.08));
	});

	const videoSplitStyle = computed(() => {
		const p = splitProgress.value;
		if (p === 0) return {};
		return {
			transform: `translateY(-${p * 50}vh)`,
			opacity: 1 - p
		};
	});

	const textSplitStyle = computed(() => {
		const p = splitProgress.value;
		if (p === 0) return {};
		return {
			transform: `translateY(${p * 50}vh)`,
			opacity: 1 - p
		};
	});

	return {
		splitProgress,
		videoSplitStyle,
		textSplitStyle,
	};
}
