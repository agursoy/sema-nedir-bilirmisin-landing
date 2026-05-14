<template>
	<div class="bg-snb-bg-default">
		<Transition>
			<div v-show="loading">
				<loading :video-frame-w="videoFrameW" :video-frame-h="videoFrameH" />
			</div>
		</Transition>
		<Transition>
			<div
				v-show="!loading"
				class="scroll-container h-screen overflow-y-scroll"
			>
				<div
					ref="bgRef"
					class="fixed top-0 left-0 w-full h-full pointer-events-none z-30"
					:style="currentStyle"
				></div>
				<div class="relative" :class="scrollHeight">
					<div class="sticky top-1/2 -translate-y-1/2 w-full">
						<div
							class="flex flex-col md:flex-row flex-wrap gap-4 md:gap-12 justify-center items-center"
						>
							<div id="video" :style="videoSplitStyle">
								<video-frame-player
									:canvas_w="videoFrameW"
									:canvas_h="videoFrameH"
									ref="videoFramePlayer"
									@preload-completed="loading = false"
								/>
							</div>
							<div
								id="text"
								class="w-full md:w-96 relative md:-mt-0 md:ml-0 p-5 contain-layout"
								:style="textSplitStyle"
							>
								<div class="relative">
									<h1
										:id="`header-${currentIndex}`"
										:class="`header-${currentIndex}`"
										class="text-lg md:text-5xl text-snb-text-default font-clean"
									>
										{{ currentHeader }}
									</h1>
									<h2
										:id="`paragraph-${currentIndex}`"
										:class="`paragraph-${currentIndex}`"
										class="text-md md:text-xl text-snb-text-default font-clean pt-6"
									>
										{{ currentParagraph }}
									</h2>
								</div>
								<scroll-down-message-bar
									:isScrolling="isScrolling"
									:isFinished="currentProgress >= 0.90"
								></scroll-down-message-bar>
							</div>
						</div>
						<ticket-modal :progress="splitProgress" />
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script>
import { useScrollTimeline } from "./composables/useScrollTimeline.js";
import { useSplitAnimation } from "./composables/useSplitAnimation.js";
import VideoFramePlayer from "./components/VideoFramePlayer.vue";
import ScrollDownMessageBar from "./components/ScrollDownMessageBar.vue";
import Loading from "./components/Loading.vue";
import TicketModal from "./components/TicketModal.vue";

import { watch, ref } from "vue";

export default {
	components: {
		VideoFramePlayer,
		Loading,
		ScrollDownMessageBar,
		TicketModal,
	},
	setup() {
		const videoFramePlayer = ref(null);
		const loading = ref(true);

		const isMobile =
			/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
			window.innerWidth < 768;

		const videoFrameW = ref(isMobile ? 360 : 720);
		const videoFrameH = ref(isMobile ? 203 : 405);
		const scrollHeight = ref(isMobile ? "h-[500vh]" : "h-[1000vh]");

		let isScrollingTimerId;
		const isScrolling = ref(false);

		const scenes = [
			{
				header: "SEMA NEDİR BİLİR MİSİN?",
				paragraph:
					"Bilir misin sema nedir; 'Belâ' (Evet) sesini işitmek, Hakk'a ulaşıp, kendini kendinden kesmektir Bilir misin sema nedir; varlıktan habersiz olmak Mutlak fanilik içinde ebedilik zevkini tatmaktır",
				style: {},
			},
			{
				header: "Sultan Veled Devri",
				paragraph:
					"İnsan yeryüzüne indirilmiştir. Dünya kaotik, renkli ve aldatıcıdır. Kalabalık caddeler, geçici sevinçler ve bitmeyen arayışlar arasında insan savrulur.",
				style: {},
			},
			{
				header: "Scene 3",
				paragraph:
					"İnsan yeryüzüne indirilmiştir. Dünya kaotik, renkli ve aldatıcıdır. Kalabalık caddeler, geçici sevinçler ve bitmeyen arayışlar arasında insan savrulur.",
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

		const { splitProgress, videoSplitStyle, textSplitStyle } =
			useSplitAnimation(currentProgress, isMobile);

		watch(currentProgress, (val) => {
			updateIsScrolling();

			if (videoFramePlayer.value) {
				videoFramePlayer.value.updateFrame(val);
			}
		});

		const updateIsScrolling = () => {
			isScrolling.value = true;
			clearTimeout(isScrollingTimerId);
			isScrollingTimerId = setTimeout(() => {
				isScrolling.value = false;
			}, 600);
		};

		return {
			loading,
			videoFramePlayer,
			currentProgress,
			currentIndex,
			currentHeader,
			currentParagraph,
			currentStyle,
			videoFrameW,
			videoFrameH,
			isScrolling,
			scrollHeight,
			splitProgress,
			videoSplitStyle,
			textSplitStyle,
		};
	},
};
</script>

<style>
.v-enter-active,
.v-leave-active {
	transition: opacity 3s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}

.contain-layout {
	contain: layout style;
}
</style>
