<template>
	<div class="bg-gradient-to-br from-[#f9fafb] via-[#f3f4f6] to-[#e5e7eb]">
		<Transition>
			<div v-show="loading">
				<loading />
			</div>
		</Transition>
		<Transition>
			<div
				v-show="!loading"
				class="scroll-container h-screen overflow-y-scroll"
			>
				<div class="h-[1000vh]">
					<div
						ref="bgRef"
						class="fixed top-0 left-0 w-full h-full pointer-events-none"
						:style="currentStyle"
					></div>

					<div class="fixed top-50 left-50 z-10">
						<div class="flex flex-row flex-wrap gap-12">
							<div id="video">
								<video-frame-player
									ref="videoFramePlayer"
									@preload-completed="loading = false"
								/>
							</div>
							<div id="text">
								<h1
									:class="`header-${currentIndex}`"
									class="text-9xl text-black font-clean"
								>
									{{ currentHeader }}
								</h1>
								<h2
									:class="`paragraph-${currentIndex}`"
									class="text-4xl text-black font-clean"
								>
									{{ currentParagraph }}
								</h2>
							</div>
						</div>
					</div>
				</div>

				<div class="fixed bottom-3 right-3">
					<div class="flex flex-row items-center gap-3">
						<span>Sayfayı kaydırın</span>
						<scroll-down-icon :width="'20'" />
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script>
import { useScrollTimeline } from "./composables/useScrollTimeline.js";
import VideoFramePlayer from "./components/VideoFramePlayer.vue";
import Loading from "./components/Loading.vue";
import ScrollDownIcon from "./components/ScrollDownIcon.vue";

import { watch, ref } from "vue";

export default {
	components: {
		VideoFramePlayer,
		Loading,
		ScrollDownIcon,
	},
	setup() {
		const videoFramePlayer = ref(null);
		const loading = ref(true);

		const scenes = [
			{
				header: "Scena 1",
				paragraph: "First scena text",
				style: {},
			},
			{
				header: "Scene 2",
				paragraph: "Second scene text",
				style: {},
			},
			{
				header: "Scene 3",
				paragraph: "Third scene text",
				style: {},
			},
		];

		const {
			currentIndex,
			currentHeader,
			currentParagraph,
			currentStyle,
			currentProgress,
		} = useScrollTimeline(scenes);

		watch(currentProgress, (val) => {
			if (videoFramePlayer.value) {
				videoFramePlayer.value.updateFrame(val);
			}
		});

		return {
			loading,
			videoFramePlayer,
			currentProgress,
			currentIndex,
			currentHeader,
			currentParagraph,
			currentStyle,
		};
	},
};
</script>

<style>
.v-enter-active,
.v-leave-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
